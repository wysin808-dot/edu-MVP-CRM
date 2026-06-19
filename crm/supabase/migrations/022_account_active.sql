-- 账号只停用、不删除：加 active 标记（停用=软删除，数据和历史线索都保留）
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
CREATE INDEX IF NOT EXISTS idx_accounts_active ON accounts(active);
NOTIFY pgrst, 'reload schema';
