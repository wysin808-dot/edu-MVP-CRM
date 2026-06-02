-- 009_team_chat.sql
-- 团队私聊（1对1）+ 管理审计
-- 在 Supabase SQL Editor 执行

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  sender_name TEXT,
  recipient_id UUID NOT NULL,
  recipient_name TEXT,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_pair ON messages (sender_id, recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages (recipient_id, created_at DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 收发双方可见自己的对话
DROP POLICY IF EXISTS messages_select_own ON messages;
CREATE POLICY messages_select_own ON messages FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- 只能以自己身份发送
DROP POLICY IF EXISTS messages_insert_own ON messages;
CREATE POLICY messages_insert_own ON messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- 接收方可标记已读
DROP POLICY IF EXISTS messages_update_recipient ON messages;
CREATE POLICY messages_update_recipient ON messages FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid());

-- 开启 Realtime（实时推送）；若已加入会报错可忽略
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
