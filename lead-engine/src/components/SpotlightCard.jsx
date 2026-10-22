/** Reduced, accessibility-safe implementation of React Bits SpotlightCard behavior.
 * Based on DavidHDev/react-bits/src/ts-default/Components/SpotlightCard/SpotlightCard.tsx (MIT).
 * Pointer-following spotlight used once on the action surface, not across the UI. */
import React,{useEffect,useRef} from 'react';
export default function SpotlightCard({children,className='',style={}}){
 const ref=useRef(null);
 useEffect(()=>{const el=ref.current;if(!el)return;
  const mq=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(mq.matches||window.matchMedia('(pointer: coarse)').matches)return;
  const onMove=(ev)=>{const r=el.getBoundingClientRect();el.style.setProperty('--spot-x',`${ev.clientX-r.left}px`);el.style.setProperty('--spot-y',`${ev.clientY-r.top}px`)};
  const onEnter=()=>el.classList.add('is-spotlit');const onLeave=()=>el.classList.remove('is-spotlit');
  el.addEventListener('pointermove',onMove,{passive:true});el.addEventListener('pointerenter',onEnter);el.addEventListener('pointerleave',onLeave);
  return()=>{el.removeEventListener('pointermove',onMove);el.removeEventListener('pointerenter',onEnter);el.removeEventListener('pointerleave',onLeave)};
 },[]);
 return <div ref={ref} className={`rb-spotlight ${className}`} style={style}>{children}<div className="rb-spotlight__light" aria-hidden="true"/></div>;
}