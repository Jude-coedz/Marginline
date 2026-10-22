const test=require('node:test');const assert=require('node:assert/strict');
const db=require('../api/_lib/db.cjs'),research=require('../api/_lib/research.cjs'),worker=require('../api/_lib/workflow.cjs');
test('manual pilot works with Gemini and without Supabase; audits, preserves evidence and returns leads',async()=>{
 const old=process.env.GEMINI_API_KEY;process.env.GEMINI_API_KEY='unit-test';
 const originals={};let audited=0;
 try{
  originals.dbConnected=db.connected;db.connected=()=>false;
  originals.gather=research.gather;research.gather=async()=>({queries:['web search'],citations:[{url:'https://source.example'}],model:'gemini-2.5-flash',candidates:[{domain:'good-example.com',sourceUrl:'https://good-example.com/',name:'Good Example'}]});
  originals.audit=research.auditDomain;research.auditDomain=async d=>{audited++;return {url:`https://${d}/`,title:'Good Example',description:'Commerce shop',shopify:true,productLinks:true,newsletter:false,contact:true,subscription:false,checkedAt:new Date().toISOString()}};
  const output=await worker.execute({sector:'beauty',region:'uk'});
  assert.equal(output.found,1);assert.equal(output.added,1);assert.equal(output.verified,1);assert.equal(output.stored,false);assert.equal(output.leads[0].domain,'good-example.com');assert.equal(output.leads[0].evidence.length,2);assert.equal(audited,1);
 }finally{db.connected=originals.dbConnected;research.gather=originals.gather;research.auditDomain=originals.audit;if(old===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=old}
});
test('scheduled runs demand persistent storage',async()=>{
 const old=process.env.GEMINI_API_KEY;process.env.GEMINI_API_KEY='unit-test';const connected=db.connected;db.connected=()=>false;
 try{await assert.rejects(()=>worker.execute({},'scheduled'),/needs Supabase/)}finally{db.connected=connected;if(old===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=old}
});