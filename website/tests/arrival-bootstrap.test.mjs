import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { arrivalBootstrap } from '../app/arrival-bootstrap.ts';
import { arrivalLightAt, SWITCH_LIGHT } from '../app/arrival-timing.ts';

function open({ search = '?motion=full', hash = '', reduced = false, blockedStorage = false, choice = null, navigation = 'navigate', initialY = 0, rejectScrollOptions = false, failedScroll = false } = {}) {
  const listeners = new Map();
  const mediaListeners = new Map();
  const viewportListeners = new Map();
  const timers = new Map();
  let now = 0, sequence = 0, reloads = 0;
  const root = { dataset: {}, style: { setProperty() {} } };
  const bind = store => (name, fn) => { if (!store.has(name)) store.set(name, new Set()); store.get(name).add(fn); };
  const unbind = store => (name, fn) => store.get(name)?.delete(fn);
  class Video { classList = { contains: name => name === 'campaign-film' }; }
  const storage = { getItem(key) { if (blockedStorage) throw new Error('Storage blocked'); return key === 'gc-arrival-seen' ? '1' : key === 'gc-film-playback' ? choice : null; } };
  const context = {
    document: { documentElement: root, addEventListener: bind(mediaListeners), removeEventListener: unbind(mediaListeners) },
    window: { localStorage: storage, sessionStorage: storage,
      visualViewport: { addEventListener: bind(viewportListeners), removeEventListener: unbind(viewportListeners) },
      scrollTo(x, y) {
      if (failedScroll || (rejectScrollOptions && typeof x === 'object')) throw new TypeError('Unsupported scroll options');
      context.scrollY = typeof x === 'object' ? x.top : y;
    } },
    history: { scrollRestoration: 'auto' },
    performance: { getEntriesByType: () => [{ type: navigation }] },
    requestAnimationFrame(fn) { return context.setTimeout(fn, 16); },
    cancelAnimationFrame(id) { context.clearTimeout(id); },
    location: { pathname: '/', hash, search, reload() { reloads++; } }, URLSearchParams, HTMLVideoElement: Video,
    matchMedia: () => ({ matches: reduced }), scrollY: initialY,
    addEventListener: bind(listeners), removeEventListener: unbind(listeners),
    setTimeout(fn, delay) { timers.set(++sequence, { at: now + delay, fn }); return sequence; },
    clearTimeout(id) { timers.delete(id); },
  };
  vm.runInNewContext(arrivalBootstrap, context);
  const dispatch = (store, name, event = {}) => [...(store.get(name) || [])].forEach(fn => fn({ type: name, ...event }));
  return {
    root,
    get y() { return context.scrollY; },
    get restoration() { return context.history.scrollRestoration; },
    get reloads() { return reloads; },
    tick(delay) {
      const until = now + delay;
      for (;;) {
        const due = [...timers].filter(([, t]) => t.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) break;
        now = due[1].at; timers.delete(due[0]); due[1].fn();
      }
      now = until;
    },
    play: () => dispatch(mediaListeners, 'playing', { target: new Video() }),
    buffer: () => dispatch(mediaListeners, 'waiting', { target: new Video() }),
    finish: () => dispatch(listeners, 'gc-arrival-finish', { detail: 'complete' }),
    touch: () => dispatch(listeners, 'pointerdown'),
    click: (heroAction = true) => {
      let prevented = false;
      dispatch(listeners, 'click', {
        target: { closest: selector => heroAction && selector === 'a.campaign-discover' ? {} : null },
        preventDefault() { prevented = true; },
      });
      return prevented;
    },
    wheel: () => dispatch(listeners, 'wheel'),
    focus: () => dispatch(listeners, 'focusin'),
    viewportResize: () => dispatch(viewportListeners, 'resize'),
    show: (persisted = false) => dispatch(listeners, 'pageshow', { persisted }),
    restoreScroll(y = 844) { context.scrollY = y; dispatch(listeners, 'scroll'); },
  };
}

test('returning phone preview still starts dark despite the old seen flag', () => {
  assert.equal(open().root.dataset.gcArrival, 'dark');
});
test('slow mobile loading does not consume the film intro deadline', () => {
  const page = open(); page.tick(4500); page.play(); page.tick(1700);
  assert.equal(page.root.dataset.gcArrival, 'dark');
  page.finish(); assert.equal(page.root.dataset.gcArrival, 'lit');
});
test('a short buffering event does not cancel the opening', () => {
  const page = open(); page.play(); page.tick(500); page.buffer(); page.tick(700); page.play();
  assert.equal(page.root.dataset.gcArrival, 'dark');
});
test('a late first frame can recover after the loading guard', () => {
  const page = open(); page.tick(8500); assert.equal(page.root.dataset.gcArrival, 'lit');
  page.play(); assert.equal(page.root.dataset.gcArrival, 'dark');
});
test('touch or wheel input dismisses the intro permanently for this visit', () => {
  for (const action of ['touch', 'wheel']) {
    const page = open(); page[action](); page.play();
    assert.equal(page.root.dataset.gcArrival, 'lit');
    assert.equal(page.root.dataset.gcArrivalEnd, 'interaction');
  }
});

test('an opening tap cannot retarget its click onto the hidden shop link before hydration', () => {
  const page = open(); page.touch();
  assert.equal(page.root.dataset.gcArrival, 'lit');
  assert.equal(page.click(), true);
  page.touch();
  assert.equal(page.click(), false, 'the next deliberate shop tap must work immediately');
});

test('opening tap protection preserves visible header navigation and subsequent gestures', () => {
  const header = open(); header.touch();
  assert.equal(header.click(false), false);
  const noClick = open(); noClick.touch(); noClick.touch();
  assert.equal(noClick.click(), false, 'a gesture with no click must not consume the next tap');
});

test('shop protection expires and never applies to reduced-motion visits', () => {
  const page = open(); page.touch(); page.tick(1501);
  assert.equal(page.click(), false);
  const still = open({ search: '', reduced: true }); still.touch();
  assert.equal(still.click(), false);
});

test('refresh at the product returns to the film even after late browser restoration', () => {
  const page = open({ navigation: 'reload', initialY: 844 });
  assert.equal(page.y, 0);
  assert.equal(page.restoration, 'manual');
  page.show(); page.restoreScroll(); page.tick(16);
  assert.equal(page.y, 0);
  assert.equal(page.restoration, 'manual');
  page.tick(1500);
  assert.equal(page.restoration, 'auto');
  assert.equal(page.root.dataset.gcArrival, 'dark');
});

test('automatic scroll events do not masquerade as visitor input', () => {
  const page = open(); page.restoreScroll();
  assert.equal(page.root.dataset.gcArrival, 'dark');
  page.show(); page.tick(16); assert.equal(page.y, 0);
});

test('early visitor scrolling cancels the reset instead of dragging them back up', () => {
  const page = open(); page.touch(); page.restoreScroll(); page.show(); page.tick(16);
  assert.equal(page.y, 844);
  assert.equal(page.restoration, 'auto');
  assert.equal(page.root.dataset.gcArrivalEnd, 'interaction');
});

test('intentional collection links and back navigation retain their location', () => {
  for (const options of [{ hash: '#collection' }, { navigation: 'back_forward' }]) {
    const page = open({ ...options, initialY: 844 }); page.show(); page.tick(16);
    assert.equal(page.y, 844);
    assert.equal(page.restoration, 'auto');
    assert.equal(page.root.dataset.gcArrival, undefined);
  }
});
test('the page does not black out again when the video loops', () => {
  const page = open(); page.play(); page.finish(); page.play();
  assert.equal(page.root.dataset.gcArrival, 'lit');
});
test('blocked storage does not prevent the explicit motion preview', () => {
  assert.equal(open({ blockedStorage: true, reduced: true }).root.dataset.gcArrival, 'dark');
});
test('normal reduced motion, pause and deep links skip the intro', () => {
  for (const options of [{ search: '', reduced: true }, { search: '', choice: 'pause' }, { hash: '#collection' }])
    assert.equal(open(options).root.dataset.gcArrival, undefined);
});
test('a stalled film cannot leave the visitor under the dark overlay', () => {
  const page = open(); page.play(); page.tick(4100);
  assert.equal(page.root.dataset.gcArrival, 'lit');
});

test('a browser rejecting scroll options still resets and starts dark', () => {
  const page = open({ rejectScrollOptions: true, initialY: 844 });
  assert.equal(page.y, 0);
  assert.equal(page.root.dataset.gcArrival, 'dark');
});

test('an unavailable scroll API cannot abort the opening', () => {
  assert.equal(open({ failedScroll: true }).root.dataset.gcArrival, 'dark');
});

test('the entire first half-second of playback is opaque black', () => {
  for (const time of [0, .1, .3, .499, .5]) {
    assert.equal(arrivalLightAt(time).veil, 1);
    assert.equal(arrivalLightAt(time).light, 0);
  }
});

test('the dim room becomes visible before the bulb, with the page still unlit', () => {
  assert.ok(arrivalLightAt(.8).veil < 1);
  assert.equal(arrivalLightAt(1.2).veil, .4);
  assert.equal(arrivalLightAt(SWITCH_LIGHT - .01).light, 0);
});

test('the site illuminates only at the ceiling-light cue and fully clears', () => {
  assert.equal(arrivalLightAt(SWITCH_LIGHT).light, 0);
  assert.ok(arrivalLightAt(SWITCH_LIGHT + .1).light > 0);
  assert.equal(arrivalLightAt(SWITCH_LIGHT + .23).light, 1);
  assert.equal(arrivalLightAt(SWITCH_LIGHT + .23).veil, 0);
});

test('late mobile restoration cannot hide the header after pageshow', () => {
  const page = open(); page.show(); page.tick(350);
  page.restoreScroll(74); page.tick(16);
  assert.equal(page.y, 0);
  page.tick(400); page.restoreScroll(844); page.tick(16);
  assert.equal(page.y, 0);
});

test('first film playback and mobile viewport sizing extend the initial settling window', () => {
  const page = open(); page.show(); page.tick(1300); page.play();
  page.tick(600); page.restoreScroll(74); page.viewportResize(); page.tick(16);
  assert.equal(page.y, 0);
  assert.equal(page.restoration, 'manual');
  page.tick(1500);
  assert.equal(page.restoration, 'auto');
  assert.equal(page.root.dataset.gcScrollStart, undefined);
});

test('real scrolling or focus wins over all pending startup corrections', () => {
  for (const input of ['touch', 'wheel', 'focus']) {
    const page = open(); page.show(); page.restoreScroll(74);
    page[input](); page.restoreScroll(844); page.play(); page.viewportResize(); page.tick(2000);
    assert.equal(page.y, 844);
    assert.equal(page.restoration, 'auto');
  }
});

test('startup scroll corrections end after settling and cannot pull later navigation back', () => {
  const page = open(); page.show(); page.tick(1600); page.restoreScroll(844); page.play(); page.tick(100);
  assert.equal(page.y, 844);
  assert.equal(page.restoration, 'auto');
});

test('a page that never finishes loading cannot leave a permanent scroll guard', () => {
  const page = open(); page.tick(12100);
  assert.equal(page.restoration, 'auto');
  assert.equal(page.root.dataset.gcScrollStart, undefined);
});

test('the explicit top anchor starts the intro instead of being treated as a product deep link', () => {
  const page = open({ hash: '#top', initialY: 74 });
  page.show(); page.restoreScroll(844); page.tick(16);
  assert.equal(page.y, 0);
  assert.equal(page.root.dataset.gcArrival, 'dark');
});

test('the shared entrance starts at the top even when loaded through history', () => {
  const page = open({ search: '?motion=full&intro=1&v=27', hash: '#top', navigation: 'back_forward', initialY: 844 });
  assert.equal(page.y, 0);
  assert.equal(page.root.dataset.gcArrival, 'dark');
});

test('reviving the explicit shared opening reloads once, while a fresh load never reloads', () => {
  const page = open({ search: '?motion=full&intro=1&v=27', hash: '#top' });
  page.show(); page.play(); page.finish(); page.tick(2000);
  assert.equal(page.reloads, 0);
  page.show(true);
  assert.equal(page.reloads, 1);
  page.show(false);
  assert.equal(page.reloads, 1);
});

test('ordinary history and product deep links are not forced to restart', () => {
  for (const options of [{}, { search: '?motion=full&intro=1', hash: '#collection' }]) {
    const page = open(options); page.show(true);
    assert.equal(page.reloads, 0);
  }
});
