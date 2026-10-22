'use strict';
const crypto=require('node:crypto');
function eq(a,b){if(typeof a!=='string'||typeof b!=='string')return false;const aa=Buffer.from(a);const bb=Buffer.from(b);return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb);}
function authorized(req,{cron=false}={}){
 const bearer=req.headers.authorization||'';
 if(cron&&process.env.CRON_SECRET&&eq(bearer,`Bearer ${process.env.CRON_SECRET}`))return true;
 const key=process.env.APP_ACCESS_KEY;
 return !!key&&(eq(req.headers['x-prospect-key'],key)||eq(bearer,`Bearer ${key}`));
}
function guard(req,res,opts){if(authorized(req,opts))return true;res.status(401).json({error:'Access code is missing or incorrect'});return false;}
function cors(req,res){res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Vary','Origin');}
module.exports={authorized,guard,cors};
