-- 账号矩阵 ↔ 号码资产 真正的外键关联
-- 一个号码可注册多个账号；一个账号注册在一个号码上
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS phone_number_id UUID REFERENCES phone_numbers(id);
CREATE INDEX IF NOT EXISTS idx_accounts_phone_number_id ON accounts(phone_number_id);

-- 把之前手填的电话，自动匹配到号码资产里相同的号码
UPDATE accounts a
SET phone_number_id = p.id
FROM phone_numbers p
WHERE a.phone_number_id IS NULL
  AND a.phone IS NOT NULL
  AND a.phone = p.phone;
