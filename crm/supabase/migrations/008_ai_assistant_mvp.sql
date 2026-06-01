-- ============================================================
-- SEDA AI升学助手 MVP
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_assistant_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_assistant_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_assistant_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assistant_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_ai_assistant_chats"
  ON ai_assistant_chats
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "auth_read_ai_assistant_chats"
  ON ai_assistant_chats
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "public_insert_ai_assistant_events"
  ON ai_assistant_events
  FOR INSERT
  TO anon
  WITH CHECK (event_type = 'wechat_click');

CREATE POLICY "auth_read_ai_assistant_events"
  ON ai_assistant_events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_ai_assistant_chats_created
  ON ai_assistant_chats(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_assistant_chats_question
  ON ai_assistant_chats(question);

CREATE INDEX IF NOT EXISTS idx_ai_assistant_events_type_created
  ON ai_assistant_events(event_type, created_at);
