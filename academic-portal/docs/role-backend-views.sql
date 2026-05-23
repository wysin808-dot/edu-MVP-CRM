-- ============================================================
-- BCI Academic Portal — Role Backend Views
-- Run after docs/supabase-schema.sql.
--
-- Purpose:
-- Each portal role gets a backend-facing SQL view that returns only the
-- data needed for that role's dashboard. RLS still applies underneath.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- Student Portal
-- One student sees only their own academic summary.
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW student_portal_overview
WITH (security_invoker = true) AS
SELECT
  s.id AS student_id,
  s.student_code,
  s.full_name,
  s.year_level,
  s.programme,
  (
    SELECT COUNT(*)
    FROM attendance_records ar
    WHERE ar.student_id = s.id
  ) AS attendance_records_count,
  (
    SELECT COUNT(*)
    FROM attendance_records ar
    WHERE ar.student_id = s.id AND ar.status = 'present'
  ) AS attendance_present_count,
  (
    SELECT COUNT(*)
    FROM assignments a
    LEFT JOIN assignment_targets at ON at.assignment_id = a.id
    LEFT JOIN class_students cs ON cs.class_id = a.class_id
    WHERE
      (a.scope = 'individual' AND at.student_id = s.id)
      OR (a.scope = 'class' AND cs.student_id = s.id)
  ) AS assignments_visible_count,
  (
    SELECT COUNT(*)
    FROM assignment_submissions sub
    WHERE sub.student_id = s.id AND sub.status IN ('not_submitted', 'late')
  ) AS assignments_open_count,
  (
    SELECT ROUND(AVG(g.score), 1)
    FROM grades g
    WHERE g.student_id = s.id AND g.visible_to_student = true
  ) AS visible_grade_average,
  (
    SELECT COUNT(*)
    FROM wace_school_results wr
    WHERE wr.student_id = s.id AND wr.status = 'released'
  ) AS released_wace_results_count,
  (
    SELECT COUNT(*)
    FROM ai_interactions ai
    WHERE ai.student_id = s.id
  ) AS ai_interactions_count
FROM students s
WHERE s.profile_id = auth.uid();

-- ────────────────────────────────────────────────────────────
-- Parent Portal
-- A parent sees child-level summary for linked children only.
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW parent_portal_children_overview
WITH (security_invoker = true) AS
SELECT
  p.id AS parent_id,
  s.id AS student_id,
  s.full_name AS student_name,
  s.year_level,
  s.programme,
  sg.relationship,
  (
    SELECT COUNT(*)
    FROM attendance_records ar
    WHERE ar.student_id = s.id AND ar.status IN ('absent', 'late')
  ) AS attendance_alert_count,
  (
    SELECT COUNT(*)
    FROM assignment_submissions sub
    WHERE sub.student_id = s.id AND sub.status IN ('not_submitted', 'late')
  ) AS assignment_alert_count,
  (
    SELECT ROUND(AVG(g.score), 1)
    FROM grades g
    WHERE g.student_id = s.id AND g.visible_to_parent = true
  ) AS visible_grade_average,
  (
    SELECT COUNT(*)
    FROM wace_school_results wr
    WHERE wr.student_id = s.id AND wr.status = 'released'
  ) AS released_wace_results_count
FROM parents p
JOIN student_guardians sg ON sg.parent_id = p.id
JOIN students s ON s.id = sg.student_id
WHERE p.profile_id = auth.uid() AND sg.can_view_reports = true;

-- ────────────────────────────────────────────────────────────
-- Teacher Portal
-- A teacher sees classes, assignments, attendance sessions, and WACE workload.
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW teacher_portal_overview
WITH (security_invoker = true) AS
SELECT
  t.id AS teacher_id,
  t.full_name,
  t.department,
  (
    SELECT COUNT(*)
    FROM classes c
    WHERE c.teacher_id = t.id AND c.status = 'active'
  ) AS active_classes_count,
  (
    SELECT COUNT(*)
    FROM teacher_subjects ts
    WHERE ts.teacher_id = t.id AND ts.status = 'active'
  ) AS authorised_subjects_count,
  (
    SELECT COUNT(*)
    FROM assignments a
    WHERE a.assigned_by = t.id AND a.status IN ('draft', 'published')
  ) AS active_assignments_count,
  (
    SELECT COUNT(*)
    FROM attendance_sessions ats
    JOIN classes c ON c.id = ats.class_id
    WHERE c.teacher_id = t.id AND ats.status = 'open'
  ) AS open_attendance_sessions_count,
  (
    SELECT COUNT(*)
    FROM assignment_submissions sub
    JOIN assignments a ON a.id = sub.assignment_id
    WHERE a.assigned_by = t.id AND sub.status IN ('submitted', 'late')
  ) AS submissions_to_mark_count,
  (
    SELECT COUNT(*)
    FROM wace_assessment_outlines wo
    WHERE wo.teacher_id = t.id AND wo.status IN ('draft', 'published')
  ) AS wace_outlines_in_progress_count,
  (
    SELECT COUNT(*)
    FROM wace_task_marks wm
    JOIN wace_assessment_tasks wt ON wt.id = wm.task_id
    JOIN wace_assessment_outlines wo ON wo.id = wt.outline_id
    WHERE wo.teacher_id = t.id AND wm.status IN ('draft', 'teacher_entered')
  ) AS wace_marks_to_submit_count
FROM teachers t
WHERE t.profile_id = auth.uid();

CREATE OR REPLACE VIEW teacher_portal_subject_permissions
WITH (security_invoker = true) AS
SELECT
  t.id AS teacher_id,
  t.full_name AS teacher_name,
  subj.id AS subject_id,
  subj.name AS subject_name,
  subj.course_type,
  ts.permission_level,
  ts.can_create_assignments,
  ts.can_enter_marks,
  ts.can_manage_outline,
  ts.status
FROM teacher_subjects ts
JOIN teachers t ON t.id = ts.teacher_id
JOIN subjects subj ON subj.id = ts.subject_id
WHERE t.profile_id = auth.uid() OR current_profile_role() IN ('admin', 'super_admin', 'school_admin', 'academic_director');

-- ────────────────────────────────────────────────────────────
-- Academic Director Portal
-- Academic director sees scheduling, risk, WACE review, and programme health.
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW academic_director_portal_overview
WITH (security_invoker = true) AS
SELECT
  (SELECT COUNT(*) FROM students WHERE enrollment_status = 'active') AS active_students_count,
  (SELECT COUNT(*) FROM teachers WHERE status = 'active') AS active_teachers_count,
  (SELECT COUNT(*) FROM classes WHERE status = 'active') AS active_classes_count,
  (SELECT COUNT(*) FROM timetable_entries WHERE status = 'conflict') AS timetable_conflicts_count,
  (
    SELECT COUNT(*)
    FROM attendance_records
    WHERE status IN ('absent', 'late')
  ) AS attendance_alerts_count,
  (
    SELECT COUNT(*)
    FROM wace_school_results
    WHERE status = 'director_review'
  ) AS wace_results_for_review_count,
  (
    SELECT COUNT(*)
    FROM wace_assessment_outlines
    WHERE status = 'director_review'
  ) AS wace_outlines_for_review_count,
  (
    SELECT ROUND(AVG(score), 1)
    FROM grades
  ) AS overall_grade_average
WHERE current_profile_role() IN ('admin', 'super_admin', 'school_admin', 'academic_director');

CREATE OR REPLACE VIEW academic_director_student_timetable_matrix
WITH (security_invoker = true) AS
SELECT
  s.id AS student_id,
  s.full_name AS student_name,
  s.year_level,
  s.programme,
  te.day_of_week,
  te.start_time,
  te.end_time,
  subj.name AS subject_name,
  c.class_name,
  COALESCE(te.room, c.room) AS room,
  teacher.full_name AS teacher_name,
  te.status
FROM timetable_entries te
JOIN students s ON s.id = te.student_id
JOIN classes c ON c.id = te.class_id
JOIN subjects subj ON subj.id = c.subject_id
LEFT JOIN teachers teacher ON teacher.id = c.teacher_id
WHERE current_profile_role() IN ('admin', 'super_admin', 'school_admin', 'academic_director');

-- ────────────────────────────────────────────────────────────
-- QA / MR Portal
-- QA sees evidence and audit posture, not private mark-entry workflow actions.
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW qa_mr_portal_overview
WITH (security_invoker = true) AS
SELECT
  (SELECT COUNT(*) FROM evidence_items) AS evidence_items_count,
  (SELECT COUNT(*) FROM evidence_items WHERE status = 'gap') AS evidence_gaps_count,
  (SELECT COUNT(*) FROM evidence_items WHERE evidence_type = 'Attendance') AS attendance_evidence_count,
  (SELECT COUNT(*) FROM evidence_items WHERE evidence_type = 'Assessment') AS assessment_evidence_count,
  (SELECT COUNT(*) FROM evidence_items WHERE evidence_type = 'AI Logs') AS ai_evidence_count,
  (SELECT COUNT(*) FROM audit_logs WHERE created_at >= now() - INTERVAL '30 days') AS audit_logs_30d_count
WHERE current_profile_role() IN ('admin', 'super_admin', 'school_admin', 'academic_director', 'qa_mr');

-- ────────────────────────────────────────────────────────────
-- School Admin / Super Admin Portal
-- Operational user and master-data health.
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW school_admin_portal_overview
WITH (security_invoker = true) AS
SELECT
  (SELECT COUNT(*) FROM profiles WHERE status = 'active') AS active_profiles_count,
  (SELECT COUNT(*) FROM profiles WHERE role = 'student' AND status = 'active') AS active_student_profiles_count,
  (SELECT COUNT(*) FROM profiles WHERE role = 'teacher' AND status = 'active') AS active_teacher_profiles_count,
  (SELECT COUNT(*) FROM students WHERE enrollment_status = 'active') AS active_students_count,
  (SELECT COUNT(*) FROM programmes WHERE status = 'active') AS active_programmes_count,
  (SELECT COUNT(*) FROM subjects WHERE status = 'active') AS active_subjects_count,
  (SELECT COUNT(*) FROM classes WHERE status = 'active') AS active_classes_count
WHERE current_profile_role() IN ('admin', 'super_admin', 'school_admin');

-- ────────────────────────────────────────────────────────────
-- Useful RPC: role-aware portal bootstrap
-- The frontend can call this after login to decide which view to load.
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_my_portal_role()
RETURNS TABLE (
  profile_id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT
) AS $$
  SELECT id, email, full_name, role
  FROM profiles
  WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;
