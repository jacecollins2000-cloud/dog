'use client';
/* oxlint-disable next/no-img-element */
import { useEffect, useRef } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';

export function ShoppingBagPanel({open,onOpenChange,size,onRemove,onCheckout}:{open:boolean;onOpenChange:(open:boolean)=>void;size:string;onRemove:()=>void;onCheckout:()=>void}) {
  // Removing the only item replaces the Remove button; keep keyboard focus on the empty bag's next action.
  const removed = useRef(false);
  const emptyAction = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!removed.current || size) return;
    removed.current = false;
    const timer = setTimeout(() => emptyAction.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, [size]);
  // "Explore the hoodie" hands focus to the size group it leads to, not back to the bar's bag button;
  // closing into the checkout hands nothing back, since the checkout dialog has already taken focus.
  const exploring = useRef(false);
  const toCheckout = useRef(false);
  const finalFocus = () => {
    if (toCheckout.current) { toCheckout.current = false; return false; }
    if (!exploring.current) return true;
    exploring.current = false;
    const sizes = document.getElementById('collection-sizes');
    if (!sizes) return true;
    // Bring the sizes to the middle of the screen first, so the focus ring is always in view (phones put them below the image).
    setTimeout(() => {
      const calm = matchMedia('(prefers-reduced-motion: reduce)').matches && document.documentElement.dataset.gcMotion !== 'full';
      sizes.scrollIntoView({ block: 'center', behavior: calm ? 'auto' : 'smooth' });
      sizes.focus({ preventScroll: true });
    }, 0);
    return false;
  };
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="shopping-bag-panel" showCloseButton={false} finalFocus={finalFocus}>
    <div className="bag-heading"><SheetTitle>Your bag <span>({size ? '1' : '0'})</span></SheetTitle><button className="icon-button" onClick={()=>onOpenChange(false)} aria-label="Close bag"><X size={22}/></button></div>
    <SheetDescription className="bag-note">A preview of the GC shopping experience.</SheetDescription>
    {size ? <><div className="bag-item"><img src="/assets/hoodie-clean-v3.webp" alt="Charcoal GC Hoodie" width="1122" height="1402"/><div><h3>The GC Hoodie</h3><p>Charcoal / {size}</p><p>$78 USD</p><button onClick={() => { removed.current = true; onRemove(); }}>Remove</button></div></div><div className="bag-checkout"><div><span>Subtotal</span><strong>$78 USD</strong></div><button className="collection-buy" onClick={() => { toCheckout.current = true; onCheckout(); }}>Continue to checkout <ArrowRight size={18}/></button><p>Demo only. Example price. No payment collected.</p></div></> : <div className="bag-empty"><p>Your bag is empty.</p><a ref={emptyAction} className="collection-buy" href="#collection" onClick={event=>{ event.preventDefault(); exploring.current = true; onOpenChange(false); }}>Explore the hoodie <ArrowRight size={18}/></a></div>}
  </SheetContent></Sheet>;
}
