-- ============================================================
-- BCI Academic Portal — Demo Seed Data
-- Run after:
-- 1. docs/supabase-schema.sql
-- 2. docs/role-backend-views.sql
--
-- This seed does not create auth.users. Profiles are normally created
-- after Supabase Auth users exist.
-- ============================================================

INSERT INTO programmes (id, name, description, status)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'WACE', 'Western Australian Certificate of Education pathway', 'active')
ON CONFLICT (name) DO NOTHING;

INSERT INTO subjects (id, programme_id, code, name, course_type, status)
VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'PHY', 'Physics', 'WACE_ATAR', 'active'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'MAM', 'Mathematics Methods', 'WACE_ATAR', 'active'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'CHE', 'Chemistry', 'WACE_ATAR', 'active'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'EALD', 'EALD', 'School', 'active'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'ENG-G', 'English General', 'WACE_General', 'active')
ON CONFLICT (programme_id, name) DO NOTHING;

INSERT INTO teachers (id, full_name, department, status)
VALUES
  ('30000000-0000-0000-0000-000000000001', 'Mr Lim', 'Science', 'active'),
  ('30000000-0000-0000-0000-000000000002', 'Ms Wong', 'Mathematics', 'active'),
  ('30000000-0000-0000-0000-000000000003', 'Mr Koh', 'Science', 'active'),
  ('30000000-0000-0000-0000-000000000004', 'Ms Tan', 'English', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO teacher_subjects (teacher_id, subject_id, permission_level, can_create_assignments, can_enter_marks, can_manage_outline, status)
VALUES
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'teach', true, true, false, 'active'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'lead', true, true, true, 'active'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'teach', true, true, false, 'active'),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'teach', true, true, false, 'active'),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000005', 'moderate', true, false, false, 'active')
ON CONFLICT (teacher_id, subject_id) DO NOTHING;

INSERT INTO students (id, student_code, full_name, preferred_name, year_level, programme, enrollment_status)
VALUES
  ('40000000-0000-0000-0000-000000000001', 'BCI-G10-001', 'Amanda Lee', 'Amanda', 'Year 10', 'WACE', 'active'),
  ('40000000-0000-0000-0000-000000000002', 'BCI-G11-001', 'Jason Ng', 'Jason', 'Year 11', 'WACE', 'active'),
  ('40000000-0000-0000-0000-000000000003', 'BCI-G12-001', 'Priya Shah', 'Priya', 'Year 12', 'WACE', 'active')
ON CONFLICT (student_code) DO NOTHING;

INSERT INTO classes (id, subject_id, teacher_id, class_name, year_level, room, status)
VALUES
  ('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'G10 Physics', 'Year 10', 'Lab 2', 'active'),
  ('50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', 'G10 EALD', 'Year 10', '204', 'active'),
  ('50000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'G11 Mathematics Methods', 'Year 11', '301', 'active'),
  ('50000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'G12 Chemistry', 'Year 12', 'Lab 1', 'active'),
  ('50000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000004', 'G12 English General', 'Year 12', '205', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO class_students (class_id, student_id)
VALUES
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002'),
  ('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000003'),
  ('50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000003')
ON CONFLICT (class_id, student_id) DO NOTHING;

INSERT INTO timetable_entries (id, class_id, student_id, day_of_week, start_time, end_time, room, status)
VALUES
  ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 1, '08:30', '09:20', '204', 'scheduled'),
  ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 1, '10:00', '10:50', 'Lab 2', 'scheduled'),
  ('60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002', 1, '10:00', '10:50', '301', 'conflict'),
  ('60000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000003', 2, '09:20', '10:10', 'Lab 1', 'scheduled')
ON CONFLICT (id) DO NOTHING;

INSERT INTO assignments (id, class_id, subject_id, title, description, scope, due_at, assigned_by, status)
VALUES
  ('70000000-0000-0000-0000-000000000001', null, '20000000-0000-0000-0000-000000000001', 'Force diagram practice', 'Individual support task for vector diagrams.', 'individual', now() + INTERVAL '2 days', '30000000-0000-0000-0000-000000000001', 'published'),
  ('70000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Lab safety reflection', 'Class-wide reflection after practical lesson.', 'class', now() + INTERVAL '4 days', '30000000-0000-0000-0000-000000000001', 'published')
ON CONFLICT (id) DO NOTHING;

INSERT INTO assignment_targets (assignment_id, student_id)
VALUES
  ('70000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001')
ON CONFLICT (assignment_id, student_id) DO NOTHING;

INSERT INTO wace_assessment_outlines (id, subject_id, year_level, semester, units, course_type, teacher_id, status)
VALUES
  ('80000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Year 10', 'Semester 2', 'Pre-WACE pathway', 'School preparation', '30000000-0000-0000-0000-000000000001', 'published'),
  ('80000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Year 11', 'Units 1 & 2', 'ATAR Units 1 & 2', 'ATAR', '30000000-0000-0000-0000-000000000002', 'published'),
  ('80000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'Year 12', 'Semester 1', 'ATAR Units 3 & 4', 'ATAR', '30000000-0000-0000-0000-000000000003', 'director_review'),
  ('80000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000005', 'Year 12', 'Semester 1', 'General Units 3 & 4', 'General', '30000000-0000-0000-0000-000000000004', 'draft')
ON CONFLICT (id) DO NOTHING;

INSERT INTO wace_assessment_tasks (id, outline_id, title, assessment_type, weighting, due_date, evidence_required)
VALUES
  ('81000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', 'Forces investigation', 'Investigation', 25, current_date + 7, 'Rubric + student report'),
  ('81000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000001', 'Motion test', 'Test', 35, current_date + 21, 'Marked test paper'),
  ('81000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000002', 'Functions test', 'Test', 30, current_date + 10, 'Marked script'),
  ('81000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000003', 'Equilibrium practical', 'Practical', 20, current_date + 14, 'Lab report + rubric'),
  ('81000000-0000-0000-0000-000000000005', '80000000-0000-0000-0000-000000000004', 'Externally Set Task', 'EST', 15, current_date + 30, 'EST script')
ON CONFLICT (id) DO NOTHING;

INSERT INTO evidence_items (id, evidence_type, title, related_table, related_id, status)
VALUES
  ('90000000-0000-0000-0000-000000000001', 'Attendance', 'G10 Physics attendance evidence', 'classes', '50000000-0000-0000-0000-000000000001', 'complete'),
  ('90000000-0000-0000-0000-000000000002', 'Assessment', 'Physics assessment rubric gap', 'wace_assessment_outlines', '80000000-0000-0000-0000-000000000001', 'gap')
ON CONFLICT (id) DO NOTHING;
