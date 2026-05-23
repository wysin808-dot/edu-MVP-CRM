# Role Backend Database Map

This file maps each Academic Portal role to the backend tables/views it should use.

## Admin / CEO

Primary views:

- `school_admin_portal_overview`
- `academic_director_portal_overview`
- `qa_mr_portal_overview`

Rules:

- Admin is the highest system authority, equivalent to CEO/Owner.
- Admin can see all operational, academic, evidence, and audit posture.
- Admin should be reserved for executive/system-level access, not routine teacher workflows.

## Student

Primary view:

- `student_portal_overview`

Core tables:

- `students`
- `timetable_entries`
- `attendance_records`
- `assignments`
- `assignment_targets`
- `assignment_submissions`
- `grades`
- `wace_school_results`
- `ai_interactions`

Rules:

- Student sees only their own records.
- Student sees WACE results only after `wace_school_results.status = 'released'`.
- Student can submit assignments but cannot mark/grade them.

## Parent

Primary view:

- `parent_portal_children_overview`

Core tables:

- `parents`
- `student_guardians`
- child-facing `students`
- visible `grades`
- released `wace_school_results`

Rules:

- Parent sees only linked children.
- Parent cannot see teacher mark-entry workflow.
- Parent cannot see other students in the class.

## Teacher

Primary view:

- `teacher_portal_overview`
- `teacher_portal_subject_permissions`

Core tables:

- `teachers`
- `classes`
- `class_students`
- `attendance_sessions`
- `attendance_records`
- `assignments`
- `assignment_targets`
- `assignment_submissions`
- `grades`
- `wace_assessment_outlines`
- `wace_assessment_tasks`
- `wace_task_marks`

Rules:

- Teacher can create individual or class assignments.
- Teacher should only create assignments for authorised subjects.
- Teacher can mark attendance for assigned classes.
- Teacher can enter WACE task marks only for authorised subjects and submit them for director review.
- Teacher cannot release final WACE school results.

## Academic Director

Primary views:

- `academic_director_portal_overview`
- `academic_director_student_timetable_matrix`

Core tables:

- all academic structure tables
- `timetable_entries`
- `attendance_records`
- `grades`
- all WACE assessment tables
- `evidence_items`

Rules:

- Academic Director owns full student timetable oversight.
- Academic Director approves WACE outlines and school results.
- Academic Director can resolve scheduling conflicts.

## QA / MR

Primary view:

- `qa_mr_portal_overview`

Core tables:

- `evidence_items`
- `audit_logs`
- released/approved academic evidence views

Rules:

- QA/MR verifies evidence.
- QA/MR should not edit teacher marks or release WACE results.
- QA/MR can export evidence packs.

## School Admin

Primary view:

- `school_admin_portal_overview`

Core tables:

- `profiles`
- `students`
- `parents`
- `teachers`
- `programmes`
- `subjects`
- `classes`

Rules:

- School Admin manages master data and users.
- School Admin does not need to perform teacher mark entry.

## Super Admin

Primary view:

- `school_admin_portal_overview`

Rules:

- Super Admin can manage global system configuration under the Admin/CEO authority model.
- Super Admin should be used sparingly for operational changes.
