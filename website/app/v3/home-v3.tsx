'use client';
/* oxlint-disable next/no-img-element */
/* Native anchors keep page and section navigation compatible with static hosting (same as site.tsx). */
/* oxlint-disable next/no-html-link-for-pages */
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUp, ArrowUpRight, Plus, X } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { stableHeight, useScrollProgress } from '../use-scroll-progress';
import { useInertPage } from '../use-inert-page';

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const ease = (value: number) => value * value * (3 - 2 * value);
const INSTAGRAM = 'https://www.instagram.com/guerrilla_camp/';

/* ---------- Site bar: bare labels over the film, hides while reading down, returns on the way up ---------- */

export function SiteBar({ bagCount = 0, onBag, home = true }: { bagCount?: number; onBag?: () => void; home?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useInertPage(menuOpen);
  // On /teams the homepage chapters are one page away.
  const base = home ? '' : '/';

  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    let last = scrollY, frame = 0, hold = 0;
    // After a jump to a section the bar stays put, so it covers the scroll padding instead of leaving a strip of the previous section.
    const holdOpen = () => { hold = performance.now() + 1600; header.classList.remove('is-hidden'); };
    const onClick = (event: MouseEvent) => {
      const href = (event.target as Element | null)?.closest?.('a[href]')?.getAttribute('href') ?? '';
      if (href.startsWith('#') || (href.startsWith('/#') && location.pathname === '/')) holdOpen();
    };
    // Arriving from another page on a section link (e.g. /teams → /#collection) lands with the bar showing.
    if (location.hash && location.hash !== '#top') hold = performance.now() + 2500;
    const update = () => {
      frame = 0;
      const y = scrollY, delta = y - last;
      last = y;
      // The tone follows whichever section sits under the labels; nested regions override their section.
      let tone = header.dataset.base ?? 'dark';
      for (const section of document.querySelectorAll<HTMLElement>('main [data-tone], footer[data-tone]')) {
        const box = section.getBoundingClientRect();
        if (box.top <= 34 && box.bottom > 34) tone = section.dataset.tone ?? tone;
      }
      header.dataset.tone = tone;
      header.classList.toggle('is-scrolled', y > 40);
      if (y < 90 || delta < -3) header.classList.remove('is-hidden');
      // Keyboard focus inside the header keeps it on screen.
      else if (delta > 5 && performance.now() > hold && !header.querySelector(':focus-visible')) header.classList.add('is-hidden');
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', request);
    addEventListener('hashchange', holdOpen);
    document.addEventListener('click', onClick);
    const reveal = () => header.classList.remove('is-hidden');
    header.addEventListener('focusin', reveal);
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', request); removeEventListener('resize', request); removeEventListener('hashchange', holdOpen); document.removeEventListener('click', onClick); header.removeEventListener('focusin', reveal); };
  }, []);

  // Adding to the bag always brings the bag back into view.
  useEffect(() => { if (bagCount) ref.current?.classList.remove('is-hidden'); }, [bagCount]);

  const close = () => setMenuOpen(false);
  // A section chosen from the menu takes keyboard focus once the sheet closes, so the next Tab continues there, not at the top.
  const jumpTo = useRef<string | null>(null);
  const go = (event: { currentTarget: HTMLAnchorElement }) => { if (home) jumpTo.current = event.currentTarget.hash.slice(1) || null; close(); };
  const finalFocus = () => {
    const target = jumpTo.current ? document.getElementById(jumpTo.current) : null;
    jumpTo.current = null;
    if (!target) return true;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    setTimeout(() => target.focus({ preventScroll: true }), 0);
    return false;
  };
  const tone = home ? 'dark' : 'light';
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header ref={ref} className="gc-bar" data-tone={tone} data-base={tone}>
      <nav className="gc-bar-side" aria-label="Main navigation">
        <button className="gc-bar-link gc-bar-menu" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} aria-haspopup="dialog">Menu <Plus size={14} aria-hidden="true" /></button>
        <a className="gc-bar-link gc-wide" href={`${base}#collection`}>Shop</a>
        <a className="gc-bar-link gc-wide" href={`${base}#about`}>Behind GC</a>
        <a className="gc-bar-link gc-wide" href="/teams" aria-current={home ? undefined : 'page'}>For teams</a>
      </nav>
      <a href="/" className="gc-bar-brand" aria-label="Guerrilla Camp home">
        <img src="/assets/gc-wordmark.svg" alt="" width="200" height="59" />
      </a>
      <div className="gc-bar-side is-end">
        <span className="gc-bar-meta gc-wide">Nevada · Est. 2023</span>
        {onBag
          ? <button className="gc-bar-link" onClick={onBag} aria-label={`Open bag, ${bagCount} ${bagCount === 1 ? 'item' : 'items'}`}>Bag <span className="gc-bar-count">({bagCount})</span></button>
          : <a className="gc-bar-link" href="/#collection" aria-label="Shop the hoodie">Shop <ArrowRight size={13} aria-hidden="true" /></a>}
      </div>
    </header>
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetContent className="nav-sheet dark gc-sheet" showCloseButton={false} finalFocus={finalFocus}>
        <div className="gc-sheet-top">
          <SheetTitle><img className="gc-sheet-wordmark" src="/assets/gc-wordmark.svg" alt="Guerrilla Camp" width="200" height="59" /></SheetTitle>
          <button className="gc-icon-button" onClick={close} aria-label="Close navigation"><X /></button>
        </div>
        <SheetDescription className="sr-only">Explore the collection, brand and team program.</SheetDescription>
        <nav className="gc-sheet-nav" aria-label="Mobile navigation">
          <a href={`${base}#collection`} onClick={go}>The hoodie</a>
          <a href={`${base}#about`} onClick={go}>Behind GC</a>
          <a href={`${base}#campaign`} onClick={go}>Campaign</a>
          <a href="/teams" onClick={close} aria-current={home ? undefined : 'page'}>For teams</a>
        </nav>
        <div className="gc-sheet-foot">
          <img src="/assets/gc-mark.svg" alt="" width="140" height="160" />
          <a href={INSTAGRAM} target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={14} aria-hidden="true" /></a>
          <span>Live Different!!</span>
        </div>
      </SheetContent>
    </Sheet>
  </>;
}

/* ---------- 02 Behind GC: the quiet beat. No image, one statement, its echo in a lower voice ---------- */

export function Manifesto() {
  return <section id="about" className="gc-manifesto" data-tone="dark" aria-labelledby="gc-manifesto-title">
    <div className="gc-manifesto-rail">
      <p className="gc-label"><span className="gc-num">02</span> Behind GC</p>
    </div>
    <h2 id="gc-manifesto-title" className="gc-manifesto-statement gc-reveal" data-reveal data-reveal-threshold=".2">
      <span style={{ '--i': 0 } as React.CSSProperties}>The world will try to put you in a box.</span>{' '}
      <span className="gc-echo" style={{ '--i': 1 } as React.CSSProperties}>Define yourself before it can.</span>
    </h2>
    <img className="gc-manifesto-mark" src="/assets/gc-mark.svg" alt="The Guerrilla Camp gorilla mark" width="140" height="160" loading="lazy" decoding="async" />
  </section>;
}

/* ---------- 03 The mark: a torn seam switches the lights on across the photograph ---------- */

const values = ['Strength.', 'Protection.', 'Loyalty.'];

export function ValuesChapter() {
  const ref = useScrollProgress<HTMLElement>((element, { top, height }) => {
    const stage = element.querySelector<HTMLElement>('.gc-values-stage');
    const place = (on: number) => {
      element.style.setProperty('--on', on.toFixed(4));
      // The seam travels from just off the left edge (lip included) to the right edge, where the lit print sits flush.
      // It sits on whole device pixels, so its edges never render as a soft hairline.
      if (stage) {
        // The tear strip's rendered width (it follows the photograph's height, which is shorter on upright screens).
        const strip = stage.querySelector<HTMLElement>('.gc-values-lip')?.offsetWidth || stage.clientHeight * .156;
        const x = on * (stage.clientWidth + strip) - strip;
        element.style.setProperty('--x-px', `${Math.round(x * devicePixelRatio) / devicePixelRatio}px`);
      }
    };
    if (element.dataset.still) { place(1); return; }
    // Starts as the stage settles at the top, finishes 75% through the pin, then holds fully lit.
    const vh = stableHeight();
    const travelled = -top / Math.max(1, height - vh);
    place(ease(clamp((travelled - .02) / .73)));
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
  return <section ref={ref} className="gc-values" data-tone="dark" aria-labelledby="gc-values-title">
    <div className="gc-values-stage">
      <div className="gc-values-off" aria-hidden="true">
        <img src="/assets/lookbook-hood-up-halftone-v2.webp" alt="" width="1122" height="1402" loading="lazy" decoding="async" />
      </div>
      <div className="gc-values-lip" aria-hidden="true" />
      <div className="gc-values-on">
        <div className="gc-values-on-photo">
          <img src="/assets/lookbook-hood-up-v2.webp" alt="Illustrative campaign: an adult in the charcoal GC Hoodie pulling the hood up at dusk" width="1122" height="1402" loading="lazy" decoding="async" />
        </div>
      </div>
      <div className="gc-values-copy">
        <p className="gc-label"><span className="gc-num">03</span> The mark</p>
        <h2 id="gc-values-title" className="gc-values-words">
          {values.map((value, i) => <span key={value} style={{ '--i': i } as React.CSSProperties}>{value}</span>)}
        </h2>
        <p className="gc-values-line">What the gorilla stands for.</p>
        <small className="gc-note">Illustrative campaign</small>
      </div>
    </div>
  </section>;
}

/* ---------- 05 The campaign: three prints wheat-pasted on a concrete wall ---------- */
/* Each print carries one of GC's own words from the brand brief, set in the site's display face in GC Red. */

const posters = [
  ['/assets/gc-print-presence-v1.webp', 'Presence.', 'Individuality', 'Illustrative campaign print: a seated adult in the GC Hoodie inside an oversized hood drawcord, under red “Presence.” lettering'],
  ['/assets/gc-print-repetition-v1.webp', 'Repetition.', 'Action', 'Illustrative campaign print: an adult dancer in the GC Hoodie mid-movement beside vertical red “Repetition.” lettering'],
  ['/assets/gc-print-community-v1.webp', 'Community.', 'Loyalty', 'Illustrative campaign print: three adult friends in GC clothing sitting together above red “Community.” lettering'],
] as const;

export function CampaignWall() {
  const ref = useScrollProgress<HTMLElement>();
  // Prepare the prints before a fast scroll or Campaign jump reaches the wall.
  // Low fetch priority leaves the opening film and product image first in line.
  useEffect(() => {
    ref.current?.querySelectorAll('img').forEach(image => { void image.decode().catch(() => {}); });
  }, [ref]);
  return <section ref={ref} id="campaign" className="gc-wall" data-tone="dark" aria-labelledby="gc-wall-title">
    <header className="gc-wall-head">
      <p className="gc-label"><span className="gc-num">05</span> The campaign</p>
      <h2 id="gc-wall-title">In our own words.</h2>
      <p className="gc-note">Illustrative campaign artwork, AI‑generated for this concept.</p>
    </header>
    <div className="gc-wall-posters">
      {posters.map(([src, title, theme, alt], i) => <figure key={src} className="gc-poster" style={{ '--n': i } as React.CSSProperties}>
        <div className="gc-poster-sheet">
          <img src={src} alt={alt} width="1122" height="1402" loading="eager" fetchPriority="low" decoding="async" />
          <i className="gc-tape-bit is-a" aria-hidden="true" />
          <i className="gc-tape-bit is-b" aria-hidden="true" />
        </div>
        <figcaption><span>0{i + 1} / {theme}</span><span className="sr-only">{title}</span></figcaption>
      </figure>)}
    </div>
  </section>;
}

/* ---------- 05 The troop: the individual beside the people in their corner ---------- */

const halves = [
  ['/assets/lookbook-court-dawn-v2.webp', '01 / The individual', 'A mind of your own.', 'Illustrative campaign: an adult athlete in the charcoal GC Hoodie resting alone courtside at dusk', 'center 22%'],
  ['/assets/closing-huddle-portrait-v2.webp', '02 / The troop', 'People in your corner.', 'Illustrative campaign: four adult friends in GC clothing huddled together at night, looking down into the camera', 'center 30%'],
] as const;

export function TroopChapter() {
  const ref = useScrollProgress<HTMLElement>();
  return <section ref={ref} className="gc-troop" aria-labelledby="gc-troop-title">
    <header className="gc-troop-head" data-tone="light">
      <p className="gc-label"><span className="gc-num">04</span> Belonging</p>
      <h2 id="gc-troop-title"><span>Individuality doesn’t mean isolation.</span> <span className="gc-echo">Gorillas travel in troops.</span></h2>
      <p className="gc-note">Illustrative campaign imagery</p>
    </header>
    <div className="gc-troop-split" data-tone="dark">
      {halves.map(([src, label, line, alt, position], i) => <figure key={src} className={`gc-half is-${i + 1}`} style={{ '--pos': position } as React.CSSProperties}>
        <img src={src} alt={alt} width="1122" height="1402" loading="lazy" decoding="async" />
        <figcaption><span className="gc-label">{label}</span><strong>{line}</strong></figcaption>
      </figure>)}
    </div>
  </section>;
}

/* ---------- 06 One camp: the team program, one photograph, one action ---------- */

export function OneCampChapter() {
  const ref = useScrollProgress<HTMLElement>();
  return <section ref={ref} className="gc-camp" data-tone="dark" aria-labelledby="gc-camp-title">
    <img className="gc-camp-image" src="/assets/team-bleachers-v1.webp" alt="Illustrative GC campaign: five adult teammates on concrete bleachers at sunset, arms around each other, seen from behind" width="1536" height="1024" loading="lazy" decoding="async" />
    <h2 id="gc-camp-title" className="gc-camp-title"><span>One</span> <span>Camp.</span></h2>
    <div className="gc-camp-copy">
      <p className="gc-label"><span className="gc-num">06</span> For teams &amp; supporters</p>
      <p className="gc-camp-line">For the team — and everyone behind it. Explore GC’s developing youth fundraising program.</p>
      <a className="gc-btn is-light" href="/teams">Explore the program <ArrowRight size={17} aria-hidden="true" /></a>
      <small className="gc-note"><span className="gc-nowrap">Program in development</span> · <span className="gc-nowrap">Illustrative campaign</span></small>
    </div>
  </section>;
}

/* ---------- Sign-off: the founder's hand-painted slogan, brushed on as it rises; one way back to the hoodie ---------- */

export function SignOff() {
  return <section className="gc-signoff" data-tone="light" aria-labelledby="gc-signoff-title">
    <img className="gc-signoff-mark" src="/assets/gc-mark-ink.svg" alt="The Guerrilla Camp gorilla mark" width="1165" height="1313" loading="lazy" decoding="async" />
    {/* Painted once, left to right, when it arrives; it rests fully painted. */}
    <h2 id="gc-signoff-title" className="gc-signoff-slogan" data-reveal data-reveal-threshold=".5">
      <span className="sr-only">Live Different!!</span>
      <img src="/assets/gc-slogan-red.webp" alt="" width="1800" height="336" loading="eager" fetchPriority="low" decoding="async" />
    </h2>
    <div className="gc-signoff-actions">
      <a className="gc-btn" href="#collection">Shop the hoodie <ArrowUp size={17} aria-hidden="true" /></a>
    </div>
    <p className="gc-note gc-signoff-note"><span>A collection concept. Orders aren’t open yet.</span> <span>Slogan artwork supplied by GC.</span></p>
  </section>;
}
