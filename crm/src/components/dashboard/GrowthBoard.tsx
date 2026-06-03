"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface GrowthData {
  role: string;
  scope: "team" | "self";
  period: string;
  stats: { content: number; videoScripts: number; videos: number; leads: number; wechat: number | null };
  byChannel: Record<string, number>;
  total: number;
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

const PERIODS: { key: string; label: string }[] = [
  { key: "day", label: "日" },
  { key: "week", label: "周" },
  { key: "month", label: "月" },
  { key: "year", label: "年" },
];

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
  const [period, setPeriod] = useState("week");

  const { data, isLoading } = useQuery({
    queryKey: ["growth-board", period],
    refetchInterval: 120000,
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/growth?period=${period}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "加载失败");
      return json as GrowthData;
    },
  });

  const periodLabel = PERIODS.find((p) => p.key === period)?.label || "周";
  // 周期前缀文案：日→今日，其余→本周/本月/本年
  const windowLabel = period === "day" ? "今日" : `本${periodLabel}`;
  const scopeLabel = data?.scope === "self" ? "我的" : "团队";

  const channels = data ? Object.entries(data.byChannel).sort((a, b) => b[1] - a[1]) : [];
  const maxCh = channels.length ? channels[0][1] : 1;
  const medals = ["🥇", "🥈", "🥉"];
  const showLeaderboard = data?.scope === "team";

  return (
    <div className="space-y-6 mb-6">
      {/* 标题 + 周期切换 */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
          📊 {scopeLabel}数据 · {windowLabel}
        </h3>
        <div className="flex gap-1 rounded-lg p-0.5" style={{ background: "var(--surface-soft)" }}>
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className="px-3 py-1 text-xs rounded-md transition-all"
              style={
                period === p.key
                  ? { background: "var(--brand)", color: "#fff", fontWeight: 600 }
                  : { background: "transparent", color: "var(--muted)" }
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading || !data ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: "var(--surface-soft)" }} />
          ))}
        </div>
      ) : (
        <>
          {/* 数据卡 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="新增内容" value={data.stats.content} icon="📝" color="var(--brand)" />
            <Stat label="视频脚本" value={data.stats.videoScripts} icon="🎬" color="#db2777" />
            <Stat label="新增询盘" value={data.stats.leads} icon="🎯" color="var(--green)" />
            <Stat label="新增微信" value={0} icon="💬" color="var(--blue)" pending />
          </div>

          {/* 生产渠道分布 */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--ink)" }}>
              📅 {windowLabel}生产
              <span className="text-xs font-normal" style={{ color: "var(--muted)" }}>共 {data.total} 条</span>
            </h3>
            <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              {channels.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>{windowLabel}还没有内容产出</p>
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
            </div>
          </div>

          {/* 排行榜（仅管理者） + 内容表现 */}
          <div className={`grid gap-4 ${showLeaderboard ? "lg:grid-cols-2" : ""}`}>
            {showLeaderboard && (
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>🏆 团队排行榜（{windowLabel}产出）</h3>
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
            )}

            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>📈 {scopeLabel}内容表现（{windowLabel}）</h3>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="新增线索" value={data.performance.newLeads} icon="🎯" color="var(--green)" />
                <Stat
                  label="转化率"
                  value={data.performance.conversionRate != null ? `${data.performance.conversionRate}%` : 0}
                  icon="💰"
                  color="var(--amber)"
                  pending={data.performance.conversionRate == null}
                />
                <Stat label="爆文" value={0} icon="🔥" color="var(--red)" pending />
                <Stat label="新增粉丝" value={0} icon="👥" color="var(--blue)" pending />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
