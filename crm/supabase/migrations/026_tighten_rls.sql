-- 026_tighten_rls.sql
-- 收紧三张高风险表的 RLS：
--   crm_leads  — operator/ai 完全封锁（客户 PII）
--   contents   — operator/ai 只能操作自己创建的内容（author_name 匹配）
--   accounts   — 写操作仅 admin / lead
--   personas   — 写操作仅 admin / lead
--
-- 依赖 025 已创建的 public.my_role() security-definer 函数

-- ================================================================
-- 1. crm_leads
--    SELECT/INSERT/UPDATE: admin 全量；lead 全量；admission 全量
--    DELETE: admin only
--    operator / ai：完全无权（客户姓名/电话/孩子信息属 PII）
-- ================================================================

DROP POLICY IF EXISTS "auth_read_all" ON crm_leads;
DROP POLICY IF EXISTS "auth_write_all" ON crm_leads;

-- 只有招生相关角色可见
CREATE POLICY "crm_select" ON crm_leads FOR SELECT TO authenticated
  USING ( public.my_role() IN ('admin', 'lead', 'admission') );

-- admin / lead / admission 可新建线索
CREATE POLICY "crm_insert" ON crm_leads FOR INSERT TO authenticated
  WITH CHECK ( public.my_role() IN ('admin', 'lead', 'admission') );

-- admin / lead / admission 可更新（跟进、阶段移动等）
CREATE POLICY "crm_update" ON crm_leads FOR UPDATE TO authenticated
  USING  ( public.my_role() IN ('admin', 'lead', 'admission') )
  WITH CHECK ( public.my_role() IN ('admin', 'lead', 'admission') );

-- 只有 admin 可删除线索
CREATE POLICY "crm_delete" ON crm_leads FOR DELETE TO authenticated
  USING ( public.my_role() = 'admin' );

-- ================================================================
-- 2. contents
--    SELECT: 全员可读（内容共享是正常业务需求）
--    INSERT: 全员可建（运营/AI 的本职工作）
--    UPDATE: admin/lead 全量；operator/ai 仅自己的（author_name 匹配）
--    DELETE: admin/lead 仅限；operator/ai 不能删
-- ================================================================

DROP POLICY IF EXISTS "auth_write_all" ON contents;

-- INSERT：全员（含 operator / ai），运营须填正确 author_name
CREATE POLICY "contents_insert" ON contents FOR INSERT TO authenticated
  WITH CHECK (
    public.my_role() IN ('admin', 'lead')
    OR author_name = (
      SELECT display_name FROM public.user_profiles WHERE id = auth.uid()
    )
  );

-- UPDATE：admin/lead 全量；operator/ai 只能改自己的
CREATE POLICY "contents_update" ON contents FOR UPDATE TO authenticated
  USING (
    public.my_role() IN ('admin', 'lead')
    OR author_name = (
      SELECT display_name FROM public.user_profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    public.my_role() IN ('admin', 'lead')
    OR author_name = (
      SELECT display_name FROM public.user_profiles WHERE id = auth.uid()
    )
  );

-- DELETE：只有 admin / lead
CREATE POLICY "contents_delete" ON contents FOR DELETE TO authenticated
  USING ( public.my_role() IN ('admin', 'lead') );

-- ================================================================
-- 3. accounts
--    SELECT: 全员可读（运营需要知道账号列表）
--    INSERT/UPDATE/DELETE: 仅 admin / lead
-- ================================================================

DROP POLICY IF EXISTS "auth_write_all" ON accounts;

CREATE POLICY "accounts_write" ON accounts FOR ALL TO authenticated
  USING  ( public.my_role() IN ('admin', 'lead') )
  WITH CHECK ( public.my_role() IN ('admin', 'lead') );

-- ================================================================
-- 4. personas (IP 矩阵)
--    SELECT: 全员可读
--    INSERT/UPDATE/DELETE: 仅 admin / lead
-- ================================================================

DROP POLICY IF EXISTS "auth_write_all" ON personas;

CREATE POLICY "personas_write" ON personas FOR ALL TO authenticated
  USING  ( public.my_role() IN ('admin', 'lead') )
  WITH CHECK ( public.my_role() IN ('admin', 'lead') );

-- ================================================================
-- 5. ai_prompts（Prompt 模板库）
--    SELECT: 全员可读
--    INSERT: 仅 admin / lead（模板由管理层维护）
--    UPDATE: 全员（运营使用 prompt 时需要更新 use_count）
--    DELETE: 仅 admin / lead
-- ================================================================

DROP POLICY IF EXISTS "auth_write_all" ON ai_prompts;

CREATE POLICY "prompts_insert" ON ai_prompts FOR INSERT TO authenticated
  WITH CHECK ( public.my_role() IN ('admin', 'lead') );

CREATE POLICY "prompts_update" ON ai_prompts FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "prompts_delete" ON ai_prompts FOR DELETE TO authenticated
  USING ( public.my_role() IN ('admin', 'lead') );

-- ================================================================
-- 刷新 PostgREST schema 缓存
-- ================================================================

NOTIFY pgrst, 'reload schema';
