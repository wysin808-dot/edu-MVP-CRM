-- 账号矩阵「运营人」关联团队成员（user_profiles），不再是自由文本
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS operator_id UUID REFERENCES user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_accounts_operator_id ON accounts(operator_id);

-- 把已有手填的运营人，按显示名自动匹配到团队成员
UPDATE accounts a
SET operator_id = p.id
FROM user_profiles p
WHERE a.operator_id IS NULL
  AND a.operator_name IS NOT NULL
  AND a.operator_name = p.display_name;

NOTIFY pgrst, 'reload schema';
