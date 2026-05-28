-- Coach Generated Content
CREATE TABLE IF NOT EXISTS coach_generated (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  topic TEXT NOT NULL,
  platform TEXT NOT NULL,
  audience_tag TEXT,
  tone TEXT,
  content_type TEXT NOT NULL,
  output_text TEXT NOT NULL,
  is_daily BOOLEAN DEFAULT false,
  batch_id TEXT,
  is_saved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coach_generated_user ON coach_generated(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_generated_date ON coach_generated(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coach_generated_batch ON coach_generated(batch_id);

-- RLS
ALTER TABLE coach_generated ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all coach content"
  ON coach_generated FOR SELECT
  USING (true);

CREATE POLICY "Users can insert coach content"
  ON coach_generated FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own coach content"
  ON coach_generated FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own coach content"
  ON coach_generated FOR DELETE
  USING (auth.uid() = user_id);
