-- 号码资产 RLS：PII（实名/身份证/手机号）收紧
-- admin 全量；lead 仅自己名下(owner_id=自己)；运营/AI/招生 无权
-- 之前是 auth_read_all / auth_write_all（任何登录用户全读全写），属高风险

-- 取当前用户角色：security definer 以函数属主(postgres)身份读 user_profiles，避开 RLS 递归
create or replace function public.my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.user_profiles where id = auth.uid()
$$;

-- ── phone_numbers ──
drop policy if exists "auth_read_all" on phone_numbers;
drop policy if exists "auth_write_all" on phone_numbers;

create policy "phone_select" on phone_numbers for select to authenticated
  using ( public.my_role() = 'admin' or (public.my_role() = 'lead' and owner_id = auth.uid()) );
create policy "phone_insert" on phone_numbers for insert to authenticated
  with check ( public.my_role() = 'admin' or (public.my_role() = 'lead' and owner_id = auth.uid()) );
create policy "phone_update" on phone_numbers for update to authenticated
  using ( public.my_role() = 'admin' or (public.my_role() = 'lead' and owner_id = auth.uid()) )
  with check ( public.my_role() = 'admin' or (public.my_role() = 'lead' and owner_id = auth.uid()) );
create policy "phone_delete" on phone_numbers for delete to authenticated
  using ( public.my_role() = 'admin' or (public.my_role() = 'lead' and owner_id = auth.uid()) );

-- ── phone_recharges：跟随所属号码的权限 ──
drop policy if exists "auth_read_all" on phone_recharges;
drop policy if exists "auth_write_all" on phone_recharges;

create policy "recharge_select" on phone_recharges for select to authenticated
  using ( public.my_role() = 'admin' or exists (
    select 1 from phone_numbers p where p.id = phone_recharges.phone_id and p.owner_id = auth.uid() ) );
create policy "recharge_insert" on phone_recharges for insert to authenticated
  with check ( public.my_role() = 'admin' or exists (
    select 1 from phone_numbers p where p.id = phone_recharges.phone_id and p.owner_id = auth.uid() ) );
create policy "recharge_update" on phone_recharges for update to authenticated
  using ( public.my_role() = 'admin' or exists (
    select 1 from phone_numbers p where p.id = phone_recharges.phone_id and p.owner_id = auth.uid() ) );
create policy "recharge_delete" on phone_recharges for delete to authenticated
  using ( public.my_role() = 'admin' or exists (
    select 1 from phone_numbers p where p.id = phone_recharges.phone_id and p.owner_id = auth.uid() ) );

notify pgrst, 'reload schema';
