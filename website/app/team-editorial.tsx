'use client';

import { ArrowDown, ArrowUpRight } from 'lucide-react';

export function TeamEditorial({ onBrief }: { onBrief?: () => void }) {
  const Heading = onBrief ? 'h1' : 'h2';
  return <section className="team-editorial" aria-labelledby="gc-teams-title">
    <div className="team-editorial-heading">
      <p className="team-editorial-eyebrow">Guerrilla Camp <span>For teams & supporters</span></p>
      <Heading id="gc-teams-title">{onBrief ? 'Your' : 'One'}<br />{onBrief ? 'team.' : 'camp.'}</Heading>
      <span className="team-edition">(GC PARTNERSHIP PROGRAM)</span>
    </div>
    <div className="team-editorial-copy">
      <p className="team-editorial-statement">For the team.<br />And everyone behind it.</p>
      <p className="team-editorial-description">A collection for the people putting in the work—and the people cheering them on. Explore GC’s developing youth fundraising program.</p>
      <div className="team-editorial-actions">
        {onBrief ? <button className="team-pill" onClick={onBrief}>Build a team brief <ArrowUpRight size={20} /></button> : <a className="team-pill" href="/teams">GC for teams <ArrowUpRight size={20} /></a>}
        {onBrief && <a className="team-program-jump" href="#program" aria-label="How the proposed team program works"><ArrowDown size={20} /></a>}
      </div>
      {onBrief && <small className="team-editorial-note">Local planning tool. Nothing is sent to GC.</small>}
    </div>
    <figure className="team-editorial-people">
      <img src="/assets/gc-team-cutout-v1.webp" alt="Illustrative GC campaign: four adult friends wearing black, cream and sand gorilla-mark sweatshirts" width="1371" height="1148" loading={onBrief ? 'eager' : 'lazy'} fetchPriority={onBrief ? 'high' : 'auto'} />
    </figure>
    <div className="team-editorial-footer"><span>[ Individual spirit. Shared ambition. ]</span><small>Program in development · Illustrative campaign</small></div>
  </section>;
}
