-- 012_topic_production_attrs.sql
-- 选题增加「生产属性」：建议平台 / 内容形式(图文·视频) / 真人出镜
-- 让每条选题变成可直接执行的生产任务卡
-- 在 Supabase SQL Editor 执行

ALTER TABLE topics ADD COLUMN IF NOT EXISTS suggest_platform TEXT;  -- 小红书/知乎/抖音/视频号/百家号…
ALTER TABLE topics ADD COLUMN IF NOT EXISTS content_form TEXT;      -- 图文 / 视频
ALTER TABLE topics ADD COLUMN IF NOT EXISTS needs_presenter TEXT;   -- 需要真人 / 口播不出镜 / 不需要
