import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {cors}=require('./_lib/auth.cjs');
export default async function(req,res){cors(req,res);if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 const search=!!process.env.GEMINI_API_KEY,storage=!!process.env.SUPABASE_URL&&!!process.env.SUPABASE_SERVICE_ROLE_KEY,secure=!!process.env.APP_ACCESS_KEY,schedule=!!process.env.CRON_SECRET&&storage;
 return res.status(200).json({service:'Prospect',version:'3.0',ready:search&&secure,search,searchProvider:(process.env.GEMINI_MODEL||'gemini-3.8-flash')+' + Google Search',storage,secure,schedule,model:process.env.GEMINI_MODEL||'gemini-3.8-flash',missing:[...(!search?['GEMINI_API_KEY']:[]),...(!secure?['APP_ACCESS_KEY']:[])],serverTime:new Date().toISOString()});}