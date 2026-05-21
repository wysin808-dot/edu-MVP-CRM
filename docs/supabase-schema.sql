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
  title TEXT NOT NULL,
  ai_search_ready BOOLEAN DEFAULT false,
  account TEXT,
  audience_persona TEXT[] DEFAULT '{}',
  author TEXT,
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
  status TEXT DEFAULT '草稿',
  topic_cluster TEXT,
  wace_focus BOOLEAN DEFAULT false,
  cta TEXT,
  "references" TEXT,
  notes TEXT,
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
-- 2. review_history — 审核历史（关联 content_items）
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS review_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
  reviewer TEXT NOT NULL,
  action TEXT NOT NULL, -- 'approve' | 'revise' | 'reject' | 'resubmit' | 'firewall'
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 3. knowledge_items — 真实资料库
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS knowledge_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  detail TEXT,
  notes TEXT,
  numeric_data TEXT,
  review_cycle TEXT DEFAULT '每年',
  source TEXT,
  source_type TEXT DEFAULT '人工整理',
  subject TEXT[] DEFAULT '{}',
  type TEXT,
  used_in_contents INTEGER DEFAULT 0,
  verified_by TEXT,
  last_verified TEXT,
  visibility TEXT DEFAULT '内部',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 4. ip_personas — IP 矩阵
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ip_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  positioning TEXT,
  channels TEXT,
  volume TEXT,
  leads TEXT,
  ip_category TEXT DEFAULT 'school_official', -- school_official | real_person | agency | ugc | seo
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 5. account_matrix — 账号矩阵
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS account_matrix (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL,
  account_name TEXT NOT NULL,
  ip_category TEXT DEFAULT 'school_official',
  status TEXT DEFAULT '筹备',
  content_count INTEGER DEFAULT 0,
  handle TEXT,
  investment_tier TEXT DEFAULT '辅助',
  owner_type TEXT DEFAULT '自营',
  persona TEXT,
  talent TEXT,
  entity_name TEXT,
  entity_type TEXT,
  operator TEXT,
  frequency TEXT,
  stage TEXT DEFAULT '筹备',
  monthly_posts INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
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
  stage TEXT DEFAULT '私信咨询', -- 私信咨询 | 加企微 | 留电/视频 | 试听/到访 | 签约 | 流失
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
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 7. ai_prompts — AI Prompt 模板库
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
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

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;

-- ── Policy: All authenticated users can read all data ──
-- (Role-based filtering is handled in the app layer)

CREATE POLICY "Authenticated users can read content_items"
  ON content_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert content_items"
  ON content_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own content_items"
  ON content_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'lead'));

CREATE POLICY "Authenticated users can read review_history"
  ON review_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert review_history"
  ON review_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read knowledge_items"
  ON knowledge_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert knowledge_items"
  ON knowledge_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update knowledge_items"
  ON knowledge_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'lead'));

CREATE POLICY "Authenticated users can read ip_personas"
  ON ip_personas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage ip_personas"
  ON ip_personas FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read account_matrix"
  ON account_matrix FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage account_matrix"
  ON account_matrix FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read crm_leads"
  ON crm_leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage crm_leads"
  ON crm_leads FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read ai_prompts"
  ON ai_prompts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage ai_prompts"
  ON ai_prompts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read team_members"
  ON team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin/lead can manage team_members"
  ON team_members FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'lead'))
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'lead'));

CREATE POLICY "Authenticated users can read platform_config"
  ON platform_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage platform_config"
  ON platform_config FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ============================================================
-- Indexes for common queries
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_content_status ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_publish_date ON content_items(publish_date);
CREATE INDEX IF NOT EXISTS idx_content_account ON content_items(account);
CREATE INDEX IF NOT EXISTS idx_content_funnel ON content_items(funnel_stage);
CREATE INDEX IF NOT EXISTS idx_content_wace ON content_items(wace_focus) WHERE wace_focus = true;
CREATE INDEX IF NOT EXISTS idx_review_content ON review_history(content_id);
CREATE INDEX IF NOT EXISTS idx_crm_stage ON crm_leads(stage);
CREATE INDEX IF NOT EXISTS idx_crm_assignee ON crm_leads(assignee);
CREATE INDEX IF NOT EXISTS idx_account_platform ON account_matrix(platform);
CREATE INDEX IF NOT EXISTS idx_knowledge_subject ON knowledge_items USING GIN(subject);

-- ============================================================
-- Updated_at trigger function
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON content_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON knowledge_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON ip_personas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON account_matrix FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON crm_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON ai_prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
