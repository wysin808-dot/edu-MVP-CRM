-- Add daily_publish_target column to user_profiles
-- Allows admin/lead to set daily publishing KPI for operators
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS daily_publish_target INT DEFAULT 0;
