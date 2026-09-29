'use client';

import { useEffect, useRef } from 'react';

/** Wait for imagery before revealing it; the page stays visible without enhancement. */
export function useEditorialMotion() {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = mainRef.current;
    if (!root || !('IntersectionObserver' in window)) return;

    let disposed = false;
    const visible = new Set<Element>();
    const pending = new Set<Element>();

    const reveal = async (target: Element) => {
      if (pending.has(target) || target.classList.contains('has-entered'))
        return;
      pending.add(target);
      // Hidden alternate product views must not delay the visible hoodie's entrance.
      const images = Array.from(target.querySelectorAll('img')).filter(image => !image.closest('[aria-hidden="true"]'));
      await Promise.allSettled(images.map((image) => image.decode()));
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      pending.delete(target);
      if (disposed || !visible.has(target) || document.hidden) return;
      target.classList.add('has-entered');
      if (target.getAttribute('data-reveal') !== 'repeat')
        observer.unobserve(target);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const threshold = Number(entry.target.getAttribute('data-reveal-threshold') || .3);
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            visible.add(entry.target);
            void reveal(entry.target);
          } else {
            visible.delete(entry.target);
            if (!entry.isIntersecting && entry.target.getAttribute('data-reveal') === 'repeat') {
              entry.target.classList.remove('has-entered');
            }
          }
        }
      },
      { threshold: [0, 0.3, 0.6] },
    );
    root
      .querySelectorAll('[data-reveal]')
      .forEach((element) => observer.observe(element));
    const resumeVisible = () => {
      if (!document.hidden) visible.forEach((target) => void reveal(target));
    };
    document.addEventListener('visibilitychange', resumeVisible);
    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener('visibilitychange', resumeVisible);
    };
  }, []);

  return mainRef;
}
