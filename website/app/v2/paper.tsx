/* Torn paper. The edge uses two photographed tears (generated, keyed to alpha, joined into a seamless tile),
   so every tear on the page shares the same fibrous rim. `variant` slides the pattern so neighbouring tears differ. */

/**
 * Paper torn along one edge, drawn just outside its parent section so the section looks pasted over its neighbour.
 * `edge="top"` hangs above the section; `edge="bottom"` hangs below it.
 */
export function TornEdge({ edge, variant = 0 }: { edge: 'top' | 'bottom'; variant?: number }) {
  return <span className={`torn torn-${edge}`} style={{ '--tear-shift': `${-((variant * 587) % 1500)}px` } as React.CSSProperties} aria-hidden="true" />;
}
