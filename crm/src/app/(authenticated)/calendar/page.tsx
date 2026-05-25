"use client";

import { useState } from "react";

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
          内容日历
        </h2>
        <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: "var(--surface-soft)" }}>
          <button
            onClick={() => setViewMode("month")}
            className="px-3 py-1.5 rounded-md text-xs font-medium border-none cursor-pointer transition-colors"
            style={{
              background: viewMode === "month" ? "var(--surface)" : "transparent",
              color: viewMode === "month" ? "var(--brand)" : "var(--muted)",
              boxShadow: viewMode === "month" ? "var(--shadow)" : "none",
            }}
          >
            月视图
          </button>
          <button
            onClick={() => setViewMode("week")}
            className="px-3 py-1.5 rounded-md text-xs font-medium border-none cursor-pointer transition-colors"
            style={{
              background: viewMode === "week" ? "var(--surface)" : "transparent",
              color: viewMode === "week" ? "var(--brand)" : "var(--muted)",
              boxShadow: viewMode === "week" ? "var(--shadow)" : "none",
            }}
          >
            周视图
          </button>
        </div>
      </div>
      <div
        className="rounded-xl p-8 text-center"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {viewMode === "month" ? "月视图日历" : "周视图日历"} — 数据库连接后将显示内容排期...
        </p>
      </div>
    </div>
  );
}
