-- 006_coach_token_stats.sql
-- 为朋友圈教练生成记录增加 Token 统计字段
-- 用于：Token 成本统计、模型记录
-- 在 Supabase SQL Editor 执行即可（IF NOT EXISTS 可重复安全执行）

ALTER TABLE coach_generated
  ADD COLUMN IF NOT EXISTS model TEXT,
  ADD COLUMN IF NOT EXISTS prompt_tokens INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completion_tokens INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_tokens INTEGER DEFAULT 0;

-- 便于按时间统计
CREATE INDEX IF NOT EXISTS idx_coach_generated_created_at
  ON coach_generated (created_at DESC);
