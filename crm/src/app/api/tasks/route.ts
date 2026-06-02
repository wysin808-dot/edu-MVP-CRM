import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

// 任务中心：组长派任务，员工执行，自动统计完成度
// 自动进度 = 员工在「内容生成」里产出的条数（start_date 起算），让"混日子"可见

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getProfile() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, role: null, team: null, name: null };
  const { data: prof } = await supabase
    .from("user_profiles")
    .select("role, team, display_name")
    .eq("id", user.id)
    .single();
  return {
    user,
    role: prof?.role || "operator",
    team: prof?.team || "china",
    name: prof?.display_name || user.email?.split("@")[0] || "unknown",
  };
}

// ── GET：列出任务 + 自动进度 ──
export async function GET() {
  const { user, role, team } = await getProfile();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = serviceClient();
  let q = admin.from("tasks").select("*").order("created_at", { ascending: false }).limit(300);

  if (role === "operator" || role === "ai" || role === "admission") {
    q = q.eq("assignee_id", user.id);
  } else if (role === "lead") {
    q = q.eq("team", team);
  }
  // admin: 全部

  const { data: tasks, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const list = tasks || [];
  // 批量统计每个被指派者从最早 start_date 起的内容产出
  const assignees = Array.from(new Set(list.map((t) => t.assignee_id)));
  let genRows: { user_id: string; created_at: string; platform: string | null }[] = [];
  if (assignees.length > 0) {
    const minDate =
      list.reduce<string>((min, t) => {
        const d = t.start_date || t.created_at?.slice(0, 10) || "2020-01-01";
        return d < min ? d : min;
      }, "9999-12-31") + "T00:00:00";
    const { data: gen } = await admin
      .from("coach_generated")
      .select("user_id, created_at, platform")
      .in("user_id", assignees)
      .gte("created_at", minDate);
    genRows = gen || [];
  }

  const today = new Date().toISOString().slice(0, 10);
  const enriched = list.map((t) => {
    const startTs = `${t.start_date || t.created_at?.slice(0, 10)}T00:00:00`;
    const autoDone = genRows.filter(
      (g) => g.user_id === t.assignee_id && g.created_at >= startTs
    ).length;
    const done = t.manual_done != null ? t.manual_done : autoDone;
    const target = t.target_total || 0;
    const percent = target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0;
    const overdue =
      t.status === "进行中" && t.due_date && t.due_date < today && done < target;
    return { ...t, auto_done: autoDone, done, percent, overdue };
  });

  return NextResponse.json({ tasks: enriched, role });
}

// ── POST：创建任务（仅 lead / admin）──
export async function POST(request: NextRequest) {
  const { user, role, team, name } = await getProfile();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "lead" && role !== "admin") {
    return NextResponse.json({ error: "只有组长和管理员可以派发任务" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { assignee_id, assignee_name, title, description, target_total, platform_targets, start_date, due_date } = body;
  if (!assignee_id || !title) {
    return NextResponse.json({ error: "缺少被指派人或任务标题" }, { status: 400 });
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      team,
      created_by: user.id,
      created_by_name: name,
      assignee_id,
      assignee_name: assignee_name || null,
      title,
      description: description || null,
      target_total: Number(target_total) || 0,
      platform_targets: platform_targets || null,
      start_date: start_date || new Date().toISOString().slice(0, 10),
      due_date: due_date || null,
      status: "进行中",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: data });
}

// ── PATCH：更新任务状态 / 手动登记完成数 ──
export async function PATCH(request: NextRequest) {
  const { user } = await getProfile();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, status, manual_done } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status) patch.status = status;
  if (manual_done !== undefined) patch.manual_done = manual_done === null ? null : Number(manual_done);

  // 用 server client，RLS 保证只有创建者/被指派者能改
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("tasks").update(patch).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: data });
}

// ── DELETE：删除任务（RLS 保证仅创建者）──
export async function DELETE(request: NextRequest) {
  const { user } = await getProfile();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = await createServerClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
