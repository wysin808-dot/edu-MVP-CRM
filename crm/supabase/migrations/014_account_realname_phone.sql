-- 账号矩阵新增：实名（账号注册人）+ 注册手机号
-- 用于记录每个平台账号是用谁的身份、哪个电话注册的，方便找回/合规/交接
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS real_name TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS phone TEXT;

COMMENT ON COLUMN accounts.real_name IS '账号实名注册人姓名';
COMMENT ON COLUMN accounts.phone IS '账号注册绑定的手机号';
