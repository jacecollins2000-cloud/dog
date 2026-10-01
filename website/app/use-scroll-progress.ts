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

export type ScrollFrame = { pin: number; view: number; enter: number; top: number; height: number; chrome: number; vh: number };

/**
 * One animation frame drives every scroll-linked chapter in two passes: every measurement first, then every style write.
 * Reading a box right after another chapter wrote its custom properties would force a fresh style and layout pass per
 * chapter; batching keeps it to one per frame, which is what keeps the scroll smooth on phones.
 */
type Entry = { read: () => void; write: () => void };
const entries = new Set<Entry>();
let frame = 0;
let shared = { chrome: 0, vh: 0, calm: false };
const measureShared = () => { shared = { chrome: chromeHeight(), vh: stableHeight(), calm: calmMotion() }; };
const run = () => {
  frame = 0;
  measureShared();
  for (const entry of entries) entry.read();
  for (const entry of entries) entry.write();
};
export const requestScrollFrame = () => { if (!frame) frame = requestAnimationFrame(run); };
let motionQuery: MediaQueryList | null = null;
const listen = (on: boolean) => {
  const method = on ? 'addEventListener' : 'removeEventListener';
  window[method]('scroll', requestScrollFrame, { passive: true });
  window[method]('resize', requestScrollFrame);
  motionQuery ??= matchMedia('(prefers-reduced-motion: reduce)');
  motionQuery[method]('change', requestScrollFrame);
};
/** Joins the shared frame: `read` may only measure, `write` may only write. Returns the unsubscribe. */
export function onScrollFrame(entry: Entry) {
  if (!entries.size) listen(true);
  entries.add(entry);
  return () => { entries.delete(entry); if (!entries.size) { listen(false); cancelAnimationFrame(frame); frame = 0; } };
}

/**
 * Writes scroll progress onto an element as CSS custom properties, once per frame:
 * --pin   0→1 while a tall section scrolls past its sticky stage (stage pinned under the header).
 * --view  0→1 from the moment the element enters at the bottom until it leaves at the top.
 * --enter 0→1 while the element scrolls in, reaching 1 once it fills the space under the header.
 * With reduced motion the element gets data-still and every value rests at 1, so the final state shows.
 * `measure` runs in the shared read pass; its result is handed to `onFrame`, which runs in the write pass.
 */
export function useScrollProgress<T extends HTMLElement, M = undefined>(onFrame?: (element: T, frame: ScrollFrame, measured: M) => void, measure?: (element: T) => M) {
  const ref = useRef<T>(null);
  const callback = useRef(onFrame);
  const reader = useRef(measure);
  useEffect(() => { callback.current = onFrame; reader.current = measure; });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    let box: DOMRect | null = null;
    let measured = undefined as M;
    const entry: Entry = {
      read() { box = element.getBoundingClientRect(); measured = reader.current?.(element) as M; },
      write() {
        if (!box) return;
        const { chrome, vh, calm } = shared;
        if (calm) {
          element.dataset.still = 'true';
          for (const name of ['--pin', '--view', '--enter']) element.style.setProperty(name, '1');
          callback.current?.(element, { pin: 1, view: 1, enter: 1, top: box.top, height: box.height, chrome, vh }, measured);
          return;
        }
        delete element.dataset.still;
        const stage = vh - chrome;
        const pin = clamp((chrome - box.top) / Math.max(1, box.height - stage));
        const view = clamp((vh - box.top) / (vh + box.height));
        const enter = clamp((vh - box.top) / Math.max(1, Math.min(box.height, stage)));
        element.style.setProperty('--pin', pin.toFixed(4));
        element.style.setProperty('--view', view.toFixed(4));
        element.style.setProperty('--enter', enter.toFixed(4));
        callback.current?.(element, { pin, view, enter, top: box.top, height: box.height, chrome, vh }, measured);
      },
    };
    // First paint is placed straight away; later frames join the shared pass.
    measureShared(); entry.read(); entry.write();
    const leave = onScrollFrame(entry);
    // Layout changes (images loading, fonts) re-measure without faking a scroll event.
    const resize = new ResizeObserver(requestScrollFrame);
    resize.observe(element);
    return () => { leave(); resize.disconnect(); };
  }, []);

  return ref;
}
