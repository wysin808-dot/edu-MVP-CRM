"use client";

export default function KnowledgePage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
          真实资料库
        </h2>
        <button
          className="px-4 py-2 rounded-lg text-white text-sm font-medium border-none cursor-pointer"
          style={{ background: "var(--brand)" }}
        >
          + 新增资料
        </button>
      </div>
      <div
        className="rounded-xl p-8 text-center"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          数据库连接后将显示资料库列表...
        </p>
      </div>
    </div>
  );
}
