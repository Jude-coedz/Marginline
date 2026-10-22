"use strict";
const REQUIRED = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const { timedSignal } = require("./context.cjs");
function connected() {
  return REQUIRED.every((k) => Boolean(process.env[k]));
}
async function request(
  table,
  { method = "GET", query = "", body, prefer = "return=representation" } = {},
) {
  if (!connected())
    throw new Error("Database not connected: configure Supabase");
  const url =
    process.env.SUPABASE_URL.replace(/\/$/, "") +
    "/rest/v1/" +
    table +
    (query ? "?" + query : "");
  const result = await fetch(url, {
    method,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: prefer,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: timedSignal(12000),
  });
  if (!result.ok) {
    const s = (await result.text()).slice(0, 300);
    throw new Error(`Database ${result.status}: ${s}`);
  }
  if (result.status === 204) return null;
  const txt = await result.text();
  return txt ? JSON.parse(txt) : null;
}
function escapeFilter(v) {
  return String(v)
    .replace(/[(),.*\\]/g, "")
    .slice(0, 180);
}
async function listLeads() {
  return request("leads", {
    query: "select=*&order=updated_at.desc&limit=200",
  });
}
async function getSettings() {
  const rows = await request("app_settings", {
    query: "select=sector,region&id=eq.default&limit=1",
  });
  return rows?.[0] || null;
}
async function saveSettings(b) {
  await request("app_settings", {
    method: "POST",
    query: "on_conflict=id",
    body: {
      id: "default",
      sector: b.sector,
      region: b.region,
      updated_at: new Date().toISOString(),
    },
    prefer: "resolution=merge-duplicates,return=minimal",
  });
}
async function listRuns() {
  return request("lead_runs", {
    query: "select=*&order=started_at.desc&limit=15",
  });
}
async function createRun(data) {
  const r = await request("lead_runs", { method: "POST", body: data });
  return r?.[0];
}
async function updateRun(id, data) {
  return request("lead_runs", {
    method: "PATCH",
    query: `id=eq.${encodeURIComponent(id)}`,
    body: data,
  });
}
async function upsertLead(data) {
  const r = await request("leads", {
    method: "POST",
    query: "on_conflict=domain",
    body: data,
    prefer: "resolution=merge-duplicates,return=representation",
  });
  return r?.[0];
}
async function updateLead(id, data) {
  const allowed = {};
  for (const k of [
    "stage",
    "notes",
    "outreach_subject",
    "outreach_body",
    "last_contacted_at",
  ]) {
    if (Object.prototype.hasOwnProperty.call(data, k)) allowed[k] = data[k];
  }
  if (!Object.keys(allowed).length) throw Error("Nothing to update");
  return request("leads", {
    method: "PATCH",
    query: `id=eq.${encodeURIComponent(id)}`,
    body: { ...allowed, updated_at: new Date().toISOString() },
  });
}
module.exports = {
  connected,
  request,
  listLeads,
  listRuns,
  createRun,
  updateRun,
  upsertLead,
  updateLead,
  escapeFilter,
  getSettings,
  saveSettings,
};
