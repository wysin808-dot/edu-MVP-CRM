import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// 鉴权 + 取调用者信息
async function getCaller() {
  const serverSupabase = await createServerClient();
  const { data: { user } } = await serverSupabase.auth.getUser();
  if (!user) return { user: null, role: null, team: null };
  const { data: prof } = await serverSupabase
    .from("user_profiles")
    .select("role, team")
    .eq("id", user.id)
    .single();
  return { user, role: prof?.role || "operator", team: prof?.team || "china" };
}

// 校验调用者是否有权管理目标成员
function canManage(callerRole: string, callerTeam: string, targetRole: string, targetTeam: string): string | null {
  if (callerRole === "admin") return null;
  if (callerRole === "lead") {
    if (targetRole === "admin" || targetRole === "lead") return "负责人不能修改管理员或其他负责人";
    if (targetTeam !== callerTeam) return "负责人只能管理本团队成员";
    return null;
  }
  return "无权限";
}

// 成员列表（含登录邮箱）。仅 admin / lead。
// 登录邮箱在 auth.users 里，需用 service role 读取并与 user_profiles 合并。
export async function GET() {
  const serverSupabase = await createServerClient();
  const { data: { user } } = await serverSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: prof } = await serverSupabase
    .from("user_profiles")
    .select("role, team")
    .eq("id", user.id)
    .single();
  const role = prof?.role;
  const team = prof?.team;
  if (role !== "admin" && role !== "lead") {
    return NextResponse.json({ error: "只有管理员和负责人可以查看成员" }, { status: 403 });
  }

  const admin = serviceClient();

  // 资料
  let pq = admin.from("user_profiles").select("*").order("created_at", { ascending: true });
  if (role === "lead") pq = pq.eq("team", team);
  const { data: profiles, error } = await pq;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 登录邮箱（auth.users）
  const emailMap = new Map<string, string>();
  try {
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    (list?.users || []).forEach((u) => {
      if (u.id && u.email) emailMap.set(u.id, u.email);
    });
  } catch {
    /* 取邮箱失败时降级为无邮箱 */
  }

  const members = (profiles || []).map((p) => ({
    ...p,
    email: emailMap.get(p.id) || null,
  }));

  return NextResponse.json({ members });
}

// ── PATCH：修改成员登录邮箱 ──
export async function PATCH(request: NextRequest) {
  const { user, role, team } = await getCaller();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "admin" && role !== "lead") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const { id, email } = body;
  if (!id || !email) return NextResponse.json({ error: "缺少成员或邮箱" }, { status: 400 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
  }

  const admin = serviceClient();
  const { data: target } = await admin.from("user_profiles").select("role, team").eq("id", id).single();
  if (!target) return NextResponse.json({ error: "成员不存在" }, { status: 404 });
  const deny = canManage(role!, team!, target.role, target.team);
  if (deny) return NextResponse.json({ error: deny }, { status: 403 });

  const { error } = await admin.auth.admin.updateUserById(id, { email, email_confirm: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 502 });
  return NextResponse.json({ ok: true, email });
}

// ── DELETE：删除成员（auth + 资料）──
export async function DELETE(request: NextRequest) {
  const { user, role, team } = await getCaller();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "admin" && role !== "lead") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少成员 id" }, { status: 400 });
  if (id === user.id) return NextResponse.json({ error: "不能删除自己" }, { status: 400 });

  const admin = serviceClient();
  const { data: target } = await admin.from("user_profiles").select("role, team").eq("id", id).single();
  if (!target) return NextResponse.json({ error: "成员不存在" }, { status: 404 });
  const deny = canManage(role!, team!, target.role, target.team);
  if (deny) return NextResponse.json({ error: deny }, { status: 403 });

  // 先删资料行，再删 auth 用户（避免外键阻塞）
  await admin.from("user_profiles").delete().eq("id", id);
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) {
    return NextResponse.json(
      { error: `删除登录账号失败：${error.message}（资料已删除，请联系技术处理残留登录账号）` },
      { status: 502 }
    );
  }
  return NextResponse.json({ ok: true });
}
