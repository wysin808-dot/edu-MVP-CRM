-- 027_public_lead_insert.sql
-- 允许匿名用户（网站留资表单）向 crm_leads 插入新线索
-- 只允许 INSERT；SELECT/UPDATE/DELETE 仍受 026 策略保护（需登录角色）

CREATE POLICY "public_lead_insert" ON crm_leads FOR INSERT TO anon
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
