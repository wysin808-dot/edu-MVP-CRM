-- ============================================================
-- BCI CRM v2.0 — Complete Database Schema
-- Supabase PostgreSQL (project: zjekwpjkuthczxguwwqc)
-- ============================================================
-- This is the full schema for the Next.js rewrite.
-- Run in Supabase SQL Editor to create all tables from scratch.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. personas — IP 角色表
-- ────────────────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────────────────
-- 2. accounts — 账号矩阵
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_name TEXT NOT NULL,
  platform TEXT NOT NULL,
  persona_id UUID REFERENCES personas(id),
  operator_name TEXT,
  stage TEXT DEFAULT '养号',
  follower_count INT DEFAULT 0,
  total_posts INT DEFAULT 0,
  total_leads INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 3. knowledge — 真实资料库
-- ────────────────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────────────────
-- 4. contents — 内容资产（核心表）
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  account_id UUID REFERENCES accounts(id),
  persona_id UUID REFERENCES personas(id),
  author_name TEXT,

  -- 内容策略标签
  status TEXT DEFAULT '草稿',
  funnel_stage TEXT DEFAULT 'Awareness',
  emotional_trigger TEXT DEFAULT '待定',
  content_type TEXT DEFAULT '干货',
  topic_cluster TEXT DEFAULT '其他',
  lead_magnet TEXT,
  primary_keyword TEXT,
  wace_focus BOOLEAN DEFAULT false,
  cta TEXT,
  audience_personas TEXT[] DEFAULT '{}',

  -- 正文 & 封面
  cover_image_url TEXT,
  body TEXT,

  -- 复用链
  repurpose_status TEXT DEFAULT '原稿',
  repurpose_parent_id UUID REFERENCES contents(id),

  -- 发布信息
  publish_date DATE,
  notes TEXT,

  -- AI 生成信息
  prompts_used TEXT,
  ai_search_ready BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 5. content_metrics — 内容指标（独立表，支持历史追踪）
-- ────────────────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────────────────
-- 6. content_media — 内容素材文件
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'image',  -- image, video, document
  file_size INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 7. crm_leads — 招生 CRM
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  child_name TEXT,
  child_grade TEXT,
  source_platform TEXT,
  source_content_id UUID REFERENCES contents(id),
  stage TEXT DEFAULT '新线索',
  assigned_to TEXT,
  interest_program TEXT,
  notes TEXT,
  next_followup DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 8. ai_prompts — AI Prompt 模板库
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  persona_id UUID REFERENCES personas(id),
  target_platform TEXT,
  prompt_text TEXT NOT NULL,
  use_count INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 9. published_posts — 发布记录
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS published_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES contents(id),
  account_id UUID REFERENCES accounts(id),
  platform TEXT,
  scheduled_time TIMESTAMPTZ,
  actual_time TIMESTAMPTZ,
  status TEXT DEFAULT '待发布',
  operator_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 10. content_knowledge_refs — 内容 ↔ 资料 多对多
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_knowledge_refs (
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  knowledge_id UUID REFERENCES knowledge(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, knowledge_id)
);

-- ────────────────────────────────────────────────────────────
-- 11. content_reviews — 内容审核记录
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  action TEXT NOT NULL,  -- 'approve' / 'reject' / 'comment'
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 12. content_comments — 内容评论
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 13. user_profiles — 用户角色表（与 Supabase Auth 关联）
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  role TEXT DEFAULT 'operator',
  team TEXT DEFAULT 'china',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 14. audit_log — 审计日志
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_knowledge_refs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read all tables
CREATE POLICY "auth_read_all" ON personas FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all" ON accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all" ON knowledge FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all" ON contents FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all" ON content_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all" ON content_media FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all" ON crm_leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all" ON ai_prompts FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all" ON published_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all" ON content_knowledge_refs FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all" ON content_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all" ON content_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all" ON user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all" ON audit_log FOR SELECT TO authenticated USING (true);

-- All authenticated users can write to most tables
CREATE POLICY "auth_write_all" ON personas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_all" ON accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_all" ON knowledge FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_all" ON contents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_all" ON content_metrics FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_all" ON content_media FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_all" ON crm_leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_all" ON ai_prompts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_all" ON published_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_all" ON content_knowledge_refs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_all" ON content_reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_all" ON content_comments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_all" ON audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- user_profiles: users can read all but only update own
CREATE POLICY "auth_update_own" ON user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "auth_insert_own" ON user_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status);
CREATE INDEX IF NOT EXISTS idx_contents_platform ON contents(platform);
CREATE INDEX IF NOT EXISTS idx_contents_publish_date ON contents(publish_date);
CREATE INDEX IF NOT EXISTS idx_contents_topic ON contents(topic_cluster);
CREATE INDEX IF NOT EXISTS idx_contents_wace ON contents(wace_focus) WHERE wace_focus = true;
CREATE INDEX IF NOT EXISTS idx_content_metrics_content ON content_metrics(content_id);
CREATE INDEX IF NOT EXISTS idx_content_media_content ON content_media(content_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_stage ON crm_leads(stage);
CREATE INDEX IF NOT EXISTS idx_crm_leads_followup ON crm_leads(next_followup);
CREATE INDEX IF NOT EXISTS idx_accounts_platform ON accounts(platform);
CREATE INDEX IF NOT EXISTS idx_knowledge_tags ON knowledge USING GIN(subject_tags);
CREATE INDEX IF NOT EXISTS idx_published_posts_time ON published_posts(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_content_reviews_content ON content_reviews(content_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_content ON content_comments(content_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);

-- ============================================================
-- updated_at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON personas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON knowledge FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON contents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON crm_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RPC: Atomic prompt usage increment
-- ============================================================

CREATE OR REPLACE FUNCTION increment_prompt_usage(prompt_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ai_prompts
  SET use_count = use_count + 1,
      last_used_at = now()
  WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Storage bucket (create via Supabase Dashboard > Storage)
-- ============================================================
-- Name: content-media
-- Public: Yes
-- File size limit: 10MB
-- Allowed MIME types: image/*, video/*, application/pdf
--
-- Storage policies (run in SQL after creating bucket):
--
-- CREATE POLICY "auth_upload" ON storage.objects
--   FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'content-media');
--
-- CREATE POLICY "auth_read" ON storage.objects
--   FOR SELECT TO authenticated
--   USING (bucket_id = 'content-media');
--
-- CREATE POLICY "auth_delete" ON storage.objects
--   FOR DELETE TO authenticated
--   USING (bucket_id = 'content-media');
