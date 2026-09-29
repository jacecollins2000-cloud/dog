'use client';
/* Pre-optimized WebP artwork; plain img keeps the static export independent of an image server. */
/* oxlint-disable next/no-img-element */

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Pause, Play } from 'lucide-react';
import { arrivalLightAt, SWITCH_LIGHT } from './arrival-timing';

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const easeLight = (value: number) => value * value * (3 - 2 * value);
function savePlayback(value: 'play' | 'pause') {
  try { localStorage.setItem('gc-film-playback', value); } catch { /* Storage is optional. */ }
}

export function CampaignHero() {
  const video = useRef<HTMLVideoElement>(null);
  const stage = useRef<HTMLElement>(null);
  const manualChoice = useRef<'play' | 'pause' | null>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [animate, setAnimate] = useState(false);

  function finishArrival(reason = 'complete') {
    window.dispatchEvent(new CustomEvent('gc-arrival-finish', { detail: reason }));
    document.documentElement.dataset.gcArrival = 'lit';
  }

  function paint(time: number, duration: number) {
    const live = easeLight(clamp((time - SWITCH_LIGHT) / .24));
    const different = easeLight(clamp((time - SWITCH_LIGHT - .045) / .3));
    const ending = Number.isFinite(duration) ? clamp((duration - time) / .48) : 1;
    stage.current?.style.setProperty('--scene-light', String(ending));
    stage.current?.style.setProperty('--live-reveal', String(live));
    stage.current?.style.setProperty('--different-reveal', String(different));
    stage.current?.toggleAttribute('data-copy-dark', different < .05);
    stage.current?.style.setProperty('--film-progress', String(Number.isFinite(duration) ? time / duration : 0));
    // Phone framing follows the edit: weighted right for the light switch, then easing to the group across the dissolve at ~8.6s.
    stage.current?.style.setProperty('--film-x', `${(100 - easeLight(clamp((time - 8.45) / .4)) * 65).toFixed(1)}%`);
    if (document.documentElement.dataset.gcArrival === 'dark') {
      const { light, veil } = arrivalLightAt(time);
      document.documentElement.style.setProperty('--arrival-light', String(light));
      document.documentElement.style.setProperty('--arrival-veil', String(veil));
      if (light >= 1) finishArrival();
    }
  }

  function revealFirstFrame() {
    const root = document.documentElement;
    if (root.dataset.gcArrival === 'dark' && root.dataset.gcArrivalPlaying !== 'true') {
      root.dataset.gcArrivalPlaying = 'true';
    }
    paint(video.current?.currentTime ?? 0, video.current?.duration ?? 12);
    setPlaying(true); setStarted(true); setFailed(false);
  }

  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const motionParam = new URLSearchParams(location.search).get('motion');
    let previewMotion = motionParam === 'full';
    try {
      if (motionParam === 'full') sessionStorage.setItem('gc-preview-motion','full');
      if (motionParam === 'system') sessionStorage.removeItem('gc-preview-motion');
      previewMotion = sessionStorage.getItem('gc-preview-motion') === 'full';
    } catch { /* Query opt-in works without storage. */ }
    document.documentElement.dataset.gcMotion = previewMotion ? 'full' : 'system';
    const portrait = matchMedia('(max-width:760px)');
    const player = video.current;
    const apply = () => {
      let choice: string | null = null;
      try { choice = localStorage.getItem('gc-film-playback'); } catch { /* Use system preference. */ }
      const enabled = manualChoice.current ? manualChoice.current === 'play' : previewMotion || choice === 'play' || (choice !== 'pause' && !motion.matches);
      setAnimate(enabled);
      if (!enabled) { player?.pause(); finishArrival('motion'); }
      else void player?.play().catch(() => { setPlaying(false); finishArrival('playback'); });
    };
    apply();
    const reframe = () => { finishArrival('resize'); player?.load(); setStarted(false); apply(); };
    motion.addEventListener('change', apply);
    portrait.addEventListener('change', reframe);
    return () => { motion.removeEventListener('change', apply); portrait.removeEventListener('change', reframe); finishArrival('navigation'); };
  }, []);

  useEffect(() => {
    const player = video.current;
    if (!player || !playing) return;
    let frame = 0;
    const tick = () => { paint(player.currentTime, player.duration); frame = requestAnimationFrame(tick); };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  // As the visitor scrolls on, the film dims toward the black of the next chapter (independent of the arrival sequence).
  useEffect(() => {
    const hero = stage.current;
    if (!hero) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const calm = matchMedia('(prefers-reduced-motion: reduce)').matches && document.documentElement.dataset.gcMotion !== 'full';
      const leave = calm ? 0 : Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / Math.max(1, hero.offsetHeight)));
      hero.style.setProperty('--leave', leave.toFixed(4));
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', request);
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', request); removeEventListener('resize', request); };
  }, []);

  // Source errors never reach the <video> itself. When the last source fails, no format was playable:
  // show the campaign image and light the page now instead of holding it dark until the safety timeout.
  useEffect(() => {
    const player = video.current;
    const last = player?.querySelector('source:last-of-type');
    if (!player || !last) return;
    const unplayable = () => { setFailed(true); setPlaying(false); finishArrival('error'); };
    last.addEventListener('error', unplayable);
    if (player.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) unplayable();
    return () => last.removeEventListener('error', unplayable);
  }, []);

  // Off screen the film pauses (battery on phones) and resumes on return, unless the visitor paused it themselves.
  useEffect(() => {
    const hero = stage.current, player = video.current;
    if (!hero || !player || !('IntersectionObserver' in window)) return;
    let autoPaused = false, onScreen = true;
    // The arrival veil follows film time, so never pause while it is still holding the page dark.
    const settle = () => {
      if (document.documentElement.dataset.gcArrival === 'dark') return;
      if (!onScreen && !player.paused) { autoPaused = true; player.pause(); }
      else if (onScreen && autoPaused && manualChoice.current !== 'pause') { autoPaused = false; void player.play().catch(() => {}); }
    };
    // The strip of hero hidden under the sticky header doesn't count as on screen.
    const observer = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; settle(); }, { rootMargin: '-96px 0px 0px 0px' });
    observer.observe(hero);
    // The finish event fires just before the page is marked lit, so check again on the next task.
    const afterArrival = () => setTimeout(settle, 0);
    player.addEventListener('playing', settle);
    addEventListener('gc-arrival-finish', afterArrival);
    return () => { observer.disconnect(); player.removeEventListener('playing', settle); removeEventListener('gc-arrival-finish', afterArrival); };
  }, []);

  async function toggle() {
    const player = video.current;
    if (!player) return;
    if (!player.paused) { manualChoice.current = 'pause'; savePlayback('pause'); player.pause(); }
    else try { manualChoice.current = 'play'; savePlayback('play'); setAnimate(true); await player.play(); } catch { setFailed(true); }
  }
  const sequencing = started && animate && !failed;
  return <section ref={stage} className={`campaign-hero cinematic-opening ${sequencing ? 'is-sequenced' : ''}`} data-tone="dark" aria-label="Live Different!! campaign">
    <picture>
      <source media="(max-width:760px)" srcSet="/assets/gc-campaign-mobile-poster-v5.webp" />
      <img className="campaign-poster" src="/assets/gc-campaign-film-poster-v5.webp" alt="GC campaign concept: an adult dancer in a charcoal gorilla-mark hoodie lighting an empty studio" width="1280" height="720" fetchPriority="high" />
    </picture>
    <video ref={video} className={`campaign-film ${started && !failed ? 'is-playing' : ''}`} muted loop playsInline preload="auto" onPlay={() => setPlaying(true)} onPlaying={revealFirstFrame} onWaiting={() => { /* Keep the last decoded frame while mobile playback buffers. */ }} onPause={() => { setPlaying(false); const player = video.current; if (player && (player.currentTime < SWITCH_LIGHT + .75 || (Number.isFinite(player.duration) && player.currentTime > player.duration - .55))) setStarted(false); }} onCanPlay={() => { if (!video.current?.error) setFailed(false); }} onError={event => { if (event.currentTarget.error) { setFailed(true); finishArrival('error'); } }} aria-label="Guerrilla Camp campaign film">
      {/* MP4 first keeps Safari on the tuned file; browsers without H.264 fall through to the VP9 copy of the same edit. */}
      <source media="(max-width:760px)" src="/assets/gc-campaign-mobile-v8.mp4" type='video/mp4; codecs="avc1.640028"' />
      <source media="(max-width:760px)" src="/assets/gc-campaign-mobile-v8.webm" type='video/webm; codecs="vp9"' />
      <source src="/assets/gc-campaign-film-v8.mp4" type='video/mp4; codecs="avc1.640028"' />
      <source src="/assets/gc-campaign-film-v8.webm" type='video/webm; codecs="vp9"' />
    </video>
    <div className="campaign-blackout" aria-hidden="true" />
    <picture>
      <source media="(max-width:760px)" srcSet="/assets/gc-arrival-dim-mobile-v8.webp" />
      <img className="arrival-establishing-frame" src="/assets/gc-arrival-dim-desktop-v8.webp" alt="" width="1280" height="720" fetchPriority="high" loading="eager" />
    </picture>
    <div className="campaign-shade" />
    <div className="campaign-dim" aria-hidden="true" />
    {/* First in tab order, matching its place at the top of the film. */}
    {!failed && <button className="ambient-control" onClick={toggle} aria-label={playing ? 'Pause campaign film' : 'Play campaign film'} aria-pressed={playing}>{playing ? <Pause size={14} /> : <Play size={14} />}</button>}
    <div className="campaign-copy">
      <div className="gc-hero-row">
        <p className="gc-hero-meta"><span><span className="gc-nowrap">(Collection concept)</span> <span className="gc-nowrap">GC—001 · The hoodie</span></span><span>Illustrative AI film</span></p>
        <a className="gc-btn is-light campaign-discover" href="#collection">Shop the hoodie <ArrowDown size={17} aria-hidden="true" /></a>
      </div>
      {/* The founder's hand-painted slogan, pasted over the film on a strip of GC White paper. */}
      <h1 className="gc-hero-slogan"><span className="sr-only">Live Different!!</span><img src="/assets/gc-slogan-red.webp" alt="" width="1800" height="336" fetchPriority="high" /></h1>
    </div>
    {failed && <output className="film-status">Film unavailable. Campaign image shown.</output>}
  </section>;
}
