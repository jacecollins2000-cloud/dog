'use client';

import { useEffect, useRef, useState } from 'react';

export function ArrivalDiagnosticPanel() {
  const [report, setReport] = useState('');
  const [copied, setCopied] = useState(false);
  const field = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (new URLSearchParams(location.search).get('diagnose') !== 'arrival') return;
    const collect = () => {
      let navigation = 'unknown';
      try { navigation = (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming)?.type ?? 'unknown'; } catch { /* Report missing support. */ }
      const trace = (window as Window & { __gcArrivalDiagnostic?: unknown }).__gcArrivalDiagnostic ?? 'Early diagnostic did not run';
      setReport(JSON.stringify({
        build: '28', path: location.pathname + location.search + location.hash,
        navigation, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
        viewport: [innerWidth,innerHeight], browser: navigator.userAgent,
        finalPhase: document.documentElement.dataset.gcArrival ?? 'missing',
        finalReason: document.documentElement.dataset.gcArrivalEnd ?? 'missing', trace,
      }, null, 2));
    };
    // Appear after the opening, so the test panel cannot disturb first paint.
    const show = setTimeout(collect, 6000);
    const final = setTimeout(collect, 13000);
    return () => { clearTimeout(show); clearTimeout(final); };
  }, []);

  if (!report) return null;
  return <aside aria-label="Phone opening check" style={{position:'fixed',left:12,right:12,bottom:12,zIndex:1000,maxWidth:440,margin:'auto',background:'#fff',color:'#111',padding:18,border:'1px solid #111',borderRadius:12,boxShadow:'0 8px 40px #0004',font:'14px Arial,sans-serif'}}>
    <strong style={{fontSize:17}}>Phone opening check</strong>
    <p style={{margin:'8px 0 12px'}}>Tap Copy result, then paste it into our chat.</p>
    <textarea ref={field} aria-label="Opening diagnostic result" readOnly value={report} style={{width:'100%',height:76,display:'block',border:'1px solid #ddd',font:'11px monospace',padding:8,background:'#f7f7f7',color:'#111'}} />
    <button style={{width:'100%',marginTop:12,padding:12,background:'#111',color:'#fff',border:0,borderRadius:6,fontWeight:700}} onClick={async () => {
      try { await navigator.clipboard.writeText(report); setCopied(true); }
      catch { field.current?.focus(); field.current?.select(); }
    }}>{copied ? 'Copied — paste into our chat' : 'Copy result'}</button>
  </aside>;
}
