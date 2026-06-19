-- 平台改为管理员可在系统设置里增删的动态列表（之前写死在代码）
-- id 用平台名本身，跟现有数据(accounts.platform / contents.platform 存的是名字)对齐
CREATE TABLE IF NOT EXISTS platforms (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT DEFAULT '📱',
  budget_percent NUMERIC DEFAULT 0,
  sort_order INT DEFAULT 100,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_read_all" ON platforms FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_write_all" ON platforms FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 用现有 8 个平台做种子
INSERT INTO platforms (id, label, icon, budget_percent, sort_order) VALUES
  ('小红书','小红书','📕',35,1),
  ('抖音','抖音','🎵',20,2),
  ('视频号','视频号','📹',15,3),
  ('公众号','公众号','📰',8,4),
  ('独立站SEO','独立站SEO','🌐',12,5),
  ('知乎','知乎','💡',5,6),
  ('Google/YouTube','Google/YouTube','▶️',3,7),
  ('Facebook/IG','Facebook/IG','📘',2,8)
ON CONFLICT (id) DO NOTHING;

NOTIFY pgrst, 'reload schema';
