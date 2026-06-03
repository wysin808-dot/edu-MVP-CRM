-- 013_lead_source_attribution.sql
-- 招生线索来源归因：具体到哪个 IP（人设）和哪个账号
-- 在 Supabase SQL Editor 执行

ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS source_persona_id UUID REFERENCES personas(id);
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS source_account_id UUID REFERENCES accounts(id);

CREATE INDEX IF NOT EXISTS idx_crm_leads_persona ON crm_leads (source_persona_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_account ON crm_leads (source_account_id);
