-- 号码资产台账：公司所有手机号/SIM 卡的实名、归属地、月租、充值记录
-- ────────────────────────────────────────────────────────────

-- 1. phone_numbers — 手机号/SIM 卡台账
CREATE TABLE IF NOT EXISTS phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,                       -- 手机号码
  real_name TEXT,                            -- 实名持有人姓名
  id_card TEXT,                              -- 实名身份证号
  carrier TEXT,                              -- 运营商：移动/联通/电信/其他
  region TEXT,                               -- 号码归属地
  monthly_fee NUMERIC DEFAULT 0,             -- 月租（元）
  registered_accounts TEXT,                  -- 注册了哪些账号（自由填写：如 "小红书:SEDA日记, 抖音:xxx"）
  status TEXT DEFAULT '在用',                 -- 在用/停用/已注销
  notes TEXT,                                -- 备注
  team TEXT DEFAULT 'china',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. phone_recharges — 充值记录（一个号码多条）
CREATE TABLE IF NOT EXISTS phone_recharges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_id UUID NOT NULL REFERENCES phone_numbers(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,                   -- 充值金额（元）
  recharged_at DATE DEFAULT CURRENT_DATE,    -- 充值日期
  channel TEXT,                              -- 充值渠道：支付宝/微信/营业厅/话费卡
  note TEXT,                                 -- 备注
  created_by TEXT,                           -- 操作人
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── RLS（与其余表一致：authenticated 可读写，团队过滤在查询层做）──
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_recharges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_read_all" ON phone_numbers FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_write_all" ON phone_numbers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_read_all" ON phone_recharges FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_write_all" ON phone_recharges FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── 索引 ──
CREATE INDEX IF NOT EXISTS idx_phone_numbers_team ON phone_numbers(team);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_phone ON phone_numbers(phone);
CREATE INDEX IF NOT EXISTS idx_phone_recharges_phone ON phone_recharges(phone_id);

-- ── updated_at 触发器 ──
CREATE TRIGGER set_updated_at BEFORE UPDATE ON phone_numbers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
