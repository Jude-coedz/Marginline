// Optional deployment diagnostic. Uses real server bindings; never prints credentials.
// This invokes a real discovery run and may consume Gemini quota.
import run from '../api/run.js';
let status = 200;
let result;
const response = {
  setHeader() {},
  status(code) { status = code; return this; },
  json(body) { result = body; return this; },
};
await run({
  method: 'POST',
  headers: { 'x-prospect-key': process.env.APP_ACCESS_KEY || '' },
  body: { sector: 'beauty', region: 'uk' },
}, response);
console.log('PROSPECT_LIVE_CHECK ' + JSON.stringify({
  httpStatus: status, model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  found: result?.found, checked: result?.checked, failed: result?.failed,
  verified: result?.verified, stored: result?.stored, error: result?.error,
}));
for (const lead of result?.leads || []) console.log('PROSPECT_LIVE_LEAD ' + JSON.stringify(lead));
if (status !== 200) process.exitCode = 1;
