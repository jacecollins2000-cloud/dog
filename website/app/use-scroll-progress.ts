'use client';

import { useEffect, useRef } from 'react';

export const calmMotion = () =>
  matchMedia('(prefers-reduced-motion: reduce)').matches && document.documentElement.dataset.gcMotion !== 'full';

/** Height of the sticky site header, shared with CSS through --chrome. */
export const chromeHeight = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chrome')) || 0;

/**
 * Viewport height that doesn't change when a phone's browser toolbar collapses (100svh),
 * so scroll-linked progress doesn't jump mid-scroll on iOS Safari.
 */
let probe: HTMLDivElement | null = null;
export const stableHeight = () => {
  if (!probe) {
    probe = document.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:100svh;visibility:hidden;pointer-events:none';
    document.body.appendChild(probe);
  }
  return probe.offsetHeight || innerHeight;
};

export type ScrollFrame = { pin: number; view: number; enter: number; top: number; height: number; chrome: number };

/**
 * Writes scroll progress onto an element as CSS custom properties, once per frame:
 * --pin   0→1 while a tall section scrolls past its sticky stage (stage pinned under the header).
 * --view  0→1 from the moment the element enters at the bottom until it leaves at the top.
 * --enter 0→1 while the element scrolls in, reaching 1 once it fills the space under the header.
 * With reduced motion the element gets data-still and every value rests at 1, so the final state shows.
 */
export function useScrollProgress<T extends HTMLElement>(onFrame?: (element: T, frame: ScrollFrame) => void) {
  const ref = useRef<T>(null);
  const callback = useRef(onFrame);
  useEffect(() => { callback.current = onFrame; });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    const measure = () => {
      frame = 0;
      const box = element.getBoundingClientRect();
      const chrome = chromeHeight();
      if (calmMotion()) {
        element.dataset.still = 'true';
        for (const name of ['--pin', '--view', '--enter']) element.style.setProperty(name, '1');
        callback.current?.(element, { pin: 1, view: 1, enter: 1, top: box.top, height: box.height, chrome });
        return;
      }
      delete element.dataset.still;
      const vh = stableHeight();
      const stage = vh - chrome;
      const pin = clamp((chrome - box.top) / Math.max(1, box.height - stage));
      const view = clamp((vh - box.top) / (vh + box.height));
      const enter = clamp((vh - box.top) / Math.max(1, Math.min(box.height, stage)));
      element.style.setProperty('--pin', pin.toFixed(4));
      element.style.setProperty('--view', view.toFixed(4));
      element.style.setProperty('--enter', enter.toFixed(4));
      callback.current?.(element, { pin, view, enter, top: box.top, height: box.height, chrome });
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    measure();
    // Layout changes (images loading, fonts) re-measure without faking a scroll event.
    const resize = new ResizeObserver(request);
    resize.observe(element);
    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', request);
    motion.addEventListener('change', request);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      removeEventListener('scroll', request);
      removeEventListener('resize', request);
      motion.removeEventListener('change', request);
    };
  }, []);

  return ref;
}
