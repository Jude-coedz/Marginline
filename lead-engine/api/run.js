import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
'use strict';
const {guard,cors}=require('./_lib/auth.cjs');const {execute}=require('./_lib/workflow.cjs');
const db=require('./_lib/db.cjs');
export default async function(req,res){cors(req,res);if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Method not allowed'});
 if(!guard(req,res,{cron:req.method==='GET'}))return;
 if(req.method==='GET'&&!(process.env.CRON_SECRET&&req.headers.authorization===`Bearer ${process.env.CRON_SECRET}`))return res.status(405).json({error:'Scheduled endpoint requires scheduler authentication'});
 try{const input=req.method==='POST'?(typeof req.body==='string'?JSON.parse(req.body):req.body||{}):(await db.getSettings())||{sector:process.env.DEFAULT_SECTOR||'beauty',region:process.env.DEFAULT_REGION||'uk'};
 const result=await execute(input,req.method==='GET'?'scheduled':'manual');return res.status(200).json(result);
 }catch(e){const status=/not configured|Database is not configured/.test(e.message)?424:/already in progress/.test(e.message)?409:503;return res.status(status).json({error:e.message||'Prospecting run could not complete'});}}
