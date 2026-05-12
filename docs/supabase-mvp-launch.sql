-- BCI CRM MVP cloud database for the current Vercel prototype.
-- Run this once in Supabase SQL Editor, then set Vercel env vars:
-- SUPABASE_URL and SUPABASE_ANON_KEY.
--
-- MVP note:
-- The policies below allow anyone with the public anon key to read and insert.
-- This is acceptable only for the first internal prototype. Replace with
-- Supabase Auth + role-based policies before putting sensitive student data in.

create extension if not exists pgcrypto;

create table if not exists knowledge_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  detail text,
  notes text,
  numeric_data_text text,
  review_cycle text,
  source_url text,
  source_type text,
  subject_tags text[] not null default '{}',
  item_type text,
  used_in_contents integer not null default 0,
  verified_by_name text,
  last_verified_text text,
  visibility text not null default '内部',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists content_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  ai_search_ready boolean not null default false,
  account_name text,
  audience_personas text[] not null default '{}',
  author_name text,
  cta text,
  content_type text,
  emotional_trigger text,
  funnel_stage text,
  lead_magnet text,
  notes text,
  primary_keyword text,
  prompts_used text,
  publish_date date,
  references_note text,
  repurpose_status text,
  status_label text not null default '草稿',
  topic_cluster text,
  wace_focus boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ip_personas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  positioning text,
  persona_type text,
  owner_name text,
  publishing_frequency text,
  lead_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists social_accounts (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  account_name text not null,
  account_status text not null default '筹备',
  content_count integer not null default 0,
  handle_url text,
  investment_tier text,
  owner_type text,
  persona_name text,
  talent_name text,
  entity_name text,
  entity_type text,
  operator_name text,
  account_stage text,
  monthly_posts integer not null default 0,
  lead_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists published_posts (
  id uuid primary key default gen_random_uuid(),
  publish_date date not null,
  platform text not null,
  account_name text not null,
  persona_name text,
  title text not null,
  status_label text not null default '已发布',
  metric_label text not null default '待回填',
  post_url text,
  published_copy text,
  media_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table knowledge_items enable row level security;
alter table content_items enable row level security;
alter table ip_personas enable row level security;
alter table social_accounts enable row level security;
alter table published_posts enable row level security;

drop policy if exists "mvp read knowledge" on knowledge_items;
drop policy if exists "mvp insert knowledge" on knowledge_items;
drop policy if exists "mvp read contents" on content_items;
drop policy if exists "mvp insert contents" on content_items;
drop policy if exists "mvp read personas" on ip_personas;
drop policy if exists "mvp insert personas" on ip_personas;
drop policy if exists "mvp read accounts" on social_accounts;
drop policy if exists "mvp insert accounts" on social_accounts;
drop policy if exists "mvp read posts" on published_posts;
drop policy if exists "mvp insert posts" on published_posts;

create policy "mvp read knowledge" on knowledge_items for select using (true);
create policy "mvp insert knowledge" on knowledge_items for insert with check (true);
create policy "mvp read contents" on content_items for select using (true);
create policy "mvp insert contents" on content_items for insert with check (true);
create policy "mvp read personas" on ip_personas for select using (true);
create policy "mvp insert personas" on ip_personas for insert with check (true);
create policy "mvp read accounts" on social_accounts for select using (true);
create policy "mvp insert accounts" on social_accounts for insert with check (true);
create policy "mvp read posts" on published_posts for select using (true);
create policy "mvp insert posts" on published_posts for insert with check (true);

create index if not exists idx_knowledge_items_created_at on knowledge_items(created_at desc);
create index if not exists idx_content_items_created_at on content_items(created_at desc);
create index if not exists idx_ip_personas_created_at on ip_personas(created_at desc);
create index if not exists idx_social_accounts_created_at on social_accounts(created_at desc);
create index if not exists idx_published_posts_created_at on published_posts(created_at desc);
create index if not exists idx_published_posts_publish_date on published_posts(publish_date);
