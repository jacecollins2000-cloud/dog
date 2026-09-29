'use client';
/* oxlint-disable next/no-img-element */
import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import './campaign-posters.css';
const prints = [
  ['Own it.', 'Individuality', 'gc-print-own-v2.webp', 'A seated adult in the charcoal GC Hoodie, framed by an oversized hood, with red halftone Own it typography.'],
  ['Move.', 'Action', 'gc-print-move-v2.webp', 'An adult dancer wearing the GC Hoodie, with vertical red Move typography and oversized drawcords.'],
  ['Together.', 'Loyalty', 'gc-print-together-v2.webp', 'Three adult friends in GC clothing, surrounded by a photographic hood collage and red Together typography.'],
];
export function CampaignPosters() {
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  function go(index: number) {
    const parent=rail.current, target=parent?.children[index] as HTMLElement | undefined;
    if(!parent || !target) return;
    parent.scrollTo({left:target.offsetLeft-parent.offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  return <section id="about" className="gc-poster-story" aria-labelledby="gc-poster-story-title">
    <div className="gc-poster-intro"><p>THE WORLD OF GUERRILLA CAMP</p><h2 id="gc-poster-story-title">A mind of your own.<br/>People in your corner.</h2><p>Individuality, with a place to belong.</p></div>
    <div className="gc-poster-rail" ref={rail} onScroll={event => { const node=event.currentTarget; const width=(node.children[0] as HTMLElement)?.offsetWidth+16; if(width) setActive(Math.max(0,Math.min(2,Math.round(node.scrollLeft/width)))); }} aria-label="GC campaign poster series">
      {prints.map(([title,theme,src,alt],index)=><figure key={title} className="gc-art-print"><img src={`/assets/${src}`} alt={alt} width="1122" height="1402" loading="lazy" /><figcaption><span>0{index+1} / {theme}</span><span>{title}</span></figcaption></figure>)}
    </div>
    <div className="gc-poster-mobile-nav"><span aria-live="polite">0{active+1} / 03</span><div><button onClick={()=>go(active-1)} disabled={active===0} aria-label="Previous GC poster"><ArrowLeft size={18}/></button><button onClick={()=>go(active+1)} disabled={active===2} aria-label="Next GC poster"><ArrowRight size={18}/></button></div></div>
    <p className="gc-art-note">Original campaign artwork. Illustrative imagery.</p>
  </section>;
}
