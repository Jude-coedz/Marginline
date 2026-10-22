"use strict";
const { AsyncLocalStorage } = require("node:async_hooks");
const context = new AsyncLocalStorage();
function withSignal(signal, work) {
  return context.run(signal, work);
}
function timedSignal(milliseconds, extra) {
  const signals = [
    context.getStore(),
    extra,
    AbortSignal.timeout(milliseconds),
  ].filter(Boolean);
  return signals.length === 1 ? signals[0] : AbortSignal.any(signals);
}
module.exports = { withSignal, timedSignal };
