// Inline before hydration so mobile loading time cannot skip the opening.
export const arrivalBootstrap = String.raw`(() => {
  window.__gcArrivalDiagnostic?.mark('bootstrap-start');
  const root = document.documentElement;
  const query = new URLSearchParams(location.search);
  const returning = performance.getEntriesByType?.('navigation')[0]?.type === 'back_forward';
  const atOpening = () => !location.hash || location.hash === '#top';
  const sharedOpening = location.pathname === '/' && query.get('intro') === '1' && location.hash === '#top';
  // An explicit shared opening is a presentation entrance, including when a
  // phone revives its saved document. Reload once on a persisted pageshow so
  // the current markup, film clock and arrival bootstrap all start together.
  // Ordinary shopping/history navigation keeps its usual restoration behavior.
  if (sharedOpening) addEventListener('pageshow', event => {
    if (event.persisted && location.hash === '#top') location.reload();
  });
  // A fresh homepage and a refresh begin at the film. Preserve explicit anchors
  // and back/forward history; never fight a visitor's own navigation or scrolling.
  if (location.pathname === '/' && atOpening() && (!returning || sharedOpening)) {
    const restoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    root.dataset.gcScrollStart = 'top';
    let active = true;
    let shownOnce = false;
    let settleTimer;
    let deadline;
    let frame;
    const inputs = ['pointerdown', 'touchstart', 'wheel', 'keydown', 'focusin', 'hashchange', 'pagehide'];
    const top = () => {
      if (!active || !atOpening()) return;
      // Do not let a browser's ScrollOptions support abort the film bootstrap.
      // The numeric overload plus explicit CSS also avoids a smooth reset.
      const behavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      try { window.scrollTo(0, 0); } catch { /* Scroll recovery must not prevent the opening. */ }
      finally { root.style.scrollBehavior = behavior; }
    };
    const release = () => {
      if (!active) return;
      active = false;
      clearTimeout(settleTimer);
      clearTimeout(deadline);
      cancelAnimationFrame(frame);
      delete root.dataset.gcScrollStart;
      history.scrollRestoration = restoration;
      inputs.forEach(name => removeEventListener(name, release));
      document.removeEventListener('DOMContentLoaded', top);
      document.removeEventListener('loadeddata', filmReady, true);
      document.removeEventListener('playing', filmReady, true);
      removeEventListener('pageshow', shown);
      removeEventListener('scroll', correct);
      removeEventListener('resize', settle);
      removeEventListener('gc-arrival-finish', settle);
      window.visualViewport?.removeEventListener('resize', settle);
    };
    const correct = () => {
      if (!active) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(top);
    };
    const settle = () => {
      if (!active) return;
      top();
      correct();
      // Mobile restoration, viewport sizing and media layout may happen after
      // pageshow's first frame. Keep the guard through that settling period.
      if (shownOnce) {
        clearTimeout(settleTimer);
        settleTimer = setTimeout(release, 1500);
      }
    };
    const filmReady = event => {
      if (event.target instanceof HTMLVideoElement && event.target.classList.contains('campaign-film')) settle();
    };
    const shown = event => {
      if (event?.persisted) { release(); return; }
      shownOnce = true;
      settle();
    };
    inputs.forEach(name => addEventListener(name, release, { passive: true }));
    document.addEventListener('DOMContentLoaded', top);
    document.addEventListener('loadeddata', filmReady, true);
    document.addEventListener('playing', filmReady, true);
    addEventListener('pageshow', shown);
    addEventListener('scroll', correct, { passive: true });
    addEventListener('resize', settle, { passive: true });
    addEventListener('gc-arrival-finish', settle);
    window.visualViewport?.addEventListener('resize', settle, { passive: true });
    deadline = setTimeout(release, 12000);
    top();
    if (document.readyState === 'complete') shown();
  }
  const saved = (store, key) => { try { return window[store].getItem(key); } catch { return null; } };
  const choice = saved('localStorage', 'gc-film-playback');
  const full = query.get('motion') === 'full' ||
    (query.get('motion') !== 'system' && saved('sessionStorage', 'gc-preview-motion') === 'full');
  const motion = full || choice === 'play' ||
    (choice !== 'pause' && !matchMedia('(prefers-reduced-motion: reduce)').matches);
  // The explicit preview also applies before React arrives on a slow phone.
  if (full) root.dataset.gcMotion = 'full';
  if (location.pathname !== '/' || !atOpening() || (returning && !sharedOpening) || !motion) {
    window.__gcArrivalDiagnostic?.mark('skip', { path: location.pathname, hash: location.hash, returning, motion, choice, full });
    return;
  }

  let timer;
  let ended = '';
  const isFilm = event => event.target instanceof HTMLVideoElement && event.target.classList.contains('campaign-film');
  const dark = () => {
    window.__gcArrivalDiagnostic?.mark('dark');
    ended = '';
    root.dataset.gcArrival = 'dark';
    delete root.dataset.gcArrivalEnd;
    delete root.dataset.gcArrivalPlaying;
    root.style.setProperty('--arrival-light', '0');
    root.style.setProperty('--arrival-veil', '1');
    root.style.setProperty('--arrival-still', '1');
  };
  const finish = reason => {
    window.__gcArrivalDiagnostic?.mark('finish', reason);
    ended = reason;
    root.dataset.gcArrival = 'lit';
    root.dataset.gcArrivalEnd = reason;
    clearTimeout(timer);
    // Once lit, the page stays lit: a first frame that arrives after the loading guard plays in the lit hero
    // instead of darkening it again under a visitor who may already be reading or reaching for the action.
    removeEventListener('pointerdown', interact);
    removeEventListener('touchstart', interact);
    removeEventListener('wheel', interact);
    removeEventListener('keydown', interact);
    removeEventListener('hashchange', navigate);
    removeEventListener('pagehide', navigate);
    removeEventListener('gc-arrival-finish', done);
    document.removeEventListener('playing', playing, true);
    document.removeEventListener('waiting', waiting, true);
  };
  const arm = delay => { clearTimeout(timer); timer = setTimeout(() => finish('timeout'), delay); };
  // A phone can retarget a tap's synthesized click after pointerdown reveals the
  // page. Guard that activation before React hydrates, when the hidden link has
  // no component listener yet. The next gesture remains immediately usable.
  let activationTimer;
  const clearActivation = () => {
    clearTimeout(activationTimer);
    removeEventListener('click', suppressActivation, true);
    removeEventListener('pointerdown', clearActivation, true);
    removeEventListener('pointercancel', clearActivation, true);
    removeEventListener('touchcancel', clearActivation, true);
  };
  const suppressActivation = event => {
    if (event.target?.closest?.('a.campaign-discover')) event.preventDefault();
    clearActivation();
  };
  // Browser scroll restoration emits scroll too. Only actual input dismisses us.
  const interact = event => {
    if (root.dataset.gcArrival === 'dark' && (event.type === 'pointerdown' || event.type === 'touchstart')) {
      addEventListener('click', suppressActivation, true);
      addEventListener('pointerdown', clearActivation, true);
      addEventListener('pointercancel', clearActivation, true);
      addEventListener('touchcancel', clearActivation, true);
      activationTimer = setTimeout(clearActivation, 1500);
    }
    finish('interaction');
  };
  const navigate = () => finish('navigation');
  const done = event => finish(event.detail || 'complete');
  const playing = event => {
    if (!isFilm(event) || ended) return;
    // This guard starts with playback, rather than expiring while the phone loads JS/media.
    arm(4000);
  };
  const waiting = event => { if (isFilm(event) && root.dataset.gcArrival === 'dark') arm(4000); };
  dark();
  addEventListener('pointerdown', interact, { passive: true });
  addEventListener('touchstart', interact, { passive: true });
  addEventListener('wheel', interact, { passive: true });
  addEventListener('keydown', interact);
  addEventListener('hashchange', navigate);
  addEventListener('pagehide', navigate);
  addEventListener('gc-arrival-finish', done);
  document.addEventListener('playing', playing, true);
  document.addEventListener('waiting', waiting, true);
  arm(8000);
})();`;
