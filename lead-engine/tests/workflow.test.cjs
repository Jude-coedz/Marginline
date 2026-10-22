const test=require('node:test');const assert=require('node:assert/strict');
const db=require('../api/_lib/db.cjs'),research=require('../api/_lib/research.cjs'),worker=require('../api/_lib/workflow.cjs');
test('run performs candidate discovery, audit, source-based scoring, saves leads and run history',async()=>{
 const oldKey=process.env.BRAVE_SEARCH_API_KEY;process.env.BRAVE_SEARCH_API_KEY='unit-test-not-a-real-secret';
 const originals={};const calls={run:0,save:0,insert:0,update:0,settings:0};const patch=(obj,key,fn)=>{originals[key]=obj[key];obj[key]=fn};
 try{
  patch(db,'connected',()=>true);patch(db,'saveSettings',async()=>{calls.settings++});patch(db,'listRuns',async()=>[]);
  patch(db,'createRun',async()=>{calls.run++;return {id:'00000000-0000-4000-8000-000000000001'}});
  patch(db,'updateRun',async(id,data)=>{calls.update++;assert.equal(data.status,'completed')});
  patch(db,'request',async(table,opts)=>{if(opts.method==='POST'){calls.insert++;return null;}return [];});
  patch(research,'gather',async()=>({queries:['test query'],candidates:[{domain:'good-example.com',sourceUrl:'https://good-example.com/products/x',name:'Good Example'}]}));
  patch(research,'auditDomain',async d=>({url:`https://${d}/`,title:'Good Example',description:'Commerce shop',shopify:true,productLinks:true,newsletter:false,contact:true,subscription:false,checkedAt:new Date().toISOString()}));
  const output=await worker.execute({sector:'beauty',region:'uk'});
  assert.equal(output.found,1);assert.equal(output.added,1);assert.equal(output.verified,1);assert.equal(calls.settings,1);assert.equal(calls.run,1);assert.equal(calls.insert,1);assert.equal(calls.update,1);
 }finally{for(const [k,v] of Object.entries(originals)){if(['connected','saveSettings','listRuns','createRun','updateRun','request'].includes(k))db[k]=v;else research[k]=v;}if(oldKey===undefined)delete process.env.BRAVE_SEARCH_API_KEY;else process.env.BRAVE_SEARCH_API_KEY=oldKey;}
});
