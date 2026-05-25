"use client";

export default function ContentPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
          内容资产库
        </h2>
        <button
          className="px-4 py-2 rounded-lg text-white text-sm font-medium border-none cursor-pointer"
          style={{ background: "var(--brand)" }}
        >
          + 新建内容
        </button>
      </div>

      {/* Filter bar placeholder */}
      <div
        className="flex gap-3 mb-4 p-3 rounded-lg"
        style={{ background: "var(--surface-soft)" }}
      >
        <span className="text-sm" style={{ color: "var(--muted)" }}>
          筛选: 全部平台 / 全部状态 / 全部主题
        </span>
      </div>

      {/* Content grid placeholder */}
      <div
        className="rounded-xl p-8 text-center"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          数据库连接后将显示内容卡片...
        </p>
      </div>
    </div>
  );
}
