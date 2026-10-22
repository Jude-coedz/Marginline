const test=require('node:test');const assert=require('node:assert/strict');const r=require('../api/_lib/research.cjs');const a=require('../api/_lib/auth.cjs');
test('canonical domain parsing excludes marketplaces and local addresses',()=>{
 assert.equal(r.domainOf('https://www.linkedin.com/company/test'),null);
 assert.equal(r.domainOf('https://tenants.etsy.com/shop'),null);
 assert.equal(r.domainOf('http://localhost'),null);
 assert.equal(r.domainOf('https://www.acme.co.uk/products/m'),'acme.co.uk');
});
test('rejects reserved and private IP destinations',()=>{for(const ip of ['127.0.0.1','192.168.1.5','10.12.0.1','172.16.1.1','::1'])assert.equal(r.rejectIp(ip),true);assert.equal(r.rejectIp('8.8.8.8'),false)});
test('homepage scan records signals but never invents missing metadata',()=>{
 const p=r.parseHomepage('<title>Rose Clinic</title><script src="https://cdn.shopify.com"></script><a href="/products/s">item</a><form class="newsletter"></form>','https://rose.example');
 assert.equal(p.shopify,true);assert.equal(p.productLinks,true);assert.equal(p.newsletter,true);assert.equal(p.description,'');
});
test('score distinguishes strong commerce evidence from uncertain website',()=>{
 const b=r.brief({sector:'beauty',region:'uk'});
 const weak=r.scoreCandidate({shopify:false,productLinks:false,newsletter:false,contact:false,subscription:false,title:'',description:'',url:'https://shop.example',checkedAt:'2026-10-22'},b);assert.equal(weak.qualification,'unverified');
 const strong=r.scoreCandidate({shopify:true,productLinks:true,newsletter:true,contact:true,subscription:false,title:'Title',description:'Desc',url:'https://shop.example',checkedAt:'2026-10-22'},b);assert.equal(strong.qualification,'strong');assert.ok(strong.evidence.every(x=>x.source));
});
test('Gemini candidates are canonicalized, deduped and disallowed marketplaces removed',()=>{
 const rows=r.parseCandidates('```json\n{"businesses":[{"name":"Mint","website":"https://www.mint-test.co.uk/shop"},{"name":"Duplicate","website":"https://mint-test.co.uk"},{"website":"https://amazon.com/store/a"}]}\n```');
 assert.deepEqual(rows.map(x=>x.domain),['mint-test.co.uk']);
});
test('Gemini discovery requires Google Search grounding metadata',async()=>{
 const old=process.env.GEMINI_API_KEY;process.env.GEMINI_API_KEY='unit-test';
 try{await assert.rejects(()=>r.geminiSearch(r.brief({}),{fetcher:async()=>({ok:true,json:async()=>({candidates:[{content:{parts:[{text:'{"businesses":[{"website":"https://fake-brand.com"}]}' }]}}]})})}),/did not provide evidence/)}finally{old===undefined?delete process.env.GEMINI_API_KEY:process.env.GEMINI_API_KEY=old}
});
test('Gemini discovery actually enables google_search and preserves provenance',async()=>{
 const old=process.env.GEMINI_API_KEY;process.env.GEMINI_API_KEY='unit-test';
 try{const f=async(u,o)=>{assert.match(u,/gemini-2\.5-flash:generateContent/);assert.equal(JSON.parse(o.body).tools[0].google_search.constructor,Object);return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:'{"businesses":[{"name":"The Brand","website":"https://thebrand.co.uk"}]}'}]},groundingMetadata:{webSearchQueries:['best UK DTC brands'],groundingChunks:[{web:{uri:'https://some-source.com/brands',title:'Brands'}}]}}]})}};
 const out=await r.geminiSearch(r.brief({}),{fetcher:f});assert.equal(out.candidates[0].domain,'thebrand.co.uk');assert.deepEqual(out.queries,['best UK DTC brands']);assert.equal(out.citations.length,1);
 }finally{old===undefined?delete process.env.GEMINI_API_KEY:process.env.GEMINI_API_KEY=old}
});
test('limits scanner concurrency and preserves outcomes',async()=>{const out=await r.limitedMap([1,2,3],async n=>{if(n===2)throw Error('test');return n+1},2);assert.deepEqual(out,[{value:2},{error:'test'},{value:4}])});
test('blank access keys are always unauthorized',()=>{assert.equal(a.authorized({headers:{}}),false)});