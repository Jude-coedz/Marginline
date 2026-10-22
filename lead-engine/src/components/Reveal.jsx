/** Adapted from DavidHDev/canvas-ui, src/components/landing/reveal.tsx (MIT).
 * IntersectionObserver reveal: quiet, reduced-motion safe, no dependency. */
import {useEffect,useRef} from 'react';
export default function Reveal({children,className='',delay=0,as:Tag='div'}){
 const ref=useRef(null);
 useEffect(()=>{const el=ref.current;if(!el)return; if(!('IntersectionObserver' in window)){el.dataset.inView='true';return;}
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced){el.dataset.inView='true';return;}
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){el.dataset.inView='true';observer.disconnect()}},{rootMargin:'0px 0px -40px 0px'});
  observer.observe(el);return()=>observer.disconnect();
 },[]);
 return <Tag ref={ref} className={`rb-reveal ${className}`} style={{transitionDelay:`${delay}ms`}}>{children}</Tag>;
}