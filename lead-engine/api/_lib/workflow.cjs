'use strict';
const db=require('./db.cjs'), research=require('./research.cjs');
async function execute(input={},trigger='manual'){
 const selection=research.brief(input);
 if(!process.env.BRAVE_SEARCH_API_KEY)throw Error('Search provider is not configured: add BRAVE_SEARCH_API_KEY');
 if(!db.connected())throw Error('Database is not configured: add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
 if(trigger==='manual')await db.saveSettings(selection);
 const recent=await db.listRuns();
 if(recent.some(r=>r.status==='running'&&Date.now()-new Date(r.started_at).getTime()<20*60*1000))throw Error('A discovery run is already in progress');
 const run=await db.createRun({trigger,status:'running',sector:selection.sector,region:selection.region,started_at:new Date().toISOString(),found:0,added:0,verified:0});
 if(!run?.id)throw Error('Could not create a run record');
 try{
  const {candidates,queries}=await research.gather(selection);let added=0,verified=0;const audited=[];
  const batch=await research.limitedMap(candidates,async c=>{
   let site;
   try{site=await research.auditDomain(c.domain);}catch(e){return {domain:c.domain,ok:false,error:e.message};}
   const evaled=research.scoreCandidate(site,selection);const name=research.companyName(site.title||c.name,c.domain);
   if(site.shopify)verified++;
   const existing=await db.request('leads',{query:`select=id,stage&domain=eq.${encodeURIComponent(c.domain)}&limit=1`});
   const lead={domain:c.domain,name,sector:selection.sector,region:selection.region,score:evaled.score,qualification:evaled.qualification,reason:evaled.reason,shopify:evaled.shopify,evidence:evaled.evidence,observed:evaled.observed,website:site.url,source_url:c.sourceUrl,source_type:'Brave Search',scan_status:'complete',scanned_at:site.checkedAt,updated_at:new Date().toISOString()};
   if(existing?.length){await db.request('leads',{method:'PATCH',query:`id=eq.${encodeURIComponent(existing[0].id)}`,body:lead});}
   else{const d=research.draft({...lead,sector:selection.sectorLabel});await db.request('leads',{method:'POST',body:{...lead,stage:'new',outreach_subject:d.subject,outreach_body:d.body},prefer:'return=minimal'});added++;}
   return {domain:c.domain,ok:true,score:evaled.score,shopify:site.shopify};
  },4);
  for(let i=0;i<batch.length;i++){const x=batch[i];audited.push(x.error?{domain:candidates[i].domain,ok:false,error:x.error}:x.value);}
  const result={found:candidates.length,added,verified,checked:audited.filter(x=>x.ok).length,failed:audited.filter(x=>!x.ok).length};
  await db.updateRun(run.id,{...result,status:'completed',finished_at:new Date().toISOString(),details:{queries,errors:audited.filter(x=>!x.ok).slice(0,10)}});
  return {...result,runId:run.id,selection,notes:'Candidates are based on public web results; market location and sales readiness have not been independently verified.'};
 }catch(e){await db.updateRun(run.id,{status:'failed',finished_at:new Date().toISOString(),error:String(e.message||e).slice(0,300)}).catch(()=>{});throw e;}
}
module.exports={execute};
