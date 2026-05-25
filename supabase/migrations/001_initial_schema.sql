-- BCI CRM v2 — Initial Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- ============================================================
-- 1. IP Personas (IP 角色表)
-- ============================================================
CREATE TABLE IF NOT EXISTS personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  role_title TEXT,
  tone TEXT,
  platforms TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  monthly_target INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. Account Matrix (账号矩阵)
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_name TEXT NOT NULL,
  platform TEXT NOT NULL,
  persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,
  operator_name TEXT,
  stage TEXT DEFAULT '养号',
  follower_count INT DEFAULT 0,
  total_posts INT DEFAULT 0,
  total_leads INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. Knowledge Base (真实资料库)
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  detail TEXT,
  source_url TEXT,
  source_type TEXT DEFAULT '人工整理',
  subject_tags TEXT[] DEFAULT '{}',
  item_type TEXT DEFAULT '资料',
  numeric_data TEXT,
  review_cycle TEXT DEFAULT '每年',
  verified_by TEXT,
  last_verified TIMESTAMPTZ,
  visibility TEXT DEFAULT '内部',
  used_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. Content Items (内容资产 — 核心表)
-- ============================================================
CREATE TABLE IF NOT EXISTS contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,
  author_name TEXT,

  -- Strategy tags
  status TEXT DEFAULT '草稿',
  funnel_stage TEXT DEFAULT 'Awareness',
  emotional_trigger TEXT DEFAULT '待定',
  content_type TEXT DEFAULT '干货',
  topic_cluster TEXT DEFAULT '未分类',
  lead_magnet TEXT,
  primary_keyword TEXT,
  wace_focus BOOLEAN DEFAULT false,
  cta TEXT,
  audience_personas TEXT[] DEFAULT '{}',

  -- Repurpose chain
  repurpose_status TEXT DEFAULT '原稿',
  repurpose_parent_id UUID REFERENCES contents(id) ON DELETE SET NULL,

  -- Publishing
  publish_date DATE,
  notes TEXT,

  -- AI
  prompts_used TEXT,
  ai_search_ready BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. Content Metrics (内容指标)
-- ============================================================
CREATE TABLE IF NOT EXISTS content_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  reads INT DEFAULT 0,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  private_messages INT DEFAULT 0,
  leads INT DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. CRM Leads (招生 CRM)
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  child_name TEXT,
  child_grade TEXT,
  source_platform TEXT,
  source_content_id UUID REFERENCES contents(id) ON DELETE SET NULL,
  stage TEXT DEFAULT '新线索',
  assigned_to TEXT,
  interest_program TEXT,
  notes TEXT,
  next_followup DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. AI Prompt Library (AI Prompt 模板库)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,
  target_platform TEXT,
  prompt_text TEXT NOT NULL,
  use_count INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. Published Posts (发布记录)
-- ============================================================
CREATE TABLE IF NOT EXISTS published_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES contents(id) ON DELETE SET NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  platform TEXT,
  scheduled_time TIMESTAMPTZ,
  actual_time TIMESTAMPTZ,
  status TEXT DEFAULT '待发布',
  operator_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 9. Content ↔ Knowledge References (多对多)
-- ============================================================
CREATE TABLE IF NOT EXISTS content_knowledge_refs (
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  knowledge_id UUID REFERENCES knowledge(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, knowledge_id)
);

-- ============================================================
-- 10. Content Reviews (审核记录)
-- ============================================================
CREATE TABLE IF NOT EXISTS content_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  action TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 11. Content Comments (内容评论)
-- ============================================================
CREATE TABLE IF NOT EXISTS content_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 12. User Profiles (用户角色表)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT DEFAULT 'operator',
  team TEXT DEFAULT 'china',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 13. Audit Log (审计日志)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_contents_platform ON contents(platform);
CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status);
CREATE INDEX IF NOT EXISTS idx_contents_publish_date ON contents(publish_date);
CREATE INDEX IF NOT EXISTS idx_contents_persona_id ON contents(persona_id);
CREATE INDEX IF NOT EXISTS idx_contents_account_id ON contents(account_id);
CREATE INDEX IF NOT EXISTS idx_contents_repurpose_parent ON contents(repurpose_parent_id);
CREATE INDEX IF NOT EXISTS idx_accounts_platform ON accounts(platform);
CREATE INDEX IF NOT EXISTS idx_accounts_persona_id ON accounts(persona_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_stage ON crm_leads(stage);
CREATE INDEX IF NOT EXISTS idx_crm_leads_source_content ON crm_leads(source_content_id);
CREATE INDEX IF NOT EXISTS idx_content_metrics_content ON content_metrics(content_id);
CREATE INDEX IF NOT EXISTS idx_content_reviews_content ON content_reviews(content_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_content ON content_comments(content_id);
CREATE INDEX IF NOT EXISTS idx_published_posts_content ON published_posts(content_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);

-- ============================================================
-- Auto-create user_profiles on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, role, team)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'operator'),
    'china'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_contents BEFORE UPDATE ON contents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_knowledge BEFORE UPDATE ON knowledge FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_personas BEFORE UPDATE ON personas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_accounts BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_crm_leads BEFORE UPDATE ON crm_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_knowledge_refs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- user_profiles: read own, admin reads all
CREATE POLICY "Users can read own profile" ON user_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins can read all profiles" ON user_profiles FOR SELECT USING (get_user_role() = 'admin');
CREATE POLICY "Admins can update all profiles" ON user_profiles FOR UPDATE USING (get_user_role() = 'admin');
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (id = auth.uid());

-- For all data tables: authenticated users can read, write depends on role
-- Contents
CREATE POLICY "Authenticated read contents" ON contents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert contents" ON contents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update contents" ON contents FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete contents" ON contents FOR DELETE TO authenticated USING (get_user_role() IN ('admin', 'lead'));

-- Knowledge
CREATE POLICY "Authenticated read knowledge" ON knowledge FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert knowledge" ON knowledge FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update knowledge" ON knowledge FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete knowledge" ON knowledge FOR DELETE TO authenticated USING (get_user_role() IN ('admin', 'lead'));

-- Personas
CREATE POLICY "Authenticated read personas" ON personas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage personas" ON personas FOR ALL TO authenticated USING (get_user_role() IN ('admin', 'lead'));

-- Accounts
CREATE POLICY "Authenticated read accounts" ON accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage accounts" ON accounts FOR ALL TO authenticated USING (get_user_role() IN ('admin', 'lead'));

-- CRM Leads
CREATE POLICY "Authenticated read crm_leads" ON crm_leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert crm_leads" ON crm_leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update crm_leads" ON crm_leads FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete crm_leads" ON crm_leads FOR DELETE TO authenticated USING (get_user_role() IN ('admin', 'lead'));

-- AI Prompts
CREATE POLICY "Authenticated read prompts" ON ai_prompts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert prompts" ON ai_prompts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update prompts" ON ai_prompts FOR UPDATE TO authenticated USING (true);

-- Published Posts
CREATE POLICY "Authenticated read posts" ON published_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert posts" ON published_posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update posts" ON published_posts FOR UPDATE TO authenticated USING (true);

-- Content Metrics
CREATE POLICY "Authenticated read metrics" ON content_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert metrics" ON content_metrics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update metrics" ON content_metrics FOR UPDATE TO authenticated USING (true);

-- Content Knowledge Refs
CREATE POLICY "Authenticated read refs" ON content_knowledge_refs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated manage refs" ON content_knowledge_refs FOR ALL TO authenticated USING (true);

-- Content Reviews
CREATE POLICY "Authenticated read reviews" ON content_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert reviews" ON content_reviews FOR INSERT TO authenticated WITH CHECK (true);

-- Content Comments
CREATE POLICY "Authenticated read comments" ON content_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert comments" ON content_comments FOR INSERT TO authenticated WITH CHECK (true);

-- Audit Log
CREATE POLICY "Admin read audit_log" ON audit_log FOR SELECT TO authenticated USING (get_user_role() IN ('admin', 'lead'));
CREATE POLICY "Authenticated insert audit_log" ON audit_log FOR INSERT TO authenticated WITH CHECK (true);
