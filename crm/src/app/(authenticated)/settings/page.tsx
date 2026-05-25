"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { ROLE_CONFIG } from "@/lib/constants";

export default function SettingsPage() {
  const { role } = useAuth();

  if (role !== "admin" && role !== "lead") {
    return (
      <div className="max-w-4xl mx-auto">
        <div
          className="rounded-xl p-8 text-center"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            你没有权限访问此页面。请联系管理员。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-lg font-bold mb-6" style={{ color: "var(--ink)" }}>
        系统设置
      </h2>

      {/* Team Members */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--ink)" }}>
          团队成员
        </h3>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          数据库连接后将显示团队成员列表和角色管理...
        </p>
      </div>

      {/* Role Overview */}
      <div
        className="rounded-xl p-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--ink)" }}>
          角色说明
        </h3>
        <div className="grid gap-3">
          {Object.entries(ROLE_CONFIG).map(([key, config]) => (
            <div
              key={key}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ background: "var(--surface-soft)" }}
            >
              <span
                className="text-xs font-mono px-2 py-0.5 rounded"
                style={{
                  background: "var(--brand-light)",
                  color: "var(--brand)",
                }}
              >
                {key}
              </span>
              <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                {config.title}
              </span>
              <span className="text-xs flex-1" style={{ color: "var(--muted)" }}>
                {config.summary}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
