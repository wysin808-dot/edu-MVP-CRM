import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

// GrowthOS 首页看板：真实数据聚合
// 范围：admin=全部，lead=本团队，其余=仅本人
// 周期：day / week / month / year

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function windowStart(period: string): string {
  const now = new Date();
  const sgt = new Date(now.getTime() + 8 * 3600 * 1000);
  const y = sgt.getUTCFullYear(), m = sgt.getUTCMonth(), d = sgt.getUTCDate();
  let startSgtMidnightUtcMs: number;
  if (period === "day") {
    startSgtMidnightUtcMs = Date.UTC(y, m, d, 0, 0, 0);
  } else if (period === "month") {
    startSgtMidnightUtcMs = Date.UTC(y, m, 1, 0, 0, 0);
  } else if (period === "year") {
    startSgtMidnightUtcMs = Date.UTC(y, 0, 1, 0, 0, 0);
  } else {
    // week：近 7 天（含今天）
    startSgtMidnightUtcMs = Date.UTC(y, m, d, 0, 0, 0) - 6 * 24 * 3600 * 1000;
  }
  return new Date(startSgtMidnightUtcMs - 8 * 3600 * 1000).toISOString();
}

export async function GET(request: NextRequest) {
  const serverSupabase = await createServerClient();
  const { data: { user } } = await serverSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: prof } = await serverSupabase
    .from("user_profiles")
    .select("role, team, display_name")
    .eq("id", user.id)
    .single();
  const role = prof?.role || "operator";
  const team = prof?.team || "china";
  const myName = prof?.display_name || user.email?.split("@")[0] || "我";

  const period = request.nextUrl.searchParams.get("period") || "week";
  const start = windowStart(period);

  const isManager = role === "admin" || role === "lead";
  const scope: "team" | "self" = isManager ? "team" : "self";

  const admin = serviceClient();

  // 统计对象的 user 集合
  let userIds: string[] = [user.id];
  const nameMap = new Map<string, string>([[user.id, myName]]);
  if (isManager) {
    let pq = admin.from("user_profiles").select("id, display_name, team");
    if (role !== "admin") pq = pq.eq("team", team);
    const { data: profiles } = await pq;
    userIds = (profiles || []).map((p) => p.id);
    (profiles || []).forEach((p) => nameMap.set(p.id, p.display_name || "未命名"));
    if (userIds.length === 0) userIds = [user.id];
  }

  // 生成内容（coach_generated）
  let coachRows: { user_id: string; platform: string }[] = [];
  {
    const { data } = await admin
      .from("coach_generated")
      .select("user_id, platform")
      .in("user_id", userIds)
      .gte("created_at", start);
    coachRows = data || [];
  }
  const content = coachRows.length;
  const videoScripts = coachRows.filter((r) => r.platform === "视频脚本").length;

  // 实际 AI 视频（usage_log）
  let videos = 0;
  try {
    let vq = admin.from("usage_log").select("*", { count: "exact", head: true }).eq("kind", "video").gte("created_at", start);
    if (scope === "self") vq = vq.eq("user_id", user.id);
    const { count } = await vq;
    videos = count || 0;
  } catch { /* ignore */ }

  // 询盘（crm_leads）：team 看全部；self 看分配给自己的
  let leadsCount = 0, leadsConverted = 0;
  try {
    let lq = admin.from("crm_leads").select("stage, assigned_to").gte("created_at", start);
    if (scope === "self") lq = lq.eq("assigned_to", myName);
    const { data: leads } = await lq;
    leadsCount = (leads || []).length;
    leadsConverted = (leads || []).filter((l) => l.stage === "已缴费").length;
  } catch { /* ignore */ }

  // 渠道分布
  const byChannel: Record<string, number> = {};
  for (const r of coachRows) byChannel[r.platform] = (byChannel[r.platform] || 0) + 1;

  // 团队排行榜（仅管理者可见）
  let leaderboard: { name: string; count: number }[] = [];
  if (scope === "team") {
    const userCount: Record<string, number> = {};
    for (const r of coachRows) userCount[r.user_id] = (userCount[r.user_id] || 0) + 1;
    leaderboard = Object.entries(userCount)
      .map(([id, count]) => ({ name: nameMap.get(id) || "未命名", count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }

  return NextResponse.json({
    role,
    scope,           // "team" | "self"
    period,          // day|week|month|year
    stats: { content, videoScripts, videos, leads: leadsCount, wechat: null },
    byChannel,
    total: content,
    leaderboard,
    performance: {
      newLeads: leadsCount,
      conversionRate: leadsCount > 0 ? Math.round((leadsConverted / leadsCount) * 100) : null,
      hotPosts: null,
      newFollowers: null,
    },
  });
}
