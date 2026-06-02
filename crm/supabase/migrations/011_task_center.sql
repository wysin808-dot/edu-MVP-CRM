-- 011_task_center.sql
-- 任务中心（Task Center）：组长派任务 → 员工执行 → 自动统计完成率 → 喂排行榜
-- 在 Supabase SQL Editor 执行

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team TEXT DEFAULT 'china',
  created_by UUID NOT NULL,
  created_by_name TEXT,
  assignee_id UUID NOT NULL,
  assignee_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  target_total INT DEFAULT 0,      -- 目标内容产出条数（总）
  platform_targets JSONB,          -- 分平台目标 {"小红书":10,"知乎":5,"视频":3}
  start_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  status TEXT DEFAULT '进行中',     -- 进行中/已完成/已取消
  manual_done INT,                 -- 手动登记完成数（覆盖自动统计，可空）
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks (assignee_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_team ON tasks (team, created_at DESC);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 被指派者、创建者、同团队 均可见
DROP POLICY IF EXISTS tasks_select ON tasks;
CREATE POLICY tasks_select ON tasks FOR SELECT TO authenticated
  USING (
    assignee_id = auth.uid()
    OR created_by = auth.uid()
    OR team = (SELECT team FROM user_profiles WHERE id = auth.uid())
  );

-- 创建：以自己身份（应用层再校验 lead/admin 角色）
DROP POLICY IF EXISTS tasks_insert ON tasks;
CREATE POLICY tasks_insert ON tasks FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

-- 更新：创建者或被指派者（员工可标记完成 / 登记数量）
DROP POLICY IF EXISTS tasks_update ON tasks;
CREATE POLICY tasks_update ON tasks FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR assignee_id = auth.uid());

-- 删除：仅创建者
DROP POLICY IF EXISTS tasks_delete ON tasks;
CREATE POLICY tasks_delete ON tasks FOR DELETE TO authenticated
  USING (created_by = auth.uid());
