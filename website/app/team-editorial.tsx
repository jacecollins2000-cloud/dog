'use client';
/* oxlint-disable next/no-img-element */

import { ArrowDown, ArrowUpRight } from 'lucide-react';

/* Poster type over open paper; the cutout of the group stands on the page's own surface. */
export function TeamEditorial({ onBrief }: { onBrief: () => void }) {
  return <section className="gc-team-hero" data-tone="light" aria-labelledby="gc-teams-title">
    <div className="gc-team-hero-copy">
      <p className="gc-label"><span className="gc-num">GC</span> For teams &amp; supporters</p>
      <h1 id="gc-teams-title" className="gc-team-title"><span>Your</span> <span>team.</span></h1>
      <p className="gc-team-statement"><span>For the team.</span> <span className="gc-echo">And everyone behind it.</span></p>
      <p className="gc-team-description">A collection for the people putting in the work—and the people cheering them on. Explore GC’s developing youth fundraising program.</p>
      <div className="gc-team-actions">
        <button className="gc-btn" onClick={onBrief}>Build a team brief <ArrowUpRight size={18} aria-hidden="true" /></button>
        <a className="gc-link" href="#program">How it would work <ArrowDown size={15} aria-hidden="true" /></a>
      </div>
      <small className="gc-note">Local planning tool. Nothing is sent to GC.</small>
    </div>
    <figure className="gc-team-people">
      <img src="/assets/gc-team-cutout-v1.webp" alt="Illustrative GC campaign: four adult friends wearing black, cream and sand gorilla-mark sweatshirts" width="1371" height="1148" loading="eager" fetchPriority="high" />
      <figcaption className="gc-note">Program in development · Illustrative campaign</figcaption>
    </figure>
  </section>;
}
