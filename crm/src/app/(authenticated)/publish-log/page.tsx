"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useContentList } from "@/hooks/useContents";
import { useAccountList } from "@/hooks/useAccounts";
import { usePlatforms } from "@/hooks/usePlatforms";
import { PlatformLogo } from "@/components/ui/PlatformLogo";
import { Select } from "@/components/ui/Select";
import { localDateStr } from "@/lib/utils";

const TIME_OPTIONS = [
  { value: "all", label: "全部时间" },
  { value: "month", label: "本月" },
  { value: "30d", label: "近 30 天" },
  { value: "7d", label: "近 7 天" },
];

export default function PublishLogPage() {
  const { role, user, profile } = useAuth();
  const isAdmin = role === "admin";
  const isLead = role === "lead";
  const isOperatorLike = role === "operator" || role === "ai";

  const platforms = usePlatforms().data ?? [];
  const platformInfo = (id: string) => platforms.find((p) => p.id === id);

  // 负责人按名下账号收口；运营按作者收口；管理员全部
  const { data: myAccounts } = useAccountList(isLead ? { ownerId: user?.id } : undefined);
  const accountIds = isLead ? (myAccounts ? myAccounts.map((a) => a.id) : undefined) : undefined;
  const authorName = isOperatorLike ? (profile?.display_name || undefined) : undefined;

  const { data: published, isLoading } = useContentList({ status: "已发布", accountIds, authorName });

  const [platformFilter, setPlatformFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [search, setSearch] = useState("");

  const scopeLabel = isAdmin ? "全公司" : isLead ? "本部门" : "我的";

  const monthStart = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    return localDateStr(d);
  }, []);

  const startStr = useMemo(() => {
    const d = new Date();
    if (timeFilter === "month") return monthStart;
    if (timeFilter === "7d") { d.setDate(d.getDate() - 7); return localDateStr(d); }
    if (timeFilter === "30d") { d.setDate(d.getDate() - 30); return localDateStr(d); }
    return null;
  }, [timeFilter, monthStart]);

  const all = useMemo(() => (published || []).filter((c) => c.publish_date), [published]);

  const rows = useMemo(() => {
    let list = all;
    if (platformFilter) list = list.filter((c) => c.platform === platformFilter);
    if (startStr) list = list.filter((c) => (c.publish_date || "") >= startStr);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => (c.title || "").toLowerCase().includes(q) || (c.account?.account_name || "").toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => (b.publish_date || "").localeCompare(a.publish_date || ""));
  }, [all, platformFilter, startStr, search]);

  const monthCount = useMemo(() => all.filter((c) => (c.publish_date || "") >= monthStart).length, [all, monthStart]);
  const byPlatform = useMemo(() => {
    const m: Record<string, number> = {};
    rows.forEach((c) => { m[c.platform] = (m[c.platform] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [rows]);

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-lg font-bold m-0" style={{ color: "var(--ink)" }}>📋 发布记录</h2>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "var(--surface-soft)", color: "var(--muted)" }}>{scopeLabel}</span>
      </div>
      <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>所有已发布内容的发布记录{isAdmin ? "（全部平台、全部时间）" : ""}</p>

      {/* 汇总 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard label="已发布总数" value={String(all.length)} />
        <StatCard label="本月发布" value={String(monthCount)} />
        <StatCard label="当前筛选结果" value={String(rows.length)} />
      </div>

      {/* 平台分布（当前筛选） */}
      {byPlatform.length > 0 && (
        <div className="rounded-xl p-4 mb-4 flex flex-wrap gap-2 items-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <span className="text-xs mr-1" style={{ color: "var(--muted)" }}>平台分布:</span>
          {byPlatform.map(([pid, n]) => {
            const p = platformInfo(pid);
            return (
              <span key={pid} className="inline-flex items-center gap-1.5 text-sm px-2 py-0.5 rounded-full" style={{ background: "var(--surface-soft)" }}>
                <PlatformLogo icon={p?.icon} logoUrl={p?.logo_url} label={p?.label || pid} size={14} />
                {p?.label || pid} <span style={{ color: "var(--brand)" }}>{n}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* 筛选 */}
      <div className="flex gap-3 mb-4 items-end flex-wrap">
        <Select label="" value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}
          options={[{ value: "", label: "全部平台" }, ...platforms.map((p) => ({ value: p.id, label: p.label }))]} />
        <Select label="" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} options={TIME_OPTIONS} />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 搜索标题 / 账号"
          className="px-3 py-2 rounded-lg text-sm outline-none flex-1 min-w-[200px]"
          style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
      </div>

      {/* 表格 */}
      {rows.length > 0 ? (
        <div className="rounded-xl overflow-x-auto" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["发布日期", "平台", "标题", "账号", "运营/作者", "类型"].map((h) => (
                  <th key={h} className="text-left text-xs font-medium px-4 py-3 whitespace-nowrap" style={{ color: "var(--muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const p = platformInfo(c.platform);
                return (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: "var(--ink)" }}>{c.publish_date}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
                        <PlatformLogo icon={p?.icon} logoUrl={p?.logo_url} label={p?.label || c.platform} size={16} />{p?.label || c.platform}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm max-w-[280px] truncate" style={{ color: "var(--ink)" }} title={c.title}>{c.title}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: "var(--muted)" }}>{c.account?.account_name || "-"}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: "var(--muted)" }}>{c.author_name || "-"}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: "var(--muted)" }}>{c.content_type || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl p-12 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {all.length === 0 ? "还没有已发布的内容" : "当前筛选没有结果"}
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: "var(--ink)" }}>{value}</p>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="h-6 w-32 rounded mb-2" style={{ background: "var(--surface-soft)" }} />
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl" style={{ background: "var(--surface-soft)" }} />)}
      </div>
      <div className="h-64 rounded-xl" style={{ background: "var(--surface-soft)" }} />
    </div>
  );
}
