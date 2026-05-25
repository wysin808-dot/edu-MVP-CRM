"use client";

export default function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-lg font-bold mb-6" style={{ color: "var(--ink)" }}>
        数据复盘
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Performance */}
        <div
          className="rounded-xl p-6"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--ink)" }}>
            平台线索表现
          </h3>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            数据库连接后将显示各平台线索数据...
          </p>
        </div>

        {/* Enrollment Funnel */}
        <div
          className="rounded-xl p-6"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--ink)" }}>
            招生漏斗
          </h3>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            数据库连接后将显示招生漏斗图...
          </p>
        </div>

        {/* WACE Tracker */}
        <div
          className="rounded-xl p-6 lg:col-span-2"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--ink)" }}>
            WACE 周报追踪
          </h3>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            数据库连接后将显示 WACE 内容周度统计...
          </p>
        </div>
      </div>
    </div>
  );
}
