-- 007_usage_quota.sql
-- MCN 内容中台：每人每天额度 + 用量流水（管理监控用）
-- 在 Supabase SQL Editor 执行（IF NOT EXISTS 可重复安全执行）

-- 1. 额度配置：按角色设默认，可覆盖到具体个人。-1 表示不限
CREATE TABLE IF NOT EXISTS quota_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL,         -- 'role' | 'user'
  scope_key TEXT NOT NULL,     -- 角色名 或 user_id
  daily_text INT DEFAULT 50,   -- 每天文案生成次数
  daily_image INT DEFAULT 100, -- 每天配图张数
  daily_video INT DEFAULT 5,   -- 每天视频条数
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (scope, scope_key)
);

-- 2. 用量流水：每次生成记一条，用于额度计算 + 管理监控
CREATE TABLE IF NOT EXISTS usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_name TEXT,
  kind TEXT NOT NULL,          -- 'text' | 'image' | 'video'
  count INT DEFAULT 1,
  tokens INT DEFAULT 0,
  cost NUMERIC(10,4) DEFAULT 0,
  detail TEXT,                 -- 主题/平台等，便于管理员查看
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_usage_log_user_day ON usage_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_log_day ON usage_log (created_at DESC);

-- 3. 角色默认额度（按 5 角色给一套合理默认，可在后台改）
INSERT INTO quota_config (scope, scope_key, daily_text, daily_image, daily_video) VALUES
  ('role', 'admin',     -1,  -1,  -1),   -- 超管不限
  ('role', 'lead',      200, 300, 30),   -- 负责人
  ('role', 'operator',  80,  120, 8),    -- 运营
  ('role', 'ai',        120, 200, 12),   -- AI编辑
  ('role', 'admission', 50,  60,  5)     -- 招生顾问
ON CONFLICT (scope, scope_key) DO NOTHING;
