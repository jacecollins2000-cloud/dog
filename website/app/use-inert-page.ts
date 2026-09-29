import { useEffect } from 'react';

/* Base UI hides the page behind an open modal but deliberately leaves live regions (the gallery position, the add button's
   status) exposed. While any overlay is open, the page's main content is inert, so screen readers and Tab stay in the overlay.
   Overlays can stack (bag → checkout), so each one holds a count and the last to close releases the page. */
export function useInertPage(active: boolean) {
  useEffect(() => {
    const main = document.getElementById('main');
    if (!active || !main) return;
    const held = Number(main.dataset.overlays ?? 0) + 1;
    main.dataset.overlays = String(held);
    main.inert = true;
    return () => {
      const left = Math.max(0, Number(main.dataset.overlays ?? 1) - 1);
      main.dataset.overlays = String(left);
      if (!left) { main.inert = false; delete main.dataset.overlays; }
    };
  }, [active]);
}
