"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface UserUsage {
  userId: string;
  name: string;
  role: string;
  text: number;
  image: number;
  video: number;
  tokens: number;
  limits: { text: number; image: number; video: number };
}
interface RecentItem {
  id: string;
  user_name: string | null;
  topic: string;
  platform: string;
  content_type: string;
  output_text: string;
  created_at: string;
}
interface UsageResp {
  period: string;
  users: UserUsage[];
  recent: RecentItem[];
  totals: { text: number; image: number; video: number; tokens: number };
}

const ROLE_LABEL: Record<string, string> = {
  admin: "超管", lead: "负责人", operator: "运营", ai: "AI编辑", admission: "招生顾问",
};

const PERIODS: [string, string][] = [["today", "今日"], ["week", "近7天"], ["month", "本月"]];

export default function MonitorPage() {
  const [period, setPeriod] = useState("today");
  const [selected, setSelected] = useState<RecentItem | null>(null);

  const { data, isLoading, error } = useQuery<UsageResp>({
    queryKey: ["admin-usage", period],
    queryFn: async () => {
      const res = await fetch(`/api/admin/usage?period=${period}`);
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "加载失败");
      }
      return res.json();
    },
    refetchInterval: 30000,
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold m-0" style={{ color: "var(--ink)" }}>🖥️ 运营监控</h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            实时看每个员工今天生成了什么、用了多少额度
          </p>
        </div>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--surface-soft)" }}>
          {PERIODS.map(([p, label]) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-4 py-1.5 rounded-md text-sm font-medium border-none cursor-pointer transition-all"
              style={{
                background: period === p ? "var(--surface)" : "transparent",
                color: period === p ? "var(--brand)" : "var(--muted)",
                boxShadow: period === p ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl text-sm mb-4" style={{ background: "color-mix(in srgb, var(--red,#dc2626) 10%, transparent)", color: "var(--red,#dc2626)" }}>
          ⚠️ {(error as Error).message}
        </div>
      )}

      {/* Totals */}
      {data && (
        <div className="flex gap-3 mb-5 flex-wrap">
          {[
            { label: "文案", value: data.totals.text, icon: "📝" },
            { label: "配图", value: data.totals.image, icon: "🎨" },
            { label: "视频", value: data.totals.video, icon: "🎬" },
            { label: "Token", value: data.totals.tokens.toLocaleString(), icon: "🎯" },
            { label: "活跃员工", value: data.users.length, icon: "👥" },
          ].map((s) => (
            <div key={s.label} className="flex-1 min-w-[110px] rounded-xl px-4 py-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="text-xs mb-1" style={{ color: "var(--muted)" }}>{s.icon} {s.label}</div>
              <div className="text-lg font-bold" style={{ color: "var(--ink)" }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl" style={{ background: "var(--surface-soft)" }} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 员工用量表 */}
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="px-4 py-3 text-sm font-semibold" style={{ borderBottom: "1px solid var(--border)", color: "var(--ink)" }}>
              👥 员工用量
            </div>
            {data && data.users.length > 0 ? (
              <div className="flex flex-col">
                {data.users.map((u) => (
                  <div key={u.userId} className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>{u.name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--surface-soft)", color: "var(--muted)" }}>
                          {ROLE_LABEL[u.role] || u.role}
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>{u.tokens.toLocaleString()} tok</span>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <UsageStat label="文案" used={u.text} limit={u.limits.text} />
                      <UsageStat label="配图" used={u.image} limit={u.limits.image} />
                      <UsageStat label="视频" used={u.video} limit={u.limits.video} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm" style={{ color: "var(--muted)" }}>该时段暂无生成记录</div>
            )}
          </div>

          {/* 团队动态 */}
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="px-4 py-3 text-sm font-semibold" style={{ borderBottom: "1px solid var(--border)", color: "var(--ink)" }}>
              📋 团队动态（点击看内容）
            </div>
            {data && data.recent.length > 0 ? (
              <div className="flex flex-col max-h-[600px] overflow-auto">
                {data.recent.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className="px-4 py-2.5 text-left border-none cursor-pointer"
                    style={{ borderBottom: "1px solid var(--border)", background: "transparent" }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-medium whitespace-nowrap" style={{ color: "var(--brand)" }}>{r.user_name || "未知"}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded whitespace-nowrap" style={{ background: "var(--surface-soft)", color: "var(--muted)" }}>{r.platform}</span>
                        <span className="text-sm truncate" style={{ color: "var(--ink)" }}>{r.topic}</span>
                      </div>
                      <span className="text-xs whitespace-nowrap" style={{ color: "var(--muted)" }}>{formatTime(r.created_at)}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm" style={{ color: "var(--muted)" }}>该时段暂无动态</div>
            )}
          </div>
        </div>
      )}

      {/* 内容快照弹窗 */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="text-sm" style={{ color: "var(--ink)" }}>
                <span className="font-semibold">{selected.user_name}</span>
                <span className="mx-2" style={{ color: "var(--muted)" }}>·</span>
                {selected.platform} / {selected.content_type} · {selected.topic}
              </div>
              <button onClick={() => setSelected(null)} className="text-sm border-none cursor-pointer px-2" style={{ background: "transparent", color: "var(--muted)" }}>✕</button>
            </div>
            <pre className="p-5 text-sm whitespace-pre-wrap m-0 leading-relaxed" style={{ color: "var(--ink)", fontFamily: "inherit" }}>
              {selected.output_text}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function UsageStat({ label, used, limit }: { label: string; used: number; limit: number }) {
  const unlimited = limit < 0;
  const full = !unlimited && used >= limit;
  const danger = !unlimited && used / Math.max(1, limit) >= 0.8;
  const color = full ? "#dc2626" : danger ? "#f59e0b" : "var(--muted)";
  return (
    <span style={{ color }}>
      {label} <b style={{ color: full ? "#dc2626" : "var(--ink)" }}>{used}</b>
      <span style={{ color: "var(--muted)" }}>/{unlimited ? "∞" : limit}</span>
    </span>
  );
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60 * 1000) return "刚刚";
  if (diff < 3600 * 1000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400 * 1000) return `${Math.floor(diff / 3600000)}小时前`;
  return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}
