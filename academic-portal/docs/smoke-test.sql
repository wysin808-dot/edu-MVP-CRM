-- ============================================================
-- BCI Academic Portal — Smoke Test
-- Run after schema, role views, and optional seed.
-- ============================================================

SELECT 'programmes' AS check_name, COUNT(*) AS count FROM programmes
UNION ALL SELECT 'subjects', COUNT(*) FROM subjects
UNION ALL SELECT 'teachers', COUNT(*) FROM teachers
UNION ALL SELECT 'teacher_subjects', COUNT(*) FROM teacher_subjects
UNION ALL SELECT 'students', COUNT(*) FROM students
UNION ALL SELECT 'classes', COUNT(*) FROM classes
UNION ALL SELECT 'timetable_entries', COUNT(*) FROM timetable_entries
UNION ALL SELECT 'assignments', COUNT(*) FROM assignments
UNION ALL SELECT 'wace_assessment_outlines', COUNT(*) FROM wace_assessment_outlines
UNION ALL SELECT 'wace_assessment_tasks', COUNT(*) FROM wace_assessment_tasks
UNION ALL SELECT 'evidence_items', COUNT(*) FROM evidence_items;

SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN (
    'student_portal_overview',
    'parent_portal_children_overview',
    'teacher_portal_overview',
    'teacher_portal_subject_permissions',
    'academic_director_portal_overview',
    'academic_director_student_timetable_matrix',
    'qa_mr_portal_overview',
    'school_admin_portal_overview'
  )
ORDER BY table_name;

