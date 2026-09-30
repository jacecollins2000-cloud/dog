'use client';
/* Images are pre-optimized WebP assets; plain img keeps the static export independent of an image server. */
/* oxlint-disable next/no-img-element */
/* Native anchors keep page and section navigation compatible with static hosting. */
/* oxlint-disable next/no-html-link-for-pages */

import {
  ArrowUpRight,
  ArrowRight,
  X,
  Plus,
  Check,
  Copy,
} from 'lucide-react';
import { useState, useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { CampaignHero } from './campaign-hero';
import { ProductFeature } from './product-feature';
import { CampaignWall, Manifesto, OneCampChapter, SignOff, SiteBar, TroopChapter, ValuesChapter } from './v3/home-v3';
import './shared-chrome.css';
import './v3/v3.css';
import { ShoppingBagPanel } from './shopping-bag';
import { useEditorialMotion } from './use-editorial-motion';
import { useInertPage } from './use-inert-page';
import { TeamEditorial } from './team-editorial';
// Native anchors keep page and section navigation compatible with static hosting.
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

export function FashionPage() {
  const [productOpen, setProductOpen] = useState(false);
  const [chosenSize, setChosenSize] = useState('');
  const [directCheckout, setDirectCheckout] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [bagSize, setBagSize] = useState('');
  const mainRef = useEditorialMotion();
  useInertPage(productOpen || bagOpen);
  return (
    <div className="gc gc-home">
      <SiteBar onBag={()=>setBagOpen(true)} bagCount={bagSize ? 1 : 0} />
      <main id="main" ref={mainRef}>
        <CampaignHero />
        <ProductFeature bagSize={bagSize} onViewBag={() => setBagOpen(true)} onBuy={(size) => { setBagSize(size); setBagOpen(true); }} />
        <Manifesto />
        <ValuesChapter />
        <TroopChapter />
        <CampaignWall />
        <OneCampChapter />
        <SignOff />
      </main>
      <SiteFooter />
      <ShoppingBagPanel open={bagOpen} onOpenChange={setBagOpen} size={bagSize} onRemove={()=>setBagSize('')} onCheckout={()=>{setChosenSize(bagSize);setDirectCheckout(true);setBagOpen(false);setProductOpen(true);}} />
      <ProductPreview open={productOpen} initialSize={chosenSize} startAtCheckout={directCheckout}
        onOpenChange={next => {
          setProductOpen(next);
          // The dialog's opener (the bag) is already closed, so return focus to the bar's bag button.
          if (!next) requestAnimationFrame(() => document.querySelector<HTMLElement>('.gc-bar [aria-label^="Open bag"]')?.focus({ preventScroll: true }));
        }}
        onChangeSize={() => requestAnimationFrame(() => {
          const sizes = document.getElementById('collection-sizes');
          sizes?.scrollIntoView({ block: 'center' });
          sizes?.focus({ preventScroll: true });
        })}
        onComplete={() => setBagSize('')} />
    </div>
  );
}

function ProductPreview({
  open,
  onOpenChange,
  initialSize = '',
  startAtCheckout = false,
  onChangeSize,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSize?: string;
  startAtCheckout?: boolean;
  onChangeSize?: () => void;
  onComplete?: () => void;
}) {
  const [view, setView] = useState<'front' | 'worn'>('front');
  const [size, setSize] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [complete, setComplete] = useState(false);
  useEffect(() => {
    if (open) {
      if (initialSize) setSize(initialSize);
      setCheckout(startAtCheckout && Boolean(initialSize));
      setComplete(false);
      setSizeError(false);
    } else setCheckout(false);
  }, [open, initialSize, startAtCheckout]);
  // The finish button is replaced by the confirmation; keep keyboard focus on its next action.
  const continueRef = useRef<HTMLButtonElement>(null);
  useFocusOnSwap(continueRef, complete, complete);
  function buy() {
    if (!size) {
      setSizeError(true);
      return;
    }
    setComplete(false);
    setCheckout(true);
  }
  if (!open) return null;
  return (
    <>
      {!checkout && <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="product-sheet" showCloseButton={false}>
          <div className="sheet-top product-heading">
            <div>
              <p className="eyebrow">GC / SAMPLE PRODUCT</p>
              <div className="detail-title">
                <SheetTitle>The GC Hoodie</SheetTitle>
                <span>$78</span>
              </div>
              <SheetDescription>Charcoal / signature mark</SheetDescription>
            </div>
            <button
              className="icon-button"
              aria-label="Close product preview"
              onClick={() => onOpenChange(false)}
            >
              <X />
            </button>
          </div>
          <div className="product-detail-scroll">
            <div className="product-gallery">
              <div className="detail-photo" data-view={view}>
                <img
                  key={view}
                  src={
                    view === 'front'
                      ? '/assets/hoodie-clean-v3.webp'
                      : '/assets/athlete-after-training-v2.webp'
                  }
                  alt={
                    view === 'front'
                      ? 'Concept front view of the charcoal GC hoodie'
                      : 'Illustrative adult athlete wearing the GC hoodie after basketball practice'
                  }
                />
              </div>
              <div className="image-switch" aria-label="Product image views">
                <button
                  aria-pressed={view === 'front'}
                  onClick={() => setView('front')}
                >
                  Front view
                </button>
                <button
                  aria-pressed={view === 'worn'}
                  onClick={() => setView('worn')}
                >
                  On body
                </button>
                <span>ILLUSTRATIVE IMAGES</span>
              </div>
            </div>
            <div className="product-detail-copy">
              <p className="product-short-copy">
                The gorilla at your chest. A charcoal layer for after training
                and out with friends.
              </p>
              <Accordion className="site-accordion">
                <AccordionItem value="design">
                  <AccordionTrigger>The design direction</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      A charcoal body with the approved white-and-red GC
                      identity. The understated placement lets the mark carry
                      the message.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="details">
                  <AccordionTrigger>
                    Fit, materials &amp; delivery
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      This is an illustrated product concept. Sizes and the $78
                      USD price demonstrate the shopping experience. The final
                      garment, fit, materials, measurements, price, delivery and
                      returns policy need confirmation from GC before real
                      orders can open.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          <div className="product-purchase-panel">
            {' '}
            <fieldset className="size-field">
              <legend>
                Choose your size <span>Example sizing</span>
              </legend>
              <RadioGroup
                className="size-options"
                value={size}
                onValueChange={(value) => {
                  setSize(value as string);
                  setSizeError(false);
                }}
                aria-label="Hoodie size"
                aria-describedby={sizeError ? 'size-error' : undefined}
              >
                {['S', 'M', 'L', 'XL', '2XL'].map((option) => (
                  <label key={option}>
                    <RadioGroupItem value={option} aria-label={option} />
                    <span aria-hidden="true">{option}</span>
                  </label>
                ))}
              </RadioGroup>
              {sizeError && (
                <p id="size-error" className="size-error" role="alert">
                  Choose a size to continue.
                </p>
              )}
            </fieldset>
            <button className="button button-dark buy-button" onClick={buy}>
              Buy now — $78 <ArrowRight size={19} />
            </button>
            <p className="purchase-note">
              Demo checkout · Example product and price · No payment
            </p>
          </div>
        </SheetContent>
      </Sheet>}
      <Dialog open={open && checkout} onOpenChange={next => { if (!next) onOpenChange(false); }}>
        <DialogContent className="checkout-dialog" showCloseButton={false}>
          <div className="sheet-top">
            <p className="eyebrow">GUERRILLA CAMP / DEMO CHECKOUT</p>
            <button
              className="icon-button"
              aria-label="Close checkout"
              onClick={() => onOpenChange(false)}
            >
              <X />
            </button>
          </div>
          <DialogTitle>
            {complete ? 'Demo complete.' : 'Your GC Hoodie'}
          </DialogTitle>
          <DialogDescription>
            {complete
              ? 'No order was placed and no payment was taken.'
              : 'Review your example order. No payment is collected.'}
          </DialogDescription>
          {complete ? (
            <div className="checkout-complete">
              <span className="complete-icon">
                <Check size={28} />
              </span>
              <p>The GC Hoodie · Charcoal · {size}</p>
              <a className="small-link complete-follow" href="https://www.instagram.com/guerrilla_camp/" target="_blank" rel="noreferrer">Follow @guerrilla_camp <ArrowUpRight size={15} /></a>
              <button
                ref={continueRef}
                className="button button-dark"
                onClick={() => {
                  setCheckout(false);
                  onOpenChange(false);
                }}
              >
                Continue exploring <ArrowRight size={19} />
              </button>
            </div>
          ) : (
            <>
              <div className="checkout-product">
                <img
                  src="/assets/hoodie-clean-v3.webp"
                  alt="Sample charcoal GC hoodie"
                />
                <div>
                  <h3>The GC Hoodie</h3>
                  <p>Charcoal / {size} / Qty 1</p>
                  <button
                    className="small-link"
                    onClick={() => { onOpenChange(false); onChangeSize?.(); }}
                  >
                    Change size
                  </button>
                </div>
                <strong>$78</strong>
              </div>
              <dl className="order-totals">
                <div>
                  <dt>Example subtotal</dt>
                  <dd>$78.00 USD</dd>
                </div>
                <div>
                  <dt>Shipping &amp; taxes</dt>
                  <dd>Not calculated in demo</dd>
                </div>
              </dl>
              <p className="checkout-note">
                Final pricing, product details, delivery and returns will be
                confirmed before GC accepts orders.
              </p>
              <button
                className="button button-dark"
                onClick={() => { setComplete(true); onComplete?.(); }}
              >
                Finish demo checkout <ArrowRight size={19} />
              </button>
              <span className="purchase-note">
                Nothing will be charged or ordered.
              </span>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

const programFaqs = [
  [
    'Who is this program for?',
    'GC is developing the program for teams and their supporters, with youth fundraising as part of the concept. The right starting point is a conversation about your team, your community and what you want a collection to help you do.',
  ],
  [
    'How would the fundraising work?',
    'The founder’s current youth fundraising concept returns 25% of applicable net fundraising sales to participating youth teams. This is a developing proposal, not a finalized offer. What counts as net fundraising sales, eligible purchases, deductions, payment timing and other terms must be agreed before a campaign begins.',
  ],
  [
    'Can we choose the garments and design?',
    'The aim is a collection that reflects the team. Garment choices, artwork, pricing, order quantities and approval steps would need to be worked out with GC before anything is offered for sale. The images on this page illustrate a direction; they are not an existing team collection.',
  ],
  [
    'Is there a cost or minimum order?',
    'Setup costs, minimum quantities, production times, fulfillment and returns have not been confirmed. These should be included in a written proposal so the team can evaluate the whole program before committing.',
  ],
];

export function TeamsPage() {
  const [briefOpen, setBriefOpen] = useState(false);
  useInertPage(briefOpen);
  return (
    <div className="gc gc-teams">
      <SiteBar home={false} />
      <main id="main">
        <TeamEditorial onBrief={() => setBriefOpen(true)} />
        <section id="program" className="gc-program" data-tone="light" aria-labelledby="gc-program-title">
          <header className="gc-section-head">
            <p className="gc-label"><span className="gc-num">01</span> The proposed program</p>
            <h2 id="gc-program-title">Plan the collection.</h2>
            <p className="gc-section-aside">Three conversations to have before a collection goes on sale.</p>
          </header>
          <ol className="gc-steps">
            {[
              [
                '01',
                'Define the brief.',
                'Outline the team, activity and fundraising goal. Identify who would wear the collection and who needs to approve it.',
              ],
              [
                '02',
                'Agree the collection.',
                'Review proposed garments, artwork, pricing and quantities together before making a commitment.',
              ],
              [
                '03',
                'Set the terms.',
                'Confirm the fundraising calculation, deductions, payment timing and fulfillment in writing before any launch.',
              ],
            ].map(([number, title, copy]) => (
              <li key={number}>
                <span className="gc-step-num" aria-hidden="true">{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="gc-giveback" data-tone="dark" aria-labelledby="gc-giveback-title">
          <div className="gc-giveback-figure">
            <p className="gc-label"><span className="gc-num">02</span> Youth fundraising / Founder’s proposal</p>
            <p className="gc-percentage" aria-hidden="true">25<span>%</span></p>
            <p className="gc-percentage-label">
              <span className="sr-only">25% </span>of applicable <strong>net fundraising sales</strong>
              <br /> to participating youth teams.
            </p>
          </div>
          <div className="gc-giveback-copy">
            <h2 id="gc-giveback-title">
              Support the next
              <br />
              competition.
            </h2>
            <p>
              Supporters would buy from a team collection, helping fund the
              team’s competition goals.
            </p>
            <p className="gc-terms">
              This proposed contribution applies to participating youth
              fundraising campaigns. Eligibility, the definition of net sales,
              deductions and payment terms still need agreement. It is not a
              donation promise on every GC purchase.
            </p>
            <a href="#questions" className="gc-link is-light">
              Understand the proposal <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </section>
        <section id="questions" className="gc-questions" data-tone="light" aria-labelledby="gc-questions-title">
          <header>
            <p className="gc-label"><span className="gc-num">03</span> Before you get started</p>
            <h2 id="gc-questions-title">Team questions.</h2>
            <p>
              The program is taking shape. Here’s what is proposed, and what a
              team would still need to confirm.
            </p>
          </header>
          <Accordion className="site-accordion gc-accordion">
            {programFaqs.map(([question, answer], i) => (
              <AccordionItem value={String(i)} key={question}>
                <AccordionTrigger>{question}</AccordionTrigger>
                <AccordionContent>
                  <p>{answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
        <section className="gc-team-close" data-tone="light" aria-labelledby="gc-team-close-title">
          <img
            src="/assets/gc-mark-ink.svg"
            alt="The Guerrilla Camp gorilla mark"
            width="1165"
            height="1313"
            loading="lazy"
          />
          <div>
            <p className="gc-label"><span className="gc-num">04</span> Next step</p>
            <h2 id="gc-team-close-title">Start with your team.</h2>
            <p>
              Put the essentials in one place before a conversation with GC.
            </p>
            <button className="gc-btn" onClick={() => setBriefOpen(true)}>
              Build a team brief <ArrowRight size={18} aria-hidden="true" />
            </button>
            <span className="gc-note">
              A local planning tool. Nothing is sent to GC.
            </span>
          </div>
        </section>
      </main>
      <SiteFooter />
      <TeamBrief open={briefOpen} onOpenChange={setBriefOpen} />
    </div>
  );
}

/* When a dialog swaps its content, the focused control disappears with it. Hand focus to the next action rather than
   leaving it on the dialog frame; re-check after the focus trap has settled, but never take focus back from a control. */
function useFocusOnSwap(target: RefObject<HTMLElement | null>, key: unknown, active: boolean) {
  useLayoutEffect(() => {
    if (!active) return;
    const place = () => {
      const element = target.current, current = document.activeElement;
      if (!element?.isConnected || current === element) return;
      if (!current || current === document.body || current.matches('[role="dialog"], [role="alertdialog"]')) element.focus();
    };
    place();
    const frame = requestAnimationFrame(place);
    const timer = setTimeout(place, 150);
    return () => { cancelAnimationFrame(frame); clearTimeout(timer); };
  }, [target, key, active]);
}

function TeamBrief({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [team, setTeam] = useState('');
  const [activity, setActivity] = useState('');
  const [goal, setGoal] = useState('');
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  // Create and Edit swap the form for the result and back; focus follows to the copy action or the first field.
  const [swaps, setSwaps] = useState(0);
  const copyRef = useRef<HTMLButtonElement>(null);
  const teamRef = useRef<HTMLInputElement>(null);
  useFocusOnSwap(ready ? copyRef : teamRef, swaps, open && swaps > 0);
  const summary = `GC partnership conversation\n\nTeam: ${team}\nActivity: ${activity}\nWhat we’re working toward: ${goal}\n\nTo discuss: collection design, garments, pricing, quantities, fundraising calculation, payment timing and fulfillment.\n\nPlanning note only. No application has been submitted.`;
  function createBrief(event: { preventDefault: () => void }) {
    event.preventDefault();
    setReady(true);
    setSwaps(count => count + 1);
    setCopied(false);
    setCopyError(false);
  }
  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="brief-dialog" showCloseButton={false}>
        <div className="sheet-top">
          <p className="eyebrow">GUERRILLA CAMP / TEAM PLANNING</p>
          <button
            className="icon-button"
            onClick={() => onOpenChange(false)}
            aria-label="Close team brief"
          >
            <X />
          </button>
        </div>
        <DialogTitle>
          {ready ? 'Your team brief' : 'Tell us about your team.'}
        </DialogTitle>
        <DialogDescription>
          {ready
            ? 'Copy this brief for your conversation with GC.'
            : 'Draft a short brief to keep for your conversation. Nothing is submitted, sent or saved after this page is closed.'}
        </DialogDescription>
        {ready ? (
          <div className="brief-result">
            <label htmlFor="team-summary">Your team brief</label>
            <textarea id="team-summary" readOnly value={summary} rows={11} />
            <div className="brief-actions">
              <button ref={copyRef} className="button button-dark" onClick={copyBrief}>
                {copied ? 'Copied' : 'Copy your brief'}
                {copied ? <Check size={19} /> : <Copy size={19} />}
              </button>
              <button className="small-link" onClick={() => { setReady(false); setSwaps(count => count + 1); }}>
                Edit details
              </button>
            </div>
            <output className="reference-note">
              {copyError
                ? 'Select and copy the text above. Your browser could not access the clipboard.'
                : copied
                  ? 'Copied to your clipboard. Nothing has been sent to GC.'
                  : 'Keep a copy before leaving this page.'}
            </output>
          </div>
        ) : (
          <form className="brief-form" onSubmit={createBrief}>
            <label htmlFor="team-name">
              Team or club name
              <input
                ref={teamRef}
                id="team-name"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                required
                maxLength={100}
                placeholder="e.g. Desert Valley Wrestling"
              />
            </label>
            <label htmlFor="team-activity">
              Sport or activity
              <input
                id="team-activity"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                required
                maxLength={100}
                placeholder="e.g. Wrestling, dance, athletics"
              />
            </label>
            <label htmlFor="team-goal">
              What are you working toward?
              <textarea
                id="team-goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
                maxLength={600}
                rows={3}
                placeholder="A competition, travel costs, a collection your supporters can wear…"
              />
            </label>
            <button className="button button-dark" type="submit">
              Create my brief <ArrowRight size={19} />
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function SiteFooter() {
  const [aboutOpen, setAboutOpen] = useState(false);
  useInertPage(aboutOpen);
  return (
    <>
      <footer className="gc-footer" data-tone="dark">
        <div className="gc-footer-row">
          <a href="/" className="gc-footer-mark" aria-label="Guerrilla Camp home"><img src="/assets/gc-wordmark.svg" alt="" width="1200" height="355" loading="lazy" /></a>
          <nav aria-label="Footer navigation">
            <a href="/#collection">The hoodie</a>
            <a href="/#about">Behind GC</a>
            <a href="/teams">For teams</a>
            <a href="https://www.instagram.com/guerrilla_camp/" target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={14} aria-hidden="true" /></a>
          </nav>
          <div className="gc-footer-meta">
            <span>Live Different!!</span>
            <span>Nevada · Est. 2023</span>
            <button className="footer-concept" onClick={() => setAboutOpen(true)}>About this concept <Plus size={14} aria-hidden="true" /></button>
          </div>
        </div>
      </footer>
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="concept-dialog">
          <p className="eyebrow">Guerrilla Camp / About this concept</p>
          <DialogTitle>A first look at what GC could become.</DialogTitle>
          <DialogDescription>
            This website is a design and messaging proposal for
            discussion with the founder.
          </DialogDescription>
          <figure className="concept-reference">
            <img
              src="/assets/sand-flatlay.webp"
              alt="Founder-supplied AS Colour sand garment reference, not a finished GC product"
              width="1200"
              height="1799"
              loading="lazy"
            />
            <figcaption>
              Supplied studio garment reference. It is not a GC product
              listing.
            </figcaption>
          </figure>
          <p>
            The logos, slogan artwork and sand garment reference were supplied
            by the brand. The people, campaign photos and charcoal hoodie are
            AI-generated concepts, not customer testimonials, finished
            merchandise or existing team partnerships.
          </p>
          <p>
            Wherever the gorilla mark appears on a garment, in the
            photographs, the campaign prints and the opening film, it is the
            supplied artwork placed onto the AI-generated image; the image
            generator’s own version of the mark has been removed.
          </p>
          <p>
            The $78 hoodie price and sizes are illustrative examples requested
            for this mockup. Product details, final pricing, availability and
            program terms need confirmation before launch. Checkout is a demo;
            no orders or applications can be placed here.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
