import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

// 管理员监控：每个员工的用量 + 团队动态。仅 admin / lead 可访问
export async function GET(request: NextRequest) {
  const serverSupabase = await createServerClient();
  const { data: { user } } = await serverSupabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: callerProfile } = await serverSupabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const callerRole = callerProfile?.role;
  if (callerRole !== "admin" && callerRole !== "lead") {
    return NextResponse.json({ error: "只有管理员和负责人可以访问监控后台" }, { status: 403 });
  }

  // 时间范围
  const period = request.nextUrl.searchParams.get("period") || "today";
  const now = new Date();
  let since: Date;
  if (period === "week") {
    since = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  } else if (period === "month") {
    since = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    since = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const sinceISO = since.toISOString();

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. 用量流水
  const { data: usageRows } = await admin
    .from("usage_log")
    .select("user_id,user_name,kind,count,tokens,created_at")
    .gte("created_at", sinceISO)
    .order("created_at", { ascending: false })
    .limit(10000);

  // 2. 用户档案（名字/角色）
  const { data: profiles } = await admin
    .from("user_profiles")
    .select("id,display_name,role,team");

  // 3. 角色额度
  const { data: quotaCfg } = await admin
    .from("quota_config")
    .select("scope,scope_key,daily_text,daily_image,daily_video");

  type Cfg = { scope: string; scope_key: string; daily_text: number; daily_image: number; daily_video: number };
  const roleLimits: Record<string, { text: number; image: number; video: number }> = {};
  const userLimits: Record<string, { text: number; image: number; video: number }> = {};
  for (const c of (quotaCfg as Cfg[]) || []) {
    const v = { text: c.daily_text, image: c.daily_image, video: c.daily_video };
    if (c.scope === "role") roleLimits[c.scope_key] = v;
    else if (c.scope === "user") userLimits[c.scope_key] = v;
  }

  type Prof = { id: string; display_name: string | null; role: string; team: string | null };
  const profMap: Record<string, Prof> = {};
  for (const p of (profiles as Prof[]) || []) profMap[p.id] = p;

  // 聚合到每个用户
  type UsageRow = { user_id: string; user_name: string | null; kind: string; count: number | null; tokens: number | null };
  const perUser: Record<string, {
    userId: string;
    name: string;
    role: string;
    text: number; image: number; video: number; tokens: number;
  }> = {};

  for (const r of (usageRows as UsageRow[]) || []) {
    const uid = r.user_id;
    if (!uid) continue;
    if (!perUser[uid]) {
      const prof = profMap[uid];
      perUser[uid] = {
        userId: uid,
        name: prof?.display_name || r.user_name || "未知用户",
        role: prof?.role || "operator",
        text: 0, image: 0, video: 0, tokens: 0,
      };
    }
    const u = perUser[uid];
    if (r.kind === "text") u.text += r.count || 0;
    else if (r.kind === "image") u.image += r.count || 0;
    else if (r.kind === "video") u.video += r.count || 0;
    u.tokens += r.tokens || 0;
  }

  const users = Object.values(perUser)
    .map((u) => {
      const limits = userLimits[u.userId] || roleLimits[u.role] || { text: 50, image: 100, video: 5 };
      return { ...u, limits };
    })
    .sort((a, b) => b.text + b.image + b.video - (a.text + a.image + a.video));

  // 团队动态：最近生成的内容（含主题/平台/谁/何时）
  const { data: recent } = await admin
    .from("coach_generated")
    .select("id,user_name,topic,platform,content_type,output_text,created_at")
    .gte("created_at", sinceISO)
    .order("created_at", { ascending: false })
    .limit(50);

  const totals = users.reduce(
    (t, u) => ({ text: t.text + u.text, image: t.image + u.image, video: t.video + u.video, tokens: t.tokens + u.tokens }),
    { text: 0, image: 0, video: 0, tokens: 0 }
  );

  return NextResponse.json({ period, users, recent: recent || [], totals });
}
