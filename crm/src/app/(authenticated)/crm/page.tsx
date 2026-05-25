"use client";

import { CRM_STAGES } from "@/lib/constants";

export default function CrmPage() {
  return (
    <div className="max-w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
          招生 CRM
        </h2>
        <button
          className="px-4 py-2 rounded-lg text-white text-sm font-medium border-none cursor-pointer"
          style={{ background: "var(--brand)" }}
        >
          + 新增线索
        </button>
      </div>

      {/* Kanban columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {CRM_STAGES.filter((s) => s !== "已缴费" && s !== "已流失").map((stage) => (
          <div
            key={stage}
            className="min-w-[280px] flex-1 rounded-xl p-4"
            style={{
              background: "var(--surface-soft)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                {stage}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--brand-light)",
                  color: "var(--brand)",
                }}
              >
                0
              </span>
            </div>
            <p className="text-xs text-center py-8" style={{ color: "var(--muted)" }}>
              暂无线索
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
