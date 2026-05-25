"use client";

import { useAuth } from "@/components/providers/AuthProvider";

export default function DashboardPage() {
  const { profile, role, loading } = useAuth();

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="mb-6">
        <h2 className="text-xl font-bold m-0" style={{ color: "var(--ink)" }}>
          你好, {profile?.display_name || "用户"} 👋
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          以下是你今天的工作概览
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard label="今日待发" value="--" icon="📤" color="var(--brand)" />
        <StatsCard label="待审核" value="--" icon="📋" color="var(--amber)" />
        <StatsCard label="本周线索" value="--" icon="🎯" color="var(--green)" />
        <StatsCard label="内容总量" value="--" icon="📝" color="var(--blue)" />
      </div>

      {/* Priority Queue placeholder */}
      <div
        className="rounded-xl p-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--ink)" }}>
          优先待办
        </h3>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          数据库连接后将显示待处理事项...
        </p>
      </div>
    </div>
  );
}

function StatsCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-4 flex items-center gap-3"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
        style={{ background: `${color}15` }}
      >
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color: "var(--ink)" }}>
          {value}
        </div>
        <div className="text-xs" style={{ color: "var(--muted)" }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="h-8 w-48 rounded mb-2" style={{ background: "var(--surface-soft)" }} />
      <div className="h-4 w-64 rounded mb-6" style={{ background: "var(--surface-soft)" }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 rounded-xl"
            style={{ background: "var(--surface-soft)" }}
          />
        ))}
      </div>
      <div className="h-48 rounded-xl" style={{ background: "var(--surface-soft)" }} />
    </div>
  );
}
