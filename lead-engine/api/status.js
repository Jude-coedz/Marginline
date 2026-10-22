import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
'use strict';
const auth=require('./_lib/auth.cjs');
export default async function(req,res){auth.cors(req,res);if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 const checked=['BRAVE_SEARCH_API_KEY','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','APP_ACCESS_KEY','CRON_SECRET'];const missing=checked.filter(n=>!process.env[n]);
 return res.status(200).json({service:'Prospect',version:'2.0',ready:missing.length===0,search:!!process.env.BRAVE_SEARCH_API_KEY,storage:!!process.env.SUPABASE_URL&&!!process.env.SUPABASE_SERVICE_ROLE_KEY,secure:!!process.env.APP_ACCESS_KEY,schedule:!!process.env.CRON_SECRET,ai:!!process.env.GEMINI_API_KEY,missing,serverTime:new Date().toISOString()});};
