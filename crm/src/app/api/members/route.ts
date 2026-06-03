import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

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

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

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
