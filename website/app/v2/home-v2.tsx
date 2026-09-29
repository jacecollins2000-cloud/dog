'use client';
/* oxlint-disable next/no-img-element */
/* Native anchors keep page and section navigation compatible with static hosting (same as site.tsx). */
/* oxlint-disable next/no-html-link-for-pages */
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUp, ArrowUpRight, Plus, X } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { calmMotion, stableHeight, useScrollProgress } from '../use-scroll-progress';
import { TornEdge } from './paper';

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const ease = (value: number) => value * value * (3 - 2 * value);

/* ---------- Header: bare labels over the film, hides while reading down, returns on the way up ---------- */

export function V2Header({ bagCount, onBag }: { bagCount: number; onBag: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    let last = scrollY, frame = 0;
    const update = () => {
      frame = 0;
      const y = scrollY, delta = y - last;
      last = y;
      // The tone follows whichever section sits under the labels.
      let tone = 'dark';
      for (const section of document.querySelectorAll<HTMLElement>('[data-tone]')) {
        const box = section.getBoundingClientRect();
        if (box.top <= 34 && box.bottom > 34) tone = section.dataset.tone ?? tone;
      }
      header.dataset.tone = tone;
      header.classList.toggle('is-scrolled', y > 40);
      if (y < 90 || delta < -3) header.classList.remove('is-hidden');
      // Keyboard focus inside the header keeps it on screen.
      else if (delta > 5 && !header.querySelector(':focus-visible')) header.classList.add('is-hidden');
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', request);
    const reveal = () => header.classList.remove('is-hidden');
    header.addEventListener('focusin', reveal);
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', request); removeEventListener('resize', request); header.removeEventListener('focusin', reveal); };
  }, []);

  // Adding to the bag always brings the bag back into view.
  useEffect(() => { if (bagCount) ref.current?.classList.remove('is-hidden'); }, [bagCount]);

  const close = () => setMenuOpen(false);
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header ref={ref} className="v2-header" data-tone="dark">
      <nav className="v2-header-left" aria-label="Main navigation">
        <button className="v2-hlink v2-menu" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} aria-haspopup="dialog">Menu <Plus size={14} aria-hidden="true" /></button>
        <a className="v2-hlink v2-wide" href="#collection">Shop</a>
        <a className="v2-hlink v2-wide" href="#about">Behind GC</a>
        <a className="v2-hlink v2-wide" href="/teams">Teams <ArrowUpRight size={13} aria-hidden="true" /></a>
      </nav>
      <a href="/" className="v2-brand" aria-label="Guerrilla Camp home">
        <img src="/assets/gc-wordmark.svg" alt="" width="200" height="59" />
      </a>
      <div className="v2-header-right">
        <span className="v2-hmeta v2-wide">Nevada — Est. 2023</span>
        <button className="v2-hlink v2-bag" onClick={onBag} aria-label={`Open bag, ${bagCount} ${bagCount === 1 ? 'item' : 'items'}`}>Bag <span className="v2-bag-count">({bagCount})</span></button>
      </div>
    </header>
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetContent className="nav-sheet dark v2-sheet" showCloseButton={false}>
        <div className="sheet-top">
          <SheetTitle><img className="menu-wordmark" src="/assets/gc-wordmark.svg" alt="Guerrilla Camp" width="200" height="59" /></SheetTitle>
          <button className="icon-button" onClick={close} aria-label="Close navigation"><X /></button>
        </div>
        <SheetDescription className="sr-only">Explore the collection, brand and team program.</SheetDescription>
        <nav className="v2-menu-nav" aria-label="Mobile navigation">
          <a href="#collection" onClick={close}><span aria-hidden="true">01</span>The hoodie</a>
          <a href="#about" onClick={close}><span aria-hidden="true">02</span>Behind GC</a>
          <a href="#campaign" onClick={close}><span aria-hidden="true">03</span>Campaign</a>
          <a href="/teams" onClick={close}><span aria-hidden="true">04</span>For teams</a>
        </nav>
        <div className="v2-menu-foot">
          <a href="https://www.instagram.com/guerrilla_camp/" target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={14} aria-hidden="true" /></a>
          <span>Live Different!!</span>
        </div>
      </SheetContent>
    </Sheet>
  </>;
}

/* ---------- Tape: two strips of gaffer tape across the tear between the film and the shop ---------- */

const tapeWords = ['Live Different!!', 'Strength', 'Protection', 'Loyalty', 'Guerrilla Camp', 'Nevada — Est. 2023'];

function TapeRun({ copies = 6 }: { copies?: number }) {
  return <>{Array.from({ length: copies }, (_, n) => <span key={n} className="v2-tape-run">
    {tapeWords.map(word => <span key={word}><i>{word.endsWith('!!') ? <>{word.slice(0, -2)}<em>!!</em></> : word}</i><b>✱</b></span>)}
  </span>)}</>;
}

export function TapeMarquee() {
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = wrap.current;
    if (!root) return;
    const strips = Array.from(root.querySelectorAll<HTMLElement>('.v2-tape'));
    const tracks = strips.map(strip => strip.querySelector<HTMLElement>('.v2-tape-track')!);
    let x = 0, frame = 0, then = 0, lastY = scrollY, speed = 0;
    let runs = tracks.map(track => (track.firstElementChild as HTMLElement | null)?.offsetWidth || 1);
    const measure = () => { runs = tracks.map(track => (track.firstElementChild as HTMLElement | null)?.offsetWidth || 1); };
    addEventListener('resize', measure);
    void document.fonts?.ready.then(measure);
    const visible = new Set<Element>();
    const loop = (now: number) => {
      frame = 0;
      if (!visible.size || calmMotion()) { then = 0; return; }
      // Time-based, so the drift is the same at 60Hz and 120Hz; scrolling pushes the tape along with the page.
      const dt = then ? Math.min(.05, (now - then) / 1000) : 0;
      then = now;
      const y = scrollY, scrollSpeed = dt ? Math.min(2400, Math.abs(y - lastY) / dt) : 0;
      lastY = y;
      speed += (scrollSpeed - speed) * (1 - Math.exp(-dt * 8));
      x += (28 + speed * .9) * dt;
      tracks.forEach((track, i) => {
        const run = runs[i];
        const offset = x % run;
        track.style.transform = `translate3d(${i % 2 ? offset - run : -offset}px,0,0)`;
      });
      frame = requestAnimationFrame(loop);
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
      if (visible.size && !frame) frame = requestAnimationFrame(loop);
    });
    strips.forEach(strip => observer.observe(strip));
    return () => { observer.disconnect(); cancelAnimationFrame(frame); removeEventListener('resize', measure); };
  }, []);
  return <div ref={wrap} className="v2-tape-wrap" aria-hidden="true">
    <div className="v2-tape is-back"><div className="v2-tape-track"><TapeRun /></div></div>
    <div className="v2-tape is-front"><div className="v2-tape-track"><TapeRun /></div></div>
  </div>;
}

/* ---------- 02 Behind the mark: a torn seam switches the lights on across the photograph ---------- */

const values = ['Strength.', 'Protection.', 'Loyalty.'];

export function LightsOnChapter() {
  const ref = useScrollProgress<HTMLElement>((element, { top, height }) => {
    const stage = element.querySelector<HTMLElement>('.v2-lights-stage');
    const place = (on: number) => {
      element.style.setProperty('--on', on.toFixed(4));
      // The seam sits on whole device pixels, so its edges never render as a soft hairline.
      if (stage) element.style.setProperty('--x-px', `${Math.round((on * 1.05 - .05) * stage.clientWidth * devicePixelRatio) / devicePixelRatio}px`);
    };
    if (element.dataset.still) { place(1); return; }
    // Starts as the stage settles at the top, finishes 70% through the pin, then holds fully lit.
    const vh = stableHeight();
    const travelled = -top / Math.max(1, height - vh);
    place(ease(clamp((travelled - .04) / .66)));
  });
  // Decode both large photographs well before the chapter arrives, so the first seam frame never waits on the image.
  useEffect(() => {
    const element = ref.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      element.querySelectorAll('img').forEach(image => { image.loading = 'eager'; void image.decode?.().catch(() => {}); });
      observer.disconnect();
    }, { rootMargin: '150% 0px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return <section ref={ref} className="v2-lights" data-tone="dark" aria-labelledby="v2-lights-title">
    {/* "Behind GC" lands with the lights already on. */}
    <span id="about" className="v2-lights-anchor" aria-hidden="true" />
    <div className="v2-lights-stage">
      <div className="v2-lights-off" aria-hidden="true">
        <img src="/assets/lookbook-hood-up-halftone-v1.webp" alt="" width="1122" height="1402" loading="lazy" decoding="async" />
      </div>
      <div className="v2-lights-lip" aria-hidden="true" />
      <div className="v2-lights-on">
        <div className="v2-lights-on-photo">
          <img src="/assets/lookbook-hood-up-v1.webp" alt="Illustrative campaign: an adult in the charcoal GC Hoodie pulling the hood up at dusk" width="1122" height="1402" loading="lazy" decoding="async" />
        </div>
      </div>
      <div className="v2-lights-copy">
        <p className="v2-label"><span className="v2-num">02</span> / Behind the mark</p>
        <h2 id="v2-lights-title" className="v2-values">
          {values.map((value, i) => <span key={value} style={{ '--i': i } as React.CSSProperties}>{value}</span>)}
        </h2>
        <p className="v2-lights-line">A mind of your own — and people in your corner.</p>
        <small className="v2-note v2-lights-note">Illustrative campaign</small>
      </div>
      <img className="v2-lights-mark" src="/assets/gc-mark.svg" alt="Guerrilla Camp gorilla mark" width="140" height="160" loading="lazy" />
      <p className="v2-lights-state" aria-hidden="true"><span>← Lights on</span><span>Lights off</span></p>
    </div>
  </section>;
}

/* ---------- 03 The campaign: three posters wheat-pasted on a concrete wall ---------- */

const posters = [
  ['/assets/gc-print-own-v2.webp', 'Own it.', 'Individuality', 'Illustrative campaign artwork: a seated adult in the GC Hoodie framed by an oversized hood, with red halftone Own it typography'],
  ['/assets/gc-print-move-v3.webp', 'Move.', 'Action', 'Illustrative campaign artwork: an adult dancer in the GC Hoodie with vertical red Move typography'],
  ['/assets/gc-print-together-v3.webp', 'Together.', 'Loyalty', 'Illustrative campaign artwork: three adult friends in GC clothing with red Together typography'],
] as const;

export function PosterWall() {
  const ref = useScrollProgress<HTMLElement>();
  // Prepare the prints before a fast scroll or Campaign jump reaches the wall.
  // Low fetch priority leaves the opening film and product image first in line.
  useEffect(() => {
    ref.current?.querySelectorAll('img').forEach(image => {
      void image.decode().catch(() => {});
    });
  }, [ref]);
  return <section ref={ref} id="campaign" className="v2-wall" data-tone="dark" aria-labelledby="v2-wall-title">
    <div className="v2-wall-tape" aria-hidden="true"><span>{Array.from({ length: 8 }, (_, n) => <span key={n}><i>Own it.</i><b>✱</b><i>Move.</i><b>✱</b><i>Together.</i><b>✱</b><i>Live Different<em>!!</em></i><b>✱</b></span>)}</span></div>
    <header className="v2-wall-head">
      <p className="v2-label"><span className="v2-num">03</span> / The campaign</p>
      <h2 id="v2-wall-title">Individuality,<br />with a place to belong.</h2>
    </header>
    <div className="v2-wall-posters">
      {posters.map(([src, title, theme, alt], i) => <figure key={src} className="v2-poster" style={{ '--n': i } as React.CSSProperties}>
        <div className="v2-poster-sheet">
          <img src={src} alt={alt} width="1122" height="1402" loading="eager" fetchPriority="low" decoding="async" />
          <i className="v2-tape-bit is-a" aria-hidden="true" />
          <i className="v2-tape-bit is-b" aria-hidden="true" />
        </div>
        <figcaption><span>0{i + 1} / {theme}</span><span>{title}</span></figcaption>
      </figure>)}
    </div>
    <div className="v2-wall-foot">
      <a className="v2-brush is-light" href="#collection">Explore the hoodie <ArrowUp size={17} aria-hidden="true" /></a>
      <p className="v2-note">Illustrative campaign artwork, AI-generated for this concept.</p>
    </div>
  </section>;
}

/* ---------- 04 The world: photographs torn out of the page, titles set inside them ---------- */

const looks = [
  ['/assets/lookbook-court-dawn-v1.webp', 'First light', 'Illustrative campaign: an adult athlete in the GC Hoodie resting courtside at dawn', 1122, 1402, 'center 0%', ''],
  ['/assets/gc-onbody-studio-v1.webp', 'The studio', 'Illustrative campaign: an adult dancer in the charcoal GC Hoodie in a studio at dusk', 1122, 1402, 'center 0%', ''],
  ['/assets/lookbook-night-walk-v1.webp', 'Out the door', 'Illustrative campaign: two adult friends walking out of a studio into a night street, one in the GC Hoodie', 1536, 1024, 'center 0%', '/assets/lookbook-night-walk-tall-v1.webp'],
] as const;

function Look({ look, index }: { look: typeof looks[number]; index: number }) {
  const [src, title, alt, width, height, position, phone] = look;
  const ref = useScrollProgress<HTMLElement>();
  return <figure ref={ref} className={`v2-look is-${index + 1}`} style={{ '--pos': position } as React.CSSProperties}>
    <div className="v2-look-frame">
      <picture>
        {phone && <source media="(max-width: 899px)" srcSet={phone} />}
        <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
      </picture>
      <TornEdge edge="top" variant={index + 6} />
      <span className="v2-look-title" aria-hidden="true">{title}</span>
    </div>
    <figcaption><span>0{index + 1} / 03</span><span>{title}</span><span>Illustrative campaign imagery</span></figcaption>
  </figure>;
}

export function WorldChapter() {
  return <section className="v2-world" data-tone="light" aria-labelledby="v2-world-title">
    <TornEdge edge="top" variant={1} />
    <header className="v2-world-head">
      <p className="v2-label"><span className="v2-num">04</span> / The world</p>
      <h2 id="v2-world-title">After training.<br />Out with friends.</h2>
      <p className="v2-note v2-world-note">Illustrative campaign imagery</p>
    </header>
    <div className="v2-world-grid">
      {looks.map((look, i) => <Look key={look[0]} look={look} index={i} />)}
    </div>
    <div className="v2-world-foot">
      <a className="v2-brush" href="#collection">Explore the hoodie <ArrowUp size={17} aria-hidden="true" /></a>
    </div>
    <TornEdge edge="bottom" variant={4} />
  </section>;
}

/* ---------- 05 One camp: the team program, one photograph, one action ---------- */

export function OneCampChapter() {
  const ref = useScrollProgress<HTMLElement>();
  return <section ref={ref} className="v2-camp" data-tone="dark" aria-labelledby="v2-camp-title">
    <img className="v2-camp-image" src="/assets/team-bleachers-v1.webp" alt="Illustrative GC campaign: five adult teammates on concrete bleachers at sunset, arms around each other, seen from behind" width="1536" height="1024" loading="lazy" decoding="async" />
    <h2 id="v2-camp-title" className="v2-camp-title"><span>One</span> <span>Camp.</span></h2>
    <div className="v2-camp-copy">
      <p className="v2-label"><span className="v2-num">05</span> / For teams &amp; supporters</p>
      <p className="v2-camp-line">For the team — and everyone behind it. Explore GC’s developing youth fundraising program.</p>
      <a className="v2-brush is-light" href="/teams">GC for teams <ArrowRight size={17} aria-hidden="true" /></a>
      <small className="v2-camp-note">Program in development · Illustrative campaign</small>
    </div>
  </section>;
}

/* ---------- Close: the founder's hand-painted slogan brushed across the huddle ---------- */

export function ClosingChapter() {
  const ref = useScrollProgress<HTMLElement>(element => {
    const art = element.querySelector<HTMLElement>('.v2-close-slogan');
    if (!art) return;
    if (element.dataset.still) { element.style.setProperty('--paint', '1'); return; }
    // Paints left to right while the slogan rises through the lower third of the screen.
    const vh = stableHeight(), box = art.getBoundingClientRect(), centre = box.top + box.height / 2;
    element.style.setProperty('--paint', ease(clamp((vh * .95 - centre) / (vh * .25))).toFixed(4));
  });
  return <section ref={ref} className="v2-close" data-tone="light" aria-labelledby="v2-close-title">
    <TornEdge edge="top" variant={5} />
    <div className="v2-close-photo">
      <picture>
        <source media="(max-width: 760px)" srcSet="/assets/closing-huddle-tall-v3.webp" />
        <img src="/assets/closing-huddle-v3.webp" alt="Illustrative GC campaign: four adult friends in a huddle at night, looking down into the camera" width="1672" height="941" loading="lazy" decoding="async" />
      </picture>
    </div>
    <h2 id="v2-close-title" className="v2-close-slogan">
      <span className="sr-only">Live Different!!</span>
      <img src="/assets/gc-slogan-red.webp" alt="" width="1800" height="336" loading="eager" fetchPriority="low" decoding="async" />
    </h2>
    <div className="v2-close-copy">
      <p>A collection concept. Orders aren’t open yet.</p>
      <a className="v2-brush" href="https://www.instagram.com/guerrilla_camp/" target="_blank" rel="noreferrer">Follow @guerrilla_camp <ArrowUpRight size={17} aria-hidden="true" /></a>
      <small className="v2-note">Illustrative campaign · Slogan artwork supplied by GC</small>
    </div>
    <TornEdge edge="bottom" variant={0} />
  </section>;
}

