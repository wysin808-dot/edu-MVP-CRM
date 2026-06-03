import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

// 全部内容：管理员/组长查看全员在「内容生产」的产出。service role 绕过 RLS。
// admin 看全部；lead 看本团队。
export async function GET(request: NextRequest) {
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
    return NextResponse.json({ error: "只有管理员和负责人可以查看" }, { status: 403 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 成员列表（用于筛选下拉）
  let pq = admin.from("user_profiles").select("id, display_name, team");
  if (role === "lead") pq = pq.eq("team", team);
  const { data: profiles } = await pq;
  const teamIds = (profiles || []).map((p) => p.id);
  const operators = (profiles || []).map((p) => ({ id: p.id, name: p.display_name || "未命名" }));

  const params = request.nextUrl.searchParams;
  const userId = params.get("userId") || "";
  const platform = params.get("platform") || "";
  const q = (params.get("q") || "").trim();
  const limit = Math.min(500, Number(params.get("limit")) || 200);

  let cq = admin
    .from("coach_generated")
    .select("id,user_id,user_name,topic,platform,content_type,output_text,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (role === "lead" && teamIds.length) cq = cq.in("user_id", teamIds);
  if (userId) cq = cq.eq("user_id", userId);
  if (platform) cq = cq.eq("platform", platform);
  if (q) cq = cq.or(`topic.ilike.%${q}%,output_text.ilike.%${q}%`);

  const { data: items, error } = await cq;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items: items || [], operators });
}
