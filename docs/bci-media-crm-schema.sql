-- BCI 自媒体矩阵获客管理系统
-- Draft PostgreSQL schema for product planning and first implementation.

create type user_role as enum (
  'super_admin',
  'department_lead',
  'operator',
  'ai_editor',
  'admissions_counselor'
);

create type content_status as enum (
  'draft',
  'pending_review',
  'revision_required',
  'approved',
  'published',
  'metrics_filled',
  'reviewed'
);

create type verification_status as enum (
  'pending',
  'verified',
  'expired',
  'disabled'
);

create type account_stage as enum (
  'new',
  'warming',
  'growth',
  'conversion'
);

create type lead_stage as enum (
  'new',
  'contacted',
  'consulted',
  'visit_booked',
  'visited',
  'tested_or_interviewed',
  'admitted',
  'paid',
  'lost'
);

create table users (
  id uuid primary key,
  name text not null,
  email text unique,
  phone text,
  role user_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table knowledge_items (
  id uuid primary key,
  title text not null,
  category text not null,
  detail text not null,
  grade_range text,
  audience text,
  notes text,
  numeric_data jsonb not null default '{}',
  review_cycle text,
  source_type text,
  source_url text,
  subject_tags text[] not null default '{}',
  item_type text,
  used_in_content_ids uuid[] not null default '{}',
  verified_by uuid references users(id),
  last_verified_at date,
  visibility text not null default 'internal',
  verification_status verification_status not null default 'pending',
  usable_scope text,
  tags text[] not null default '{}',
  attachments jsonb not null default '[]',
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table ip_personas (
  id uuid primary key,
  name text not null,
  persona_type text not null,
  positioning text,
  target_audience text,
  core_topics text[] not null default '{}',
  tone text,
  forbidden_topics text[] not null default '{}',
  talking_points text,
  knowledge_scope text,
  owner_id uuid references users(id),
  publishing_frequency text,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table social_accounts (
  id uuid primary key,
  platform text not null,
  account_name text not null,
  account_status text not null default 'preparing',
  account_positioning text,
  persona_ids uuid[] not null default '{}',
  owner_id uuid references users(id),
  publishing_frequency text,
  handle_url text,
  investment_tier text,
  owner_type text,
  talent_name text,
  entity_name text,
  entity_type text,
  content_ids uuid[] not null default '{}',
  account_stage account_stage not null default 'new',
  content_direction text,
  follower_count integer not null default 0,
  status text not null default 'active',
  management_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table account_assignments (
  id uuid primary key,
  user_id uuid not null references users(id),
  account_id uuid not null references social_accounts(id),
  can_view boolean not null default true,
  can_edit boolean not null default true,
  can_submit_review boolean not null default true,
  can_archive_publish boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, account_id)
);

create table ai_generations (
  id uuid primary key,
  task_title text not null,
  record_type text not null default 'generation',
  author_id uuid references users(id),
  last_used_at date,
  notes text,
  output_examples text,
  prompt text not null,
  prompt_template text,
  knowledge_item_ids uuid[] not null default '{}',
  target_platform text,
  target_persona_id uuid references ip_personas(id),
  target_persona text,
  stage text,
  generated_versions jsonb not null default '[]',
  edited_version text,
  selected_version text,
  model_name text,
  quality_rating text,
  reuse_count integer not null default 0,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table media_assets (
  id uuid primary key,
  title text not null,
  asset_type text not null,
  file_url text not null,
  thumbnail_url text,
  platform text,
  account_id uuid references social_accounts(id),
  content_item_id uuid references content_items(id),
  published_post_id uuid,
  usage_type text,
  sort_order integer not null default 0,
  tags text[] not null default '{}',
  related_knowledge_id uuid references knowledge_items(id),
  uploaded_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table content_items (
  id uuid primary key,
  title text not null,
  content_type text not null,
  ai_search_ready boolean not null default false,
  audience_personas text[] not null default '{}',
  author_id uuid references users(id),
  cta text,
  emotional_trigger text,
  funnel_stage text,
  lead_magnet text,
  notes text,
  primary_keyword text,
  prompts_used uuid[] not null default '{}',
  publish_date date,
  references_note text,
  repurpose_status text,
  topic_cluster text,
  wace_focus boolean not null default false,
  topic text,
  target_audience text,
  target_grade text,
  platform_suggestion text[] not null default '{}',
  persona_id uuid references ip_personas(id),
  account_id uuid references social_accounts(id),
  knowledge_item_ids uuid[] not null default '{}',
  ai_generation_ids uuid[] not null default '{}',
  final_copy text,
  script text,
  media_asset_ids uuid[] not null default '{}',
  status content_status not null default 'draft',
  owner_id uuid references users(id),
  reviewer_id uuid references users(id),
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table ai_generations
  add column linked_content_id uuid references content_items(id);

create table content_status_events (
  id uuid primary key,
  content_id uuid not null references content_items(id),
  from_status content_status,
  to_status content_status not null,
  actor_id uuid references users(id),
  note text,
  created_at timestamptz not null default now()
);

create table published_posts (
  id uuid primary key,
  publish_date date not null,
  platform text not null,
  account_id uuid not null references social_accounts(id),
  persona_id uuid references ip_personas(id),
  content_item_id uuid references content_items(id),
  title text not null,
  published_copy text,
  media_asset_ids uuid[] not null default '{}',
  post_url text,
  screenshot_assets jsonb not null default '[]',
  owner_id uuid references users(id),
  was_planned boolean not null default true,
  review_summary text,
  lead_generated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table post_metrics (
  id uuid primary key,
  post_id uuid not null references published_posts(id),
  metric_date date not null,
  views integer not null default 0,
  likes integer not null default 0,
  saves integer not null default 0,
  comments integer not null default 0,
  shares integer not null default 0,
  messages integer not null default 0,
  leads integer not null default 0,
  visits integer not null default 0,
  enrollments integer not null default 0,
  created_at timestamptz not null default now(),
  unique (post_id, metric_date)
);

create table leads (
  id uuid primary key,
  student_name text,
  current_grade text,
  target_grade text,
  parent_name text,
  contact_phone text,
  contact_wechat text,
  city text,
  interest_program text,
  source_platform text,
  source_account_id uuid references social_accounts(id),
  source_persona_id uuid references ip_personas(id),
  source_post_id uuid references published_posts(id),
  stage lead_stage not null default 'new',
  counselor_id uuid references users(id),
  next_follow_up_at timestamptz,
  lead_quality text,
  lost_reason text,
  enrollment_result text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table follow_ups (
  id uuid primary key,
  lead_id uuid not null references leads(id),
  follow_up_type text not null,
  note text not null,
  next_action text,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

create index idx_content_items_status on content_items(status);
create index idx_content_items_owner on content_items(owner_id);
create index idx_content_items_account on content_items(account_id);
create index idx_published_posts_publish_date on published_posts(publish_date);
create index idx_published_posts_account on published_posts(account_id);
create index idx_published_posts_persona on published_posts(persona_id);
create index idx_post_metrics_post_date on post_metrics(post_id, metric_date);
create index idx_leads_stage on leads(stage);
create index idx_leads_counselor on leads(counselor_id);
create index idx_leads_source_post on leads(source_post_id);
