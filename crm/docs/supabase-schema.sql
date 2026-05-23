-- ============================================================
-- BCI 自媒体矩阵获客系统 — Supabase Database Schema
-- Run this in Supabase SQL Editor to create all tables
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- 1. content_items — 内容资产库
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL UNIQUE,
  ai_search_ready BOOLEAN DEFAULT false,
  account_name TEXT,
  audience_personas TEXT[] DEFAULT '{}',
  author_name TEXT,
  content_type TEXT,
  emotional_trigger TEXT,
  funnel_stage TEXT DEFAULT 'Awareness',
  lead_magnet TEXT,
  primary_keyword TEXT,
  prompts_used TEXT,
  publish_date DATE,
  repurpose_status TEXT DEFAULT '原稿',
  repurpose_source_title TEXT,
  repurpose_children TEXT[] DEFAULT '{}',
  status_label TEXT DEFAULT '草稿',
  topic_cluster TEXT,
  wace_focus BOOLEAN DEFAULT false,
  cta TEXT,
  references_note TEXT,
  notes TEXT,
  comments JSONB DEFAULT '[]',
  review_history JSONB DEFAULT '[]',
  -- Metrics (embedded)
  metric_reads INTEGER DEFAULT 0,
  metric_likes INTEGER DEFAULT 0,
  metric_comments INTEGER DEFAULT 0,
  metric_shares INTEGER DEFAULT 0,
  metric_private_messages INTEGER DEFAULT 0,
  metric_leads INTEGER DEFAULT 0,
  -- Metadata
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 2. knowledge_items — 真实资料库
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS knowledge_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL UNIQUE,
  detail TEXT,
  notes TEXT,
  numeric_data_text TEXT,
  review_cycle TEXT DEFAULT '每年',
  source_url TEXT,
  source_type TEXT DEFAULT '人工整理',
  subject_tags TEXT[] DEFAULT '{}',
  item_type TEXT,
  category TEXT,
  used_in_contents INTEGER DEFAULT 0,
  verified_by_name TEXT,
  last_verified_text TEXT,
  visibility TEXT DEFAULT '内部',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 3. ip_personas — IP 矩阵
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ip_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  positioning TEXT,
  persona_type TEXT DEFAULT 'IP',
  owner_name TEXT,
  publishing_frequency TEXT,
  lead_count INTEGER DEFAULT 0,
  ip_category TEXT DEFAULT 'school_official',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 4. account_matrix — 账号矩阵
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS account_matrix (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_status TEXT DEFAULT '筹备',
  content_count INTEGER DEFAULT 0,
  handle_url TEXT,
  investment_tier TEXT DEFAULT '辅助',
  owner_type TEXT DEFAULT '自营',
  persona_name TEXT,
  talent_name TEXT,
  entity_name TEXT,
  entity_type TEXT,
  operator_name TEXT,
  ip_category TEXT DEFAULT 'school_official',
  account_stage TEXT DEFAULT '筹备',
  monthly_posts INTEGER DEFAULT 0,
  monthly_spend NUMERIC DEFAULT 0,
  lead_count INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(platform, account_name)
);

-- ────────────────────────────────────────────────────────────
-- 5. published_posts — 今日发布
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS published_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  publish_date DATE,
  platform TEXT,
  account_name TEXT,
  persona_name TEXT,
  status_label TEXT DEFAULT '已发布',
  metric_label TEXT,
  post_url TEXT,
  published_copy TEXT,
  media_note TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 6. crm_leads — 招生线索
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  source TEXT,
  stage TEXT DEFAULT '私信咨询',
  assignee TEXT,
  date DATE,
  source_link TEXT,
  channel TEXT,
  grade TEXT,
  parent_name TEXT,
  course TEXT,
  wechat_id TEXT,
  wechat_add_time TIMESTAMPTZ,
  notes TEXT,
  -- Extended CRM fields
  follow_ups JSONB DEFAULT '[]',
  lead_type TEXT DEFAULT 'direct',
  agent_name TEXT,
  partner_school TEXT,
  commission_rate NUMERIC DEFAULT 0,
  expected_revenue NUMERIC DEFAULT 0,
  -- Metadata
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 7. ai_prompts — AI Prompt 模板库
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL UNIQUE,
  author TEXT,
  last_used TEXT,
  notes TEXT,
  output_examples TEXT,
  platform TEXT,
  prompt_template TEXT,
  quality_rating TEXT DEFAULT '3星',
  stage TEXT,
  target_persona TEXT,
  use_count INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 8. team_members — 团队成员
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT DEFAULT '运营人员',
  accounts TEXT,
  status TEXT DEFAULT '在职',
  join_date DATE,
  auth_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 9. platform_config — 平台配置
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS platform_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  can_browser_open BOOLEAN DEFAULT true,
  icon TEXT DEFAULT '📱',
  priority INTEGER DEFAULT 3,
  budget_percent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 10. audit_log — 操作日志
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  user_role TEXT,
  team TEXT,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ── content_items policies ──
CREATE POLICY "Authenticated can read content_items"
  ON content_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert content_items"
  ON content_items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner or lead/admin can update content_items"
  ON content_items FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'lead'));

-- ── knowledge_items policies ──
CREATE POLICY "Authenticated can read knowledge_items"
  ON knowledge_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert knowledge_items"
  ON knowledge_items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner or lead/admin can update knowledge_items"
  ON knowledge_items FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'lead'));

-- ── ip_personas policies ──
CREATE POLICY "Authenticated can read ip_personas"
  ON ip_personas FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can manage ip_personas"
  ON ip_personas FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── account_matrix policies ──
CREATE POLICY "Authenticated can read account_matrix"
  ON account_matrix FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can manage account_matrix"
  ON account_matrix FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── published_posts policies ──
CREATE POLICY "Authenticated can read published_posts"
  ON published_posts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can manage published_posts"
  ON published_posts FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── crm_leads policies ──
CREATE POLICY "Authenticated can read crm_leads"
  ON crm_leads FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can manage crm_leads"
  ON crm_leads FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── ai_prompts policies ──
CREATE POLICY "Authenticated can read ai_prompts"
  ON ai_prompts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can manage ai_prompts"
  ON ai_prompts FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── team_members policies ──
CREATE POLICY "Authenticated can read team_members"
  ON team_members FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin/lead can manage team_members"
  ON team_members FOR ALL TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'lead'))
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'lead'));

-- ── platform_config policies ──
CREATE POLICY "Authenticated can read platform_config"
  ON platform_config FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can manage platform_config"
  ON platform_config FOR ALL TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ── audit_log policies ──
CREATE POLICY "Authenticated can read audit_log"
  ON audit_log FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert audit_log"
  ON audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_content_status ON content_items(status_label);
CREATE INDEX IF NOT EXISTS idx_content_publish_date ON content_items(publish_date);
CREATE INDEX IF NOT EXISTS idx_content_account ON content_items(account_name);
CREATE INDEX IF NOT EXISTS idx_content_funnel ON content_items(funnel_stage);
CREATE INDEX IF NOT EXISTS idx_content_wace ON content_items(wace_focus) WHERE wace_focus = true;
CREATE INDEX IF NOT EXISTS idx_crm_stage ON crm_leads(stage);
CREATE INDEX IF NOT EXISTS idx_crm_assignee ON crm_leads(assignee);
CREATE INDEX IF NOT EXISTS idx_crm_lead_type ON crm_leads(lead_type);
CREATE INDEX IF NOT EXISTS idx_account_platform ON account_matrix(platform);
CREATE INDEX IF NOT EXISTS idx_knowledge_subject ON knowledge_items USING GIN(subject_tags);
CREATE INDEX IF NOT EXISTS idx_posts_date ON published_posts(publish_date);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);

-- ============================================================
-- Updated_at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON content_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON knowledge_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON ip_personas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON account_matrix FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON published_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON crm_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON ai_prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Supabase Storage bucket (run via Dashboard > Storage)
-- ============================================================
-- Create a public bucket named "bci-media" for file uploads.
-- This cannot be done via SQL; use the Supabase Dashboard:
--   1. Go to Storage > New Bucket
--   2. Name: bci-media
--   3. Public: Yes
--   4. File size limit: 10MB
--   5. Allowed MIME types: image/*, video/*, application/pdf
