-- 号码资产：微信信息（微信是手机号绑定的，1 个号码 1 个微信）
-- 自媒体平台账号走 accounts.phone_number_id 关联（多个）；微信记在号码本身
ALTER TABLE phone_numbers ADD COLUMN IF NOT EXISTS wechat_id TEXT;       -- 微信号
ALTER TABLE phone_numbers ADD COLUMN IF NOT EXISTS wechat_user TEXT;     -- 微信谁在用

COMMENT ON COLUMN phone_numbers.wechat_id IS '此号码绑定的微信号';
COMMENT ON COLUMN phone_numbers.wechat_user IS '微信使用人';
