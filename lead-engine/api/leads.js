import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
'use strict';
const {guard,cors}=require('./_lib/auth.cjs');const db=require('./_lib/db.cjs');
export default async function(req,res){cors(req,res);if(!guard(req,res))return;
 try{if(req.method==='GET'){const [leads,runs]=await Promise.all([db.listLeads(),db.listRuns()]);return res.status(200).json({leads,runs});}
 if(req.method==='PATCH'){const id=String(req.query?.id||'');if(!/^[0-9a-f-]{36}$/i.test(id))return res.status(400).json({error:'Invalid lead identifier'});
 const data=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
 if(data.stage&&!['new','review','approved','contacted','replied','meeting','won','not_fit'].includes(data.stage))return res.status(400).json({error:'Invalid pipeline stage'});
 await db.updateLead(id,data);return res.status(200).json({ok:true});}
 return res.status(405).json({error:'Method not allowed'});
 }catch(e){return res.status(503).json({error:e.message||'Lead database unavailable'});}};
