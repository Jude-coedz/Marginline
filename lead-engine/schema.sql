-- Run once in Supabase SQL Editor. Backend calls use server-only service role key.
create extension if not exists pgcrypto;
create table if not exists public.leads (
 id uuid primary key default gen_random_uuid(),
 domain text not null unique,
 name text not null,
 sector text not null,
 region text not null,
 score integer not null default 0 check(score between 0 and 100),
 qualification text not null default 'unverified',
 reason text not null default '',
 shopify boolean not null default false,
 evidence jsonb not null default '[]'::jsonb,
 observed jsonb not null default '[]'::jsonb,
 website text,
 source_url text,
 source_type text,
 scan_status text,
 scanned_at timestamptz,
 stage text not null default 'new',
 outreach_subject text,
 outreach_body text,
 notes text,
 last_contacted_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists leads_updated_idx on public.leads(updated_at desc);
create table if not exists public.lead_runs (
 id uuid primary key default gen_random_uuid(),
 trigger text not null default 'manual',
 status text not null default 'running',
 sector text not null,
 region text not null,
 found integer not null default 0,
 added integer not null default 0,
 verified integer not null default 0,
 checked integer not null default 0,
 failed integer not null default 0,
 details jsonb,
 error text,
 started_at timestamptz not null default now(),
 finished_at timestamptz
);
-- Neither table is available to anon/authenticated clients.
alter table public.leads enable row level security;
alter table public.lead_runs enable row level security;
revoke all on public.leads, public.lead_runs from anon, authenticated;

create table if not exists public.app_settings (
 id text primary key default 'default' check(id='default'),
 sector text not null default 'beauty',
 region text not null default 'uk',
 updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
revoke all on public.app_settings from anon, authenticated;
