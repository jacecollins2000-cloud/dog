'use client';
/* oxlint-disable next/no-img-element */
/* The phone gallery is a horizontal scroll region; it must be focusable so keyboard users can scroll it. */
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex */
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CreditCard, Image as ImageIcon, Info, Ruler, ShoppingBag } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import './product-feature.css';
import { TornEdge } from './v3/paper';

const gallery = [
  ['/assets/hoodie-clean-v3.webp', 'Charcoal GC Hoodie, front view, with the white gorilla and red GC chest mark', 'The hoodie'],
  ['/assets/gc-mark.svg', 'The approved Guerrilla Camp gorilla mark in white and red, on charcoal', 'The mark'],
  ['/assets/athlete-after-training-v2.webp', 'Illustrative adult athlete wearing the charcoal GC Hoodie after training', 'On body'],
  ['/assets/gc-hood-detail-v3.webp', 'Close-up of the hood, drawcords and chest mark on the charcoal hoodie', 'The hood'],
] as const;
const sizes = ['S', 'M', 'L', 'XL', '2XL'];
const calmMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches && document.documentElement.dataset.gcMotion !== 'full';

export function ProductFeature({ onBuy, onViewBag, bagSize = '' }: { onBuy: (size: string) => void; onViewBag: () => void; bagSize?: string }) {
  const [size, setSize] = useState('');
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);
  const [slide, setSlide] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rail = useRef<HTMLElement>(null);
  const buyRef = useRef<HTMLButtonElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const inBag = Boolean(bagSize) && bagSize === size;
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  // The phone purchase dock shows only while the product section sits behind it and the in-flow button is off screen.
  useEffect(() => {
    const zone = zoneRef.current, button = buyRef.current, dock = dockRef.current;
    if (!zone || !button || !dock) return;
    const dockHeight = 72;
    const sync = () => {
      const area = zone.getBoundingClientRect(), own = button.getBoundingClientRect();
      // Leave well before either zone edge reaches the dock so it is never drawn over the hero or posters, even on a fast flick.
      const margin = 120;
      const zoneBehindDock = area.top < innerHeight - dockHeight - margin && area.bottom > innerHeight + margin;
      const buttonOnScreen = own.top < innerHeight - dockHeight && own.bottom > 0;
      // It also steps aside while keyboard focus is in the gallery, so it never covers the focused dot or arrow.
      const galleryFocused = Boolean(zone.querySelector('.pdp-gallery')?.contains(document.activeElement));
      // Toggled directly (not via React state) so it changes in the same frame as the scroll.
      const show = zoneBehindDock && !buttonOnScreen && !galleryFocused;
      dock.classList.toggle('is-visible', show);
      dock.inert = !show;
      dock.setAttribute('aria-hidden', String(!show));
    };
    sync();
    addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync);
    // Focus moving between two gallery controls passes through the body; decide once it has landed.
    const afterBlur = () => setTimeout(sync, 0);
    zone.addEventListener('focusin', sync);
    zone.addEventListener('focusout', afterBlur);
    return () => { removeEventListener('scroll', sync); removeEventListener('resize', sync); zone.removeEventListener('focusin', sync); zone.removeEventListener('focusout', afterBlur); };
  }, []);

  // On the phone the gallery is a swipe rail, so its scroll position decides the current image.
  useEffect(() => {
    const track = rail.current;
    if (!track) return;
    const sync = () => {
      if (track.scrollWidth > track.clientWidth + 1) setSlide(Math.min(gallery.length - 1, Math.round(track.scrollLeft / Math.max(1, track.clientWidth))));
    };
    track.addEventListener('scroll', sync, { passive: true });
    return () => track.removeEventListener('scroll', sync);
  }, []);

  function showSizes(flagError: boolean) {
    if (flagError) setError(true);
    const field = document.getElementById('collection-sizes');
      field?.scrollIntoView({ behavior: calmMotion() ? 'auto' : 'smooth', block: 'center' });
    field?.focus({ preventScroll: true });
  }

  function buy() {
    if (!size) { showSizes(true); return; }
    if (added) return;
    setAdded(true);
    timer.current = setTimeout(() => { onBuy(size); setAdded(false); }, calmMotion() ? 0 : 420);
  }

  function goTo(index: number) {
    const track = rail.current;
    const next = (index + gallery.length) % gallery.length;
    // Desktop shows one image at a time in place; the phone rail scrolls to it.
    if (track && track.scrollWidth > track.clientWidth + 1) track.scrollTo({ left: next * track.clientWidth, behavior: calmMotion() ? 'auto' : 'smooth' });
    else setSlide(next);
  }

  // Arrow keys step through the images while the strip has focus (it is a scroll region, so it takes focus itself).
  const step = useRef((by: number) => { void by; });
  useEffect(() => { step.current = by => goTo(slide + by); });
  useEffect(() => {
    const track = rail.current;
    if (!track) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      step.current(event.key === 'ArrowRight' ? 1 : -1);
    };
    track.addEventListener('keydown', onKey);
    return () => track.removeEventListener('keydown', onKey);
  }, []);

  return <div className="pdp-zone" ref={zoneRef} data-tone="light">
    <TornEdge edge="top" variant={0} />
    <section id="collection" className="pdp" aria-labelledby="collection-title">
      <div className="pdp-gallery">
        <section className="pdp-rail" ref={rail} aria-roledescription="carousel" tabIndex={0} aria-label="Product images">
          {gallery.map(([src, alt], index) => <figure key={src} className={`pdp-frame ${index === 0 ? 'is-product' : ''} ${src.endsWith('.svg') ? 'is-mark' : ''} ${index === slide ? 'is-current' : ''}`}>
            <img src={src} alt={alt} width="1122" height="1402" loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
          </figure>)}
        </section>
        <p className="pdp-position" aria-live="polite"><span>{slide + 1} / {gallery.length}</span><span>{gallery[slide][2]}</span></p>
        <div className="pdp-arrows">
          <button onClick={() => goTo(slide - 1)} aria-label="Previous product image"><ArrowLeft size={18} /></button>
          <button onClick={() => goTo(slide + 1)} aria-label="Next product image"><ArrowRight size={18} /></button>
        </div>
        <div className="pdp-dots">
          {gallery.map(([src, , label], index) => <button key={src} aria-label={`Show image ${index + 1}: ${label}`} aria-current={index === slide} className={index === slide ? 'is-current' : ''} onClick={() => goTo(index)} />)}
        </div>
      </div>

      <div className="pdp-info">
        <div className="pdp-info-inner">
          <p className="pdp-kicker"><span className="gc-num">01</span> The piece <span className="pdp-code">GC—001</span></p>
          <div className="pdp-title-row">
            <h2 id="collection-title">The GC Hoodie</h2>
            <p className="pdp-price">$78 <span>USD · example price</span></p>
          </div>
          <p className="pdp-lede">A charcoal layer carrying the gorilla — strength, protection and loyalty — for training days and everything after.</p>

          <div className="pdp-colour"><span className="pdp-swatch" aria-hidden="true" /> <span>Colour</span> <strong>Charcoal</strong></div>

          <fieldset className="pdp-sizes" id="collection-sizes" tabIndex={-1}>
            <legend><span>Size</span><span className="pdp-muted">Example sizing</span></legend>
            <RadioGroup className="size-options" aria-label="Select hoodie size" value={size} onValueChange={value => { setSize(String(value)); setError(false); }} aria-describedby={error ? 'collection-size-error' : undefined}>
              {sizes.map(s => <label key={s}><RadioGroupItem value={s} aria-label={s} /><span aria-hidden="true">{s}</span></label>)}
            </RadioGroup>
            {error && <p className="size-error" id="collection-size-error" role="alert">Choose a size to add the hoodie.</p>}
          </fieldset>

          <button ref={buyRef} className={`pdp-buy ${added ? 'is-added' : ''}`} onClick={inBag && !added ? onViewBag : buy} aria-disabled={added || undefined}>
            <span aria-live="polite">{added ? 'Added to your bag' : inBag ? `In your bag — ${size} · view` : size && bagSize ? `Switch bag to ${size}` : size ? `Add to bag — ${size}` : 'Add to bag'}</span>
            <span className="pdp-buy-end">{added ? <Check size={19} /> : <>$78 <ShoppingBag size={18} /></>}</span>
          </button>

          <ul className="pdp-facts">
            <li><Info size={17} aria-hidden="true" /><span><strong>Concept piece.</strong> Orders aren’t open yet.</span></li>
            <li><Ruler size={17} aria-hidden="true" /><span>Sizes S–2XL shown as an example.</span></li>
            <li><CreditCard size={17} aria-hidden="true" /><span>Demo checkout — no payment is taken.</span></li>
            <li><ImageIcon size={17} aria-hidden="true" /><span>Product and on-body images are illustrative.</span></li>
          </ul>

          <Accordion className="site-accordion pdp-accordion">
            <AccordionItem value="details"><AccordionTrigger>Product &amp; delivery details</AccordionTrigger><AccordionContent><p>The final garment, sizing, materials, price, delivery and returns policy need confirmation from GC. This concept demonstrates the shopping experience; orders are not open.</p></AccordionContent></AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>

    <div ref={dockRef} className="pdp-dock" inert aria-hidden="true">
      <div className="pdp-dock-name"><strong>The GC Hoodie</strong><span>{size ? `${size} · $78 example price · concept` : '$78 example price · concept'}</span></div>
      {inBag && !added
        ? <button className="pdp-dock-buy is-secondary" onClick={onViewBag}>View bag (1)</button>
        : <button className={`pdp-dock-buy ${added ? 'is-added' : ''}`} onClick={() => size ? buy() : showSizes(false)} aria-disabled={added || undefined}>
          {added ? <>Added <Check size={17} /></> : size && bagSize && size !== bagSize ? <>Switch to {size}</> : size ? <>Add · $78</> : <>Choose size</>}
        </button>}
    </div>
  </div>;
}
