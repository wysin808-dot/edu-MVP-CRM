import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

// GrowthOS 首页看板：真实数据聚合（今日生产 / 本周渠道分布 / 团队排行榜 / 内容表现）
// 效果类数据（爆文/粉丝/转化率）依赖发布登记与回填，缺数据时返回 null（前端显示「待接入」）

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const serverSupabase = await createServerClient();
  const { data: { user } } = await serverSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: prof } = await serverSupabase
    .from("user_profiles")
    .select("role, team")
    .eq("id", user.id)
    .single();
  const role = prof?.role || "operator";
  const team = prof?.team || "china";

  const admin = serviceClient();

  // 时间窗口（按新加坡时区 UTC+8 计算今日/本周起点）
  const now = new Date();
  const sgt = new Date(now.getTime() + 8 * 3600 * 1000);
  const todayStartUtc = new Date(Date.UTC(sgt.getUTCFullYear(), sgt.getUTCMonth(), sgt.getUTCDate(), 0, 0, 0) - 8 * 3600 * 1000);
  const weekStartUtc = new Date(todayStartUtc.getTime() - 6 * 24 * 3600 * 1000);
  const todayStart = todayStartUtc.toISOString();
  const weekStart = weekStartUtc.toISOString();

  // 团队成员范围（admin 看全部；其他看本团队）
  let profilesQ = admin.from("user_profiles").select("id, display_name, team");
  if (role !== "admin") profilesQ = profilesQ.eq("team", team);
  const { data: profiles } = await profilesQ;
  const teamIds = (profiles || []).map((p) => p.id);
  const nameMap = new Map((profiles || []).map((p) => [p.id, p.display_name || "未命名"]));

  // 本周生成内容（coach_generated）
  let coachRows: { user_id: string; platform: string; created_at: string }[] = [];
  if (teamIds.length) {
    const { data } = await admin
      .from("coach_generated")
      .select("user_id, platform, created_at")
      .in("user_id", teamIds)
      .gte("created_at", weekStart);
    coachRows = data || [];
  }
  const todayRows = coachRows.filter((r) => r.created_at >= todayStart);

  // 今日数据
  const todayContent = todayRows.length;
  const todayVideoScripts = todayRows.filter((r) => r.platform === "视频脚本").length;

  // 实际视频（usage_log kind=video，今日）
  let todayVideos = 0;
  try {
    const { count } = await admin
      .from("usage_log")
      .select("*", { count: "exact", head: true })
      .eq("kind", "video")
      .gte("created_at", todayStart);
    todayVideos = count || 0;
  } catch { /* ignore */ }

  // 询盘（crm_leads，全组织）
  let leadsToday = 0, leadsWeek = 0, leadsConverted = 0;
  try {
    const { data: leads } = await admin.from("crm_leads").select("created_at, stage").gte("created_at", weekStart);
    leadsWeek = (leads || []).length;
    leadsToday = (leads || []).filter((l) => l.created_at >= todayStart).length;
    leadsConverted = (leads || []).filter((l) => l.stage === "已缴费").length;
  } catch { /* ignore */ }

  // 本周渠道分布（按生成渠道）
  const byChannel: Record<string, number> = {};
  for (const r of coachRows) byChannel[r.platform] = (byChannel[r.platform] || 0) + 1;

  // 团队排行榜（本周生成量）
  const userCount: Record<string, number> = {};
  for (const r of coachRows) userCount[r.user_id] = (userCount[r.user_id] || 0) + 1;
  const leaderboard = Object.entries(userCount)
    .map(([id, count]) => ({ name: nameMap.get(id) || "未命名", count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return NextResponse.json({
    role,
    today: {
      content: todayContent,
      videoScripts: todayVideoScripts,
      videos: todayVideos,       // 实际AI视频（待视频功能上线后有数）
      leads: leadsToday,
      wechat: null,              // 待接入：新增微信好友需手动登记
    },
    week: {
      byChannel,
      total: coachRows.length,
      leads: leadsWeek,
    },
    leaderboard,
    performance: {
      newLeads: leadsWeek,                 // ✅ 真实
      conversionRate: leadsWeek > 0 ? Math.round((leadsConverted / leadsWeek) * 100) : null, // ✅ 真实(本周缴费/线索)
      hotPosts: null,                       // 待接入：需发布数据回填
      newFollowers: null,                   // 待接入：需账号粉丝快照
    },
  });
}
