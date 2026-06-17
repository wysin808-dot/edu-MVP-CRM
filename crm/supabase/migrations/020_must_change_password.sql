-- 新成员加入后强制首次登录改密码
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;
NOTIFY pgrst, 'reload schema';
