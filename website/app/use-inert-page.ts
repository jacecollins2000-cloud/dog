import { useLayoutEffect } from 'react';

/* Base UI hides the page behind an open modal but deliberately leaves live regions (the gallery position, the add button's
   status) exposed, and a closing sheet can hand focus back to a trigger in the header behind the next dialog. While any
   overlay is open the whole page (header, main and footer) is inert, so screen readers and Tab stay in the overlay.
   Overlays can stack (bag → checkout), so each one holds a count and the last to close releases the page. It is released
   in a layout effect, before a closing overlay returns focus to its trigger. */
export function useInertPage(active: boolean) {
  useLayoutEffect(() => {
    const main = document.getElementById('main');
    const page = main?.closest<HTMLElement>('.gc') ?? main;
    if (!active || !page) return;
    const held = Number(page.dataset.overlays ?? 0) + 1;
    page.dataset.overlays = String(held);
    page.inert = true;
    return () => {
      const left = Math.max(0, Number(page.dataset.overlays ?? 1) - 1);
      page.dataset.overlays = String(left);
      if (!left) { page.inert = false; delete page.dataset.overlays; }
    };
  }, [active]);
}
