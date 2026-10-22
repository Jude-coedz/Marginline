/** Adapted status mark pattern from DavidHDev/react-bits/src/ts-default/Micro/StatusMark (MIT).
 * Uses lightweight CSS transitions + accessible labels instead of canvas. */
import React from 'react';
export default function StatusMark({state='idle',size=18}){
 const label={idle:'Not started',running:'Searching',done:'Completed',error:'Error'}[state]||state;
 return <span className={`rb-status rb-status--${state}`} role="img" aria-label={label} style={{width:size,height:size}}>
   <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
    <circle className="rb-status__track" cx="12" cy="12" r="9.5" strokeWidth="2"/>
    <circle className="rb-status__ring" cx="12" cy="12" r="9.5" strokeWidth="2"/>
    <path className="rb-status__check" d="m7 12 3.2 3.3L17.5 8" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/>
    <path className="rb-status__cross" d="m8 8 8 8m0-8-8 8" strokeWidth="2.1" strokeLinecap="round"/>
   </svg>
 </span>;
}