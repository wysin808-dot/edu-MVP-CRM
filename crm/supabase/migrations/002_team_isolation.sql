-- Add team column to data tables for team-based isolation
-- knowledge table is intentionally excluded (shared across all teams)

ALTER TABLE contents ADD COLUMN IF NOT EXISTS team TEXT DEFAULT 'china';
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS team TEXT DEFAULT 'china';
ALTER TABLE personas ADD COLUMN IF NOT EXISTS team TEXT DEFAULT 'china';
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS team TEXT DEFAULT 'china';
ALTER TABLE ai_prompts ADD COLUMN IF NOT EXISTS team TEXT DEFAULT 'china';

-- Index for faster team-scoped queries
CREATE INDEX IF NOT EXISTS idx_contents_team ON contents(team);
CREATE INDEX IF NOT EXISTS idx_accounts_team ON accounts(team);
CREATE INDEX IF NOT EXISTS idx_personas_team ON personas(team);
CREATE INDEX IF NOT EXISTS idx_crm_leads_team ON crm_leads(team);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_team ON ai_prompts(team);
