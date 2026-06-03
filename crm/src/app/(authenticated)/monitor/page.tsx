"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";

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
  const [mainTab, setMainTab] = useState<"monitor" | "content" | "quota" | "audit">("monitor");
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
    staleTime: 20000,
    placeholderData: keepPreviousData,
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold m-0" style={{ color: "var(--ink)" }}>🖥️ 运营监控</h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {mainTab === "monitor" ? "实时看每个员工今天生成了什么、用了多少额度" : mainTab === "content" ? "全员产出的所有内容（按人/平台筛选，点开看完整正文）" : mainTab === "quota" ? "设置每个员工每天的生成次数额度" : "查看全员私聊记录（合规审计）"}
          </p>
        </div>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--surface-soft)" }}>
          {([["monitor", "📊 监控"], ["content", "📚 全部内容"], ["quota", "⚙️ 配额管理"], ["audit", "💬 聊天审计"]] as const).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setMainTab(t)}
              className="px-4 py-1.5 rounded-md text-sm font-medium border-none cursor-pointer transition-all"
              style={{
                background: mainTab === t ? "var(--surface)" : "transparent",
                color: mainTab === t ? "var(--brand)" : "var(--muted)",
                boxShadow: mainTab === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {mainTab === "content" ? (
        <AllContent />
      ) : mainTab === "quota" ? (
        <QuotaManager />
      ) : mainTab === "audit" ? (
        <ChatAudit />
      ) : (
      <>
      {/* 时间范围 */}
      <div className="flex justify-end mb-4">
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
      </>
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

// ── 全部内容（全员产出）──
interface ContentItem {
  id: string;
  user_id: string;
  user_name: string | null;
  topic: string;
  platform: string;
  content_type: string;
  output_text: string;
  created_at: string;
}

const CONTENT_PLATFORMS = ["", "朋友圈", "小红书", "微信群", "家长私聊", "视频脚本", "FAQ"];

function AllContent() {
  const [filterUser, setFilterUser] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<ContentItem | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-content", filterUser, filterPlatform, q],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (filterUser) p.set("userId", filterUser);
      if (filterPlatform) p.set("platform", filterPlatform);
      if (q) p.set("q", q);
      const res = await fetch(`/api/admin/content?${p.toString()}`);
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "加载失败");
      }
      return res.json() as Promise<{ items: ContentItem[]; operators: { id: string; name: string }[] }>;
    },
    staleTime: 15000,
    placeholderData: keepPreviousData,
  });

  const items = data?.items || [];
  const operators = data?.operators || [];

  return (
    <div>
      {/* 筛选 */}
      <div className="rounded-xl p-3 mb-4 flex flex-wrap items-center gap-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="rounded-lg px-2 py-1.5 text-sm"
          style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }}
        >
          <option value="">全部成员</option>
          {operators.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        {CONTENT_PLATFORMS.map((p) => (
          <button
            key={p || "all"}
            onClick={() => setFilterPlatform(p)}
            className="rounded-full px-2.5 py-1 text-xs border cursor-pointer"
            style={filterPlatform === p
              ? { background: "var(--brand)", color: "#fff", borderColor: "var(--brand)" }
              : { background: "var(--surface)", color: "var(--muted)", borderColor: "var(--border)" }}
          >
            {p || "全部平台"}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") setQ(search.trim()); }}
          placeholder="搜索主题/正文，回车"
          className="flex-1 min-w-[160px] rounded-lg px-3 py-1.5 text-sm outline-none"
          style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }}
        />
        <span className="text-xs" style={{ color: "var(--muted)" }}>共 {items.length} 条</span>
      </div>

      {/* 列表 */}
      {isLoading ? (
        <p className="text-sm text-center py-10" style={{ color: "var(--muted)" }}>加载中…</p>
      ) : error ? (
        <p className="text-sm text-center py-10" style={{ color: "#dc2626" }}>{(error as Error).message}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-center py-10" style={{ color: "var(--muted)" }}>暂无内容</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-2">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => setSelected(it)}
              className="text-left rounded-xl p-3 border-none cursor-pointer"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="font-semibold" style={{ color: "var(--ink)" }}>👤 {it.user_name || "?"}</span>
                <span className="px-1.5 py-0.5 rounded" style={{ background: "var(--surface-soft)", color: "var(--brand)" }}>{it.platform}</span>
                <span style={{ color: "var(--muted)" }}>{it.content_type}</span>
                <span className="ml-auto" style={{ color: "var(--muted)" }}>{(it.created_at || "").slice(5, 16).replace("T", " ")}</span>
              </div>
              <div className="text-sm font-medium mt-1" style={{ color: "var(--ink)" }}>{it.topic}</div>
              <div className="text-xs mt-1 line-clamp-2" style={{ color: "var(--muted)" }}>{(it.output_text || "").slice(0, 90)}</div>
            </button>
          ))}
        </div>
      )}

      {/* 完整正文弹窗 */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setSelected(null)}>
          <div className="rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto" style={{ background: "var(--surface)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
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

// ── 配额管理 ──
interface QuotaUser {
  userId: string;
  name: string;
  role: string;
  team: string;
  isCustom: boolean;
  limits: { text: number; image: number; video: number };
}

function QuotaManager() {
  const qc = useQueryClient();
  const [edits, setEdits] = useState<Record<string, { text: number; image: number; video: number }>>({});

  const { data, isLoading, error } = useQuery<{ users: QuotaUser[] }>({
    queryKey: ["admin-quota"],
    queryFn: async () => {
      const res = await fetch("/api/admin/quota");
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "加载失败");
      }
      return res.json();
    },
  });

  const save = useMutation({
    mutationFn: async (payload: { userId: string; daily_text?: number; daily_image?: number; daily_video?: number; reset?: boolean }) => {
      const res = await fetch("/api/admin/quota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("保存失败");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-quota"] }),
  });

  if (isLoading) {
    return (
      <div className="animate-pulse flex flex-col gap-2">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 rounded-xl" style={{ background: "var(--surface-soft)" }} />)}
      </div>
    );
  }
  if (error) {
    return <div className="p-4 rounded-xl text-sm" style={{ background: "color-mix(in srgb, var(--red,#dc2626) 10%, transparent)", color: "var(--red,#dc2626)" }}>⚠️ {(error as Error).message}</div>;
  }

  const getVal = (u: QuotaUser, k: "text" | "image" | "video") => edits[u.userId]?.[k] ?? u.limits[k];
  const setVal = (u: QuotaUser, k: "text" | "image" | "video", v: number) =>
    setEdits((prev) => ({
      ...prev,
      [u.userId]: { text: getVal(u, "text"), image: getVal(u, "image"), video: getVal(u, "video"), [k]: v },
    }));

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="px-4 py-3 text-xs flex items-center gap-3" style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>
        <span className="flex-1 font-semibold" style={{ color: "var(--ink)" }}>👥 员工每日额度（次数，-1=不限）</span>
        <span className="w-16 text-center">文案</span>
        <span className="w-16 text-center">配图</span>
        <span className="w-16 text-center">视频</span>
        <span className="w-32" />
      </div>
      {(data?.users || []).map((u) => {
        const changed = !!edits[u.userId];
        return (
          <div key={u.userId} className="px-4 py-2.5 flex items-center gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>
                {u.name}
                {u.isCustom && <span className="text-xs ml-2 px-1.5 py-0.5 rounded" style={{ background: "var(--brand-light,#dbeafe)", color: "var(--brand)" }}>自定义</span>}
              </div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>{ROLE_LABEL[u.role] || u.role}{u.team ? ` · ${u.team}` : ""}</div>
            </div>
            {(["text", "image", "video"] as const).map((k) => (
              <input
                key={k}
                type="number"
                value={getVal(u, k)}
                onChange={(e) => setVal(u, k, parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1 rounded-lg text-sm text-center outline-none"
                style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }}
              />
            ))}
            <div className="w-32 flex gap-1.5 justify-end">
              <button
                onClick={() => save.mutate({ userId: u.userId, daily_text: getVal(u, "text"), daily_image: getVal(u, "image"), daily_video: getVal(u, "video") })}
                disabled={!changed || save.isPending}
                className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer font-medium"
                style={{ background: changed ? "var(--brand)" : "var(--surface-soft)", color: changed ? "#fff" : "var(--muted)", opacity: save.isPending ? 0.6 : 1 }}
              >
                保存
              </button>
              {u.isCustom && (
                <button
                  onClick={() => { setEdits((p) => { const n = { ...p }; delete n[u.userId]; return n; }); save.mutate({ userId: u.userId, reset: true }); }}
                  className="text-xs px-2 py-1.5 rounded-lg border-none cursor-pointer"
                  style={{ background: "var(--surface-soft)", color: "var(--muted)" }}
                  title="恢复角色默认"
                >
                  ↩
                </button>
              )}
            </div>
          </div>
        );
      })}
      {(!data?.users || data.users.length === 0) && (
        <div className="p-8 text-center text-sm" style={{ color: "var(--muted)" }}>暂无员工</div>
      )}
    </div>
  );
}

// ── 聊天审计 ──
interface AuditMsg {
  id: string;
  sender_name: string | null;
  recipient_name: string | null;
  body: string;
  created_at: string;
}
function ChatAudit() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useQuery<{ messages: AuditMsg[] }>({
    queryKey: ["admin-messages", search],
    queryFn: async () => {
      const res = await fetch(`/api/admin/messages?q=${encodeURIComponent(search)}`);
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "加载失败");
      }
      return res.json();
    },
    refetchInterval: 30000,
  });

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") setSearch(q); }}
          placeholder="搜索内容 / 姓名..."
          className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--ink)" }}
        />
        <button
          onClick={() => setSearch(q)}
          className="px-4 py-2 rounded-lg text-sm font-medium border-none cursor-pointer text-white"
          style={{ background: "var(--brand)" }}
        >
          搜索
        </button>
      </div>
      {error ? (
        <div className="p-4 rounded-xl text-sm" style={{ background: "color-mix(in srgb, var(--red,#dc2626) 10%, transparent)", color: "var(--red,#dc2626)" }}>⚠️ {(error as Error).message}</div>
      ) : isLoading ? (
        <div className="animate-pulse flex flex-col gap-2">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 rounded-lg" style={{ background: "var(--surface-soft)" }} />)}</div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          {(data?.messages || []).map((m) => (
            <div key={m.id} className="px-4 py-2.5 flex items-center gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
              <span className="text-xs whitespace-nowrap" style={{ color: "var(--brand)" }}>{m.sender_name || "?"}</span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>→</span>
              <span className="text-xs whitespace-nowrap" style={{ color: "var(--muted)" }}>{m.recipient_name || "?"}</span>
              <span className="text-sm flex-1 truncate" style={{ color: "var(--ink)" }}>{m.body}</span>
              <span className="text-xs whitespace-nowrap" style={{ color: "var(--muted)" }}>{formatTime(m.created_at)}</span>
            </div>
          ))}
          {(!data?.messages || data.messages.length === 0) && (
            <div className="p-8 text-center text-sm" style={{ color: "var(--muted)" }}>暂无聊天记录</div>
          )}
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
