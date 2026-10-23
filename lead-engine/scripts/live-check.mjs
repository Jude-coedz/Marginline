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
console.log('PROSPECT_LIVE_CHECK ' + JSON.stringify({ httpStatus: status, ...result }));
if (status !== 200) process.exitCode = 1;
