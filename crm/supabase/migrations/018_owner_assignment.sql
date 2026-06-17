-- 号码资产 / 账号矩阵 归属负责人：超管分配，负责人只看分配给自己的
ALTER TABLE phone_numbers ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES user_profiles(id);
ALTER TABLE accounts     ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES user_profiles(id);

CREATE INDEX IF NOT EXISTS idx_phone_numbers_owner ON phone_numbers(owner_id);
CREATE INDEX IF NOT EXISTS idx_accounts_owner ON accounts(owner_id);

NOTIFY pgrst, 'reload schema';
