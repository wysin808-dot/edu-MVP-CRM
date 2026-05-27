-- Knowledge media table for image/file uploads on knowledge items
CREATE TABLE IF NOT EXISTS knowledge_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_id UUID NOT NULL REFERENCES knowledge(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'image',  -- image, document
  file_size BIGINT DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_media_knowledge_id ON knowledge_media(knowledge_id);
