'use strict';
const db=require('./db.cjs'),research=require('./research.cjs');
async function execute(input={},trigger='manual'){
 const selection=research.brief(input);
 if(!process.env.GEMINI_API_KEY)throw Error('Gemini not configured: add GEMINI_API_KEY. Brave is not required.');
 const persisted=db.connected();
 if(trigger==='scheduled'&&!persisted)throw Error('Scheduled discovery needs Supabase storage. Manual runs work without it.');
 if(persisted&&trigger==='manual')await db.saveSettings(selection);
 if(persisted){const recent=await db.listRuns();if(recent.some(r=>r.status==='running'&&Date.now()-new Date(r.started_at).getTime()<12*60*1000))throw Error('A discovery run is already in progress');}
 let run=null;
 if(persisted){run=await db.createRun({trigger,status:'running',sector:selection.sector,region:selection.region,started_at:new Date().toISOString(),found:0,added:0,verified:0});if(!run?.id)throw Error('Could not record the search run');}
 try{
  const {candidates,queries,citations,model}=await research.gather(selection);
  let added=0,verified=0;const inspected=[];const leads=[];
  const batch=await research.limitedMap(candidates,async c=>{
   let site;
   try{site=await research.auditDomain(c.domain);}catch(e){return {domain:c.domain,ok:false,error:String(e.message).slice(0,160)};}
   const s=research.scoreCandidate(site,selection);const name=research.companyName(site.title||c.name,c.domain);if(site.shopify)verified++;
   const lead={domain:c.domain,name,sector:selection.sector,region:selection.region,score:s.score,qualification:s.qualification,reason:s.reason,shopify:s.shopify,evidence:s.evidence,observed:s.observed,website:site.url,source_url:c.sourceUrl,source_type:'Gemini with Google Search',scan_status:'complete',scanned_at:site.checkedAt,updated_at:new Date().toISOString()};
   const email=research.draft({...lead,sector:selection.sectorLabel});
   if(persisted){const existing=await db.request('leads',{query:`select=id,stage&domain=eq.${encodeURIComponent(c.domain)}&limit=1`});if(existing?.length){await db.request('leads',{method:'PATCH',query:`id=eq.${encodeURIComponent(existing[0].id)}`,body:lead});lead.id=existing[0].id;lead.stage=existing[0].stage;}else{const inserted=await db.request('leads',{method:'POST',body:{...lead,stage:'new',outreach_subject:email.subject,outreach_body:email.body}});lead.id=inserted?.[0]?.id;lead.stage='new';added++;}}
   else {lead.id=c.domain;lead.stage='new';lead.outreach_subject=email.subject;lead.outreach_body=email.body;added++;}
   return {domain:c.domain,ok:true,lead};
  },3);
  for(let i=0;i<batch.length;i++){const a=batch[i],v=a?.value||{domain:candidates[i].domain,ok:false,error:a?.error||'Unknown audit failure'};inspected.push(v);if(v.ok)leads.push(v.lead);}
  const result={found:candidates.length,added,verified,checked:leads.length,failed:inspected.filter(x=>!x.ok).length};
  const details={queries,citations,model,errors:inspected.filter(x=>!x.ok).slice(0,12)};
  if(persisted)await db.updateRun(run.id,{...result,status:'completed',finished_at:new Date().toISOString(),details});
  return {...result,runId:run?.id||null,selection,leads,details,stored:persisted,notes:'Companies returned by grounded Google search and independently checked through public homepage scans. Scores indicate technical/commerce signals, not buying intent or verified location.'};
 }catch(e){if(persisted&&run)await db.updateRun(run.id,{status:'failed',finished_at:new Date().toISOString(),error:String(e.message||e).slice(0,300)}).catch(()=>{});throw e;}
}
module.exports={execute};