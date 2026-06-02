-- 010_topic_center.sql
-- 选题中心（Topic Center）：输入关键词 → AI 产出分类流量选题 → 一键转内容工厂
-- 在 Supabase SQL Editor 执行

CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_name TEXT,
  team TEXT DEFAULT 'china',
  keyword TEXT NOT NULL,          -- 输入的关键词，如 "WACE"
  batch_id TEXT,                  -- 一次生成的批次号
  category TEXT,                  -- 流量型/焦虑型/对比型/申请型/干货型/热点型
  title TEXT NOT NULL,            -- 选题标题
  angle TEXT,                     -- 一句话角度说明
  status TEXT DEFAULT '待用',     -- 待用/已生成/已弃用
  used_count INT DEFAULT 0,       -- 被转成内容的次数
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_topics_user ON topics (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_team ON topics (team, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_batch ON topics (batch_id);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- 本人或同团队可见
DROP POLICY IF EXISTS topics_select ON topics;
CREATE POLICY topics_select ON topics FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR team = (SELECT team FROM user_profiles WHERE id = auth.uid())
  );

-- 只能以自己身份创建
DROP POLICY IF EXISTS topics_insert ON topics;
CREATE POLICY topics_insert ON topics FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 本人或同团队可更新（标记已用/弃用）
DROP POLICY IF EXISTS topics_update ON topics;
CREATE POLICY topics_update ON topics FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR team = (SELECT team FROM user_profiles WHERE id = auth.uid())
  );

-- 仅创建者可删除
DROP POLICY IF EXISTS topics_delete ON topics;
CREATE POLICY topics_delete ON topics FOR DELETE TO authenticated
  USING (user_id = auth.uid());
