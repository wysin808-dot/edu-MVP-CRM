"use client";

import { useQuery } from "@tanstack/react-query";

interface GrowthData {
  role: string;
  today: { content: number; videoScripts: number; videos: number; leads: number; wechat: number | null };
  week: { byChannel: Record<string, number>; total: number; leads: number };
  leaderboard: { name: string; count: number }[];
  performance: { newLeads: number; conversionRate: number | null; hotPosts: number | null; newFollowers: number | null };
}

const CHANNEL_META: Record<string, { icon: string; color: string }> = {
  朋友圈: { icon: "💬", color: "#10b981" },
  小红书: { icon: "📕", color: "#ef4444" },
  视频脚本: { icon: "🎬", color: "#db2777" },
  家长私聊: { icon: "👨‍👩‍👧", color: "#2563eb" },
  微信群: { icon: "👥", color: "#0ea5e9" },
  FAQ: { icon: "❓", color: "#d97706" },
};

function Stat({ label, value, icon, color, pending }: { label: string; value: string | number; icon: string; color: string; pending?: boolean }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{icon}</span>
        <span className="text-xs" style={{ color: "var(--muted)" }}>{label}</span>
      </div>
      {pending ? (
        <div className="text-sm font-medium" style={{ color: "var(--muted)" }}>待接入</div>
      ) : (
        <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      )}
    </div>
  );
}

export default function GrowthBoard() {
  const { data, isLoading } = useQuery({
    queryKey: ["growth-board"],
    refetchInterval: 120000,
    queryFn: async () => {
      const res = await fetch("/api/dashboard/growth");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "加载失败");
      return json as GrowthData;
    },
  });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: "var(--surface-soft)" }} />
        ))}
      </div>
    );
  }

  const channels = Object.entries(data.week.byChannel).sort((a, b) => b[1] - a[1]);
  const maxCh = channels.length ? channels[0][1] : 1;
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-6 mb-6">
      {/* 今日数据 */}
      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>📊 今日数据</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="新增内容" value={data.today.content} icon="📝" color="var(--brand)" />
          <Stat label="视频脚本" value={data.today.videoScripts} icon="🎬" color="#db2777" />
          <Stat label="新增询盘" value={data.today.leads} icon="🎯" color="var(--green)" />
          <Stat label="新增微信" value={0} icon="💬" color="var(--blue)" pending />
        </div>
      </div>

      {/* 本周生产（渠道分布） */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--ink)" }}>
          📅 本周生产
          <span className="text-xs font-normal" style={{ color: "var(--muted)" }}>共 {data.week.total} 条</span>
        </h3>
        <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          {channels.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>本周还没有内容产出</p>
          ) : (
            <div className="space-y-2.5">
              {channels.map(([ch, n]) => {
                const meta = CHANNEL_META[ch] || { icon: "📄", color: "#6b7280" };
                return (
                  <div key={ch} className="flex items-center gap-3">
                    <span className="text-xs w-20 flex items-center gap-1" style={{ color: "var(--ink)" }}>{meta.icon} {ch}</span>
                    <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "var(--surface-soft)" }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.round((n / maxCh) * 100)}%`, background: meta.color }} />
                    </div>
                    <span className="text-xs font-semibold w-8 text-right" style={{ color: "var(--ink)" }}>{n}</span>
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-[11px] mt-3" style={{ color: "var(--muted)" }}>
            按内容生成渠道统计。各发布平台（知乎/百家号/抖音/视频号）的发布量需「发布登记」后才有数。
          </p>
        </div>
      </div>

      {/* 团队排行榜 + 内容表现 */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* 排行榜 */}
        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>🏆 团队排行榜（本周产出）</h3>
          <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            {data.leaderboard.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>暂无数据</p>
            ) : (
              <div className="space-y-2.5">
                {data.leaderboard.map((m, i) => (
                  <div key={m.name + i} className="flex items-center gap-3">
                    <span className="w-6 text-center text-sm">{medals[i] || `${i + 1}.`}</span>
                    <span className="flex-1 text-sm font-medium truncate" style={{ color: "var(--ink)" }}>{m.name}</span>
                    <span className="text-sm font-bold" style={{ color: "var(--brand)" }}>{m.count}</span>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>条</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 内容表现 */}
        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>📈 内容表现（本周）</h3>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="新增线索" value={data.performance.newLeads} icon="🎯" color="var(--green)" />
            <Stat
              label="转化率"
              value={data.performance.conversionRate != null ? `${data.performance.conversionRate}%` : 0}
              icon="💰"
              color="var(--amber)"
              pending={data.performance.conversionRate == null}
            />
            <Stat label="本周爆文" value={0} icon="🔥" color="var(--red)" pending />
            <Stat label="新增粉丝" value={0} icon="👥" color="var(--blue)" pending />
          </div>
        </div>
      </div>
    </div>
  );
}
