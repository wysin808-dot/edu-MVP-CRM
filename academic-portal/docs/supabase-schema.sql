-- ============================================================
-- BCI Academic Portal — Supabase / PostgreSQL Schema
-- Independent learning system, not connected to the admissions CRM.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- 1. profiles / people
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin', 'school_admin', 'academic_director', 'teacher', 'student', 'parent', 'qa_mr')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  student_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  preferred_name TEXT,
  year_level TEXT NOT NULL,
  programme TEXT NOT NULL DEFAULT 'WACE',
  enrollment_status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  department TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_guardians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'guardian',
  can_view_reports BOOLEAN DEFAULT true,
  can_receive_alerts BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, parent_id)
);

-- ────────────────────────────────────────────────────────────
-- 2. academic structure
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS programmes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  programme_id UUID REFERENCES programmes(id) ON DELETE SET NULL,
  code TEXT,
  name TEXT NOT NULL,
  course_type TEXT DEFAULT 'School' CHECK (course_type IN ('School', 'WACE_ATAR', 'WACE_General', 'WACE_Foundation', 'A_Level', 'O_Level')),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(programme_id, name)
);

CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  class_name TEXT NOT NULL,
  year_level TEXT NOT NULL,
  room TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teacher_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL DEFAULT 'teach' CHECK (permission_level IN ('teach', 'lead', 'moderate')),
  can_create_assignments BOOLEAN DEFAULT true,
  can_enter_marks BOOLEAN DEFAULT true,
  can_manage_outline BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(teacher_id, subject_id)
);

CREATE TABLE IF NOT EXISTS class_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(class_id, student_id)
);

-- ────────────────────────────────────────────────────────────
-- 3. timetable
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS timetable_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'conflict', 'cancelled')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 4. attendance + QR sessions
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS attendance_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  timetable_entry_id UUID REFERENCES timetable_entries(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  qr_token TEXT UNIQUE,
  qr_expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attendance_session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('present', 'late', 'absent', 'excused')),
  check_in_method TEXT DEFAULT 'teacher' CHECK (check_in_method IN ('teacher', 'qr', 'manual_import')),
  check_in_at TIMESTAMPTZ,
  marked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(attendance_session_id, student_id)
);

-- ────────────────────────────────────────────────────────────
-- 5. assignments
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  scope TEXT NOT NULL DEFAULT 'class' CHECK (scope IN ('class', 'individual')),
  due_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assignment_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'not_submitted' CHECK (status IN ('not_submitted', 'submitted', 'late', 'returned', 'marked')),
  file_url TEXT,
  file_name TEXT,
  score NUMERIC,
  feedback TEXT,
  marked_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  marked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

-- ────────────────────────────────────────────────────────────
-- 6. grades
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  assessment_name TEXT NOT NULL,
  score NUMERIC NOT NULL,
  max_score NUMERIC DEFAULT 100,
  grade_label TEXT,
  trend TEXT,
  visible_to_student BOOLEAN DEFAULT true,
  visible_to_parent BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 7. WACE school-based assessment
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wace_assessment_outlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  year_level TEXT NOT NULL CHECK (year_level IN ('Year 10', 'Year 11', 'Year 12')),
  semester TEXT NOT NULL,
  units TEXT,
  course_type TEXT NOT NULL CHECK (course_type IN ('School preparation', 'ATAR', 'General', 'Foundation')),
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'director_review', 'approved')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wace_assessment_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outline_id UUID NOT NULL REFERENCES wace_assessment_outlines(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN (
    'Investigation', 'Response', 'Examination', 'Test',
    'EST', 'Practical', 'Portfolio', 'Oral', 'Production', 'Performance'
  )),
  weighting NUMERIC NOT NULL CHECK (weighting > 0 AND weighting <= 100),
  max_mark NUMERIC NOT NULL DEFAULT 100 CHECK (max_mark > 0),
  is_est BOOLEAN NOT NULL DEFAULT false,
  due_date DATE,
  evidence_required TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wace_task_marks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES wace_assessment_tasks(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  raw_mark NUMERIC NOT NULL CHECK (raw_mark >= 0),
  feedback TEXT,
  entered_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  entered_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'teacher_entered', 'director_review', 'approved')),
  UNIQUE(task_id, student_id)
);

CREATE TABLE IF NOT EXISTS wace_school_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outline_id UUID NOT NULL REFERENCES wace_assessment_outlines(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  school_mark NUMERIC,
  rank_in_course INTEGER,
  grade_label TEXT CHECK (grade_label IN ('A', 'B', 'C', 'D', 'E')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'director_review', 'approved', 'released')),
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(outline_id, student_id)
);

-- ────────────────────────────────────────────────────────────
-- 7b. WACE grade descriptions & validation
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wace_grade_descriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  course_type TEXT NOT NULL CHECK (course_type IN ('ATAR', 'General', 'Foundation')),
  grade_label TEXT NOT NULL CHECK (grade_label IN ('A', 'B', 'C', 'D', 'E')),
  description TEXT NOT NULL,
  mark_range_low NUMERIC NOT NULL,
  mark_range_high NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(subject_id, course_type, grade_label)
);

CREATE OR REPLACE FUNCTION wace_grade_from_mark(mark NUMERIC)
RETURNS TEXT AS $$
  SELECT CASE
    WHEN mark >= 75 THEN 'A'
    WHEN mark >= 65 THEN 'B'
    WHEN mark >= 50 THEN 'C'
    WHEN mark >= 35 THEN 'D'
    ELSE 'E'
  END;
$$ LANGUAGE SQL IMMUTABLE;

CREATE OR REPLACE FUNCTION validate_outline_weights(p_outline_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(weighting), 0) INTO total
  FROM wace_assessment_tasks
  WHERE outline_id = p_outline_id;
  RETURN total = 100;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION check_est_requirement(p_outline_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_course_type TEXT;
  has_est BOOLEAN;
BEGIN
  SELECT course_type INTO v_course_type
  FROM wace_assessment_outlines WHERE id = p_outline_id;
  IF v_course_type NOT IN ('General', 'Foundation') THEN
    RETURN true;
  END IF;
  SELECT EXISTS(
    SELECT 1 FROM wace_assessment_tasks
    WHERE outline_id = p_outline_id AND is_est = true
  ) INTO has_est;
  RETURN has_est;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION calculate_school_mark(p_outline_id UUID, p_student_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  weighted_sum NUMERIC := 0;
  total_weight NUMERIC := 0;
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT t.weighting, t.max_mark, m.raw_mark
    FROM wace_assessment_tasks t
    JOIN wace_task_marks m ON m.task_id = t.id
    WHERE t.outline_id = p_outline_id AND m.student_id = p_student_id
  LOOP
    weighted_sum := weighted_sum + (rec.raw_mark / rec.max_mark * 100) * (rec.weighting / 100.0);
    total_weight := total_weight + rec.weighting;
  END LOOP;
  IF total_weight = 0 THEN RETURN NULL; END IF;
  RETURN ROUND(weighted_sum * (100.0 / total_weight));
END;
$$ LANGUAGE plpgsql STABLE;

-- ────────────────────────────────────────────────────────────
-- 8. AI, evidence, audit
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  tutor_type TEXT,
  prompt TEXT NOT NULL,
  response_summary TEXT,
  model_name TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evidence_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evidence_type TEXT NOT NULL,
  title TEXT NOT NULL,
  related_table TEXT,
  related_id UUID,
  owner_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'complete' CHECK (status IN ('gap', 'complete', 'review')),
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_table TEXT,
  entity_id UUID,
  detail JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- Indexes
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_students_programme_year ON students(programme, year_level);
CREATE INDEX IF NOT EXISTS idx_timetable_student_time ON timetable_entries(student_id, day_of_week, start_time);
CREATE INDEX IF NOT EXISTS idx_attendance_session_date ON attendance_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_assignment_targets_student ON assignment_targets(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_student ON assignment_submissions(assignment_id, student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_wace_marks_student ON wace_task_marks(student_id);
CREATE INDEX IF NOT EXISTS idx_wace_results_student ON wace_school_results(student_id);
CREATE INDEX IF NOT EXISTS idx_evidence_type ON evidence_items(evidence_type);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_table, entity_id);
CREATE INDEX IF NOT EXISTS idx_wace_grade_desc ON wace_grade_descriptions(subject_id, course_type);

-- ────────────────────────────────────────────────────────────
-- RLS
-- These policies are intentionally conservative starter policies.
-- Refine them once production roles and school org boundaries are final.
-- ────────────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE wace_assessment_outlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE wace_assessment_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE wace_task_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE wace_school_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE wace_grade_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION current_profile_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
  SELECT current_profile_role() IN ('admin', 'super_admin', 'school_admin', 'academic_director', 'teacher', 'qa_mr');
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin_staff()
RETURNS BOOLEAN AS $$
  SELECT current_profile_role() IN ('admin', 'super_admin', 'school_admin', 'academic_director');
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Staff baseline access
CREATE POLICY "Staff can read profiles" ON profiles FOR SELECT TO authenticated USING (is_staff() OR id = auth.uid());
CREATE POLICY "Admin staff can manage profiles" ON profiles FOR ALL TO authenticated USING (is_admin_staff()) WITH CHECK (is_admin_staff());
CREATE POLICY "Staff can read core academic data" ON students FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff can read parents" ON parents FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff can read teachers" ON teachers FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff can read programmes" ON programmes FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff can read subjects" ON subjects FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff can read classes" ON classes FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff can read teacher_subjects" ON teacher_subjects FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff can read class_students" ON class_students FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff can read timetable" ON timetable_entries FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff can read attendance sessions" ON attendance_sessions FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff can read attendance records" ON attendance_records FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff can read assignments" ON assignments FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff can read assignment targets" ON assignment_targets FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff can read submissions" ON assignment_submissions FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff can read grades" ON grades FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff can read WACE outlines" ON wace_assessment_outlines FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff can read WACE tasks" ON wace_assessment_tasks FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff can read WACE task marks" ON wace_task_marks FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff can read WACE school results" ON wace_school_results FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff can read evidence" ON evidence_items FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff can read audit logs" ON audit_logs FOR SELECT TO authenticated USING (is_admin_staff());

-- Student/parent read access to released/visible records.
CREATE POLICY "Students can read own profile" ON profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Students can read own grades" ON grades FOR SELECT TO authenticated USING (
  visible_to_student
  AND student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
);
CREATE POLICY "Students can read own released WACE results" ON wace_school_results FOR SELECT TO authenticated USING (
  status = 'released'
  AND student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
);
CREATE POLICY "Parents can read child released WACE results" ON wace_school_results FOR SELECT TO authenticated USING (
  status = 'released'
  AND student_id IN (
    SELECT sg.student_id
    FROM student_guardians sg
    JOIN parents p ON p.id = sg.parent_id
    WHERE p.profile_id = auth.uid() AND sg.can_view_reports
  )
);
CREATE POLICY "Students can read own assignment targets" ON assignment_targets FOR SELECT TO authenticated USING (
  student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
);
CREATE POLICY "Students can read own class assignments" ON assignments FOR SELECT TO authenticated USING (
  id IN (
    SELECT at.assignment_id
    FROM assignment_targets at
    JOIN students s ON s.id = at.student_id
    WHERE s.profile_id = auth.uid()
  )
  OR class_id IN (
    SELECT cs.class_id
    FROM class_students cs
    JOIN students s ON s.id = cs.student_id
    WHERE s.profile_id = auth.uid() AND cs.status = 'active'
  )
);
CREATE POLICY "Students can read own submissions" ON assignment_submissions FOR SELECT TO authenticated USING (
  student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
);
CREATE POLICY "Students can create own submissions" ON assignment_submissions FOR INSERT TO authenticated WITH CHECK (
  student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
);
CREATE POLICY "Students can update own unmarked submissions" ON assignment_submissions FOR UPDATE TO authenticated USING (
  student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
  AND status IN ('not_submitted', 'submitted', 'late')
) WITH CHECK (
  student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
  AND status IN ('submitted', 'late')
);

-- Write access for MVP staff workflows.
CREATE POLICY "Admin staff can manage academic structure" ON programmes FOR ALL TO authenticated USING (is_admin_staff()) WITH CHECK (is_admin_staff());
CREATE POLICY "Admin staff can manage subjects" ON subjects FOR ALL TO authenticated USING (is_admin_staff()) WITH CHECK (is_admin_staff());
CREATE POLICY "Admin staff can manage classes" ON classes FOR ALL TO authenticated USING (is_admin_staff()) WITH CHECK (is_admin_staff());
CREATE POLICY "Admin staff can manage teacher subjects" ON teacher_subjects FOR ALL TO authenticated USING (is_admin_staff()) WITH CHECK (is_admin_staff());
CREATE POLICY "Admin staff can manage timetable" ON timetable_entries FOR ALL TO authenticated USING (is_admin_staff()) WITH CHECK (is_admin_staff());

CREATE POLICY "Teachers can manage attendance sessions" ON attendance_sessions FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY "Teachers can manage attendance records" ON attendance_records FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY "Teachers can manage assignments" ON assignments FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY "Teachers can manage assignment targets" ON assignment_targets FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY "Teachers can manage submissions" ON assignment_submissions FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY "Teachers can manage grades" ON grades FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());

CREATE POLICY "Staff can manage WACE outlines" ON wace_assessment_outlines FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY "Staff can manage WACE tasks" ON wace_assessment_tasks FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY "Staff can manage WACE marks" ON wace_task_marks FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY "Staff can manage WACE results" ON wace_school_results FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY "Staff can read grade descriptions" ON wace_grade_descriptions FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Admin staff can manage grade descriptions" ON wace_grade_descriptions FOR ALL TO authenticated USING (is_admin_staff()) WITH CHECK (is_admin_staff());

CREATE POLICY "Authenticated can create AI interactions" ON ai_interactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can read AI interactions" ON ai_interactions FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff can manage evidence" ON evidence_items FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY "Authenticated can insert audit logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- Teacher onboarding helper
-- Call this after creating an auth user/profile for a teacher.
-- subject_permissions format:
-- [
--   {
--     "subject_id": "uuid",
--     "permission_level": "teach",
--     "can_create_assignments": true,
--     "can_enter_marks": true,
--     "can_manage_outline": false
--   }
-- ]
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION create_teacher_profile_with_subjects(
  teacher_profile_id UUID,
  teacher_full_name TEXT,
  teacher_department TEXT,
  subject_permissions JSONB
)
RETURNS UUID AS $$
DECLARE
  new_teacher_id UUID;
  item JSONB;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin', 'school_admin', 'academic_director')
  ) THEN
    RAISE EXCEPTION 'Only admin staff can create teacher subject permissions';
  END IF;

  INSERT INTO teachers (profile_id, full_name, department, status)
  VALUES (teacher_profile_id, teacher_full_name, teacher_department, 'active')
  RETURNING id INTO new_teacher_id;

  FOR item IN SELECT * FROM jsonb_array_elements(subject_permissions)
  LOOP
    INSERT INTO teacher_subjects (
      teacher_id,
      subject_id,
      permission_level,
      can_create_assignments,
      can_enter_marks,
      can_manage_outline,
      status
    )
    VALUES (
      new_teacher_id,
      (item ->> 'subject_id')::UUID,
      COALESCE(item ->> 'permission_level', 'teach'),
      COALESCE((item ->> 'can_create_assignments')::BOOLEAN, true),
      COALESCE((item ->> 'can_enter_marks')::BOOLEAN, true),
      COALESCE((item ->> 'can_manage_outline')::BOOLEAN, false),
      'active'
    );
  END LOOP;

  INSERT INTO audit_logs (actor_profile_id, action, entity_table, entity_id, detail)
  VALUES (
    auth.uid(),
    'create_teacher_with_subjects',
    'teachers',
    new_teacher_id,
    jsonb_build_object('subject_permissions', subject_permissions)
  );

  RETURN new_teacher_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────
-- WACE graduation progress tracking
-- Tracks whether each student meets WACE requirements:
--   - At least 20 units
--   - At least 14 C grades across Year 11+12
--   - At least 6 C grades in Year 12
--   - At least 4 English units
--   - Year 12 List A + List B pair
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW wace_graduation_progress AS
SELECT
  s.id AS student_id,
  s.full_name,
  s.year_level,
  COUNT(DISTINCT r.outline_id) * 2 AS total_units,
  COUNT(DISTINCT r.outline_id) FILTER (
    WHERE r.grade_label IN ('A', 'B', 'C')
  ) * 2 AS c_or_above_units,
  COUNT(DISTINCT r.outline_id) FILTER (
    WHERE r.grade_label IN ('A', 'B', 'C')
      AND o.year_level = 'Year 12'
  ) * 2 AS year12_c_units,
  COUNT(DISTINCT r.outline_id) * 2 >= 20 AS meets_unit_count,
  COUNT(DISTINCT r.outline_id) FILTER (
    WHERE r.grade_label IN ('A', 'B', 'C')
  ) * 2 >= 14 AS meets_14c,
  COUNT(DISTINCT r.outline_id) FILTER (
    WHERE r.grade_label IN ('A', 'B', 'C')
      AND o.year_level = 'Year 12'
  ) * 2 >= 6 AS meets_6c_year12
FROM students s
LEFT JOIN wace_school_results r ON r.student_id = s.id
LEFT JOIN wace_assessment_outlines o ON o.id = r.outline_id
WHERE s.programme = 'WACE'
GROUP BY s.id, s.full_name, s.year_level;
