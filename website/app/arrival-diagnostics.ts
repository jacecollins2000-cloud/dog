// Opt-in, device-local tracing. No requests, storage, or automatic transmission.
export const arrivalDiagnostics = String.raw`(function () {
  if (location.search.indexOf('diagnose=arrival') === -1) return;
  var started = Date.now();
  var report = { build: '28', events: [], errors: [] };
  window.__gcArrivalDiagnostic = report;
  report.mark = function (name, detail) {
    if (report.events.length < 60) report.events.push({ ms: Date.now() - started, event: name, detail: detail });
  };
  report.mark('diagnostic-start');
  addEventListener('error', function (event) {
    if (report.errors.length < 6 && event.message) report.errors.push(String(event.message).slice(0,240));
  });
  addEventListener('unhandledrejection', function (event) {
    if (report.errors.length < 6) report.errors.push(String(event.reason && (event.reason.message || event.reason)).slice(0,240));
  });
  var previous = '';
  function sample(event) {
    var root = document.documentElement;
    var film = document.querySelector('.campaign-film');
    var veil = document.querySelector('.arrival-veil');
    var header = document.querySelector('.site-header');
    var state = {
      phase: root.getAttribute('data-gc-arrival'),
      end: root.getAttribute('data-gc-arrival-end'),
      motion: root.getAttribute('data-gc-motion'),
      scrollY: window.scrollY,
      headerTop: header ? Math.round(header.getBoundingClientRect().top) : null,
      scrollGuard: root.getAttribute('data-gc-scroll-start'),
      film: film ? Math.round(film.currentTime * 100) / 100 : null,
      paused: film ? film.paused : null,
      veil: veil ? getComputedStyle(veil).opacity : null,
      veilBox: veil ? [veil.getBoundingClientRect().width,veil.getBoundingClientRect().height] : null,
      header: header && header.firstElementChild ? getComputedStyle(header.firstElementChild).opacity : null
    };
    var key = [state.phase,state.end,state.motion,state.paused,Math.round(Number(state.veil)*4),state.header,state.scrollY,state.scrollGuard].join('|');
    if (key !== previous || event) {
      report.mark(event && event.type || 'frame',state);
      previous = key;
    }
  }
  ['playing','waiting','pause','loadeddata'].forEach(function(name){document.addEventListener(name,sample,true);});
  var poll = setInterval(function(){sample();},100);
  setTimeout(function(){clearInterval(poll);sample({type:'check-finished'});},12000);
})();`;
