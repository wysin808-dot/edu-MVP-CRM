"use client";

export default function AiPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
          AI 内容库
        </h2>
        <button
          className="px-4 py-2 rounded-lg text-white text-sm font-medium border-none cursor-pointer"
          style={{ background: "var(--brand)" }}
        >
          + 新建 Prompt
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
          数据库连接后将显示 Prompt 模板库和内容生成器...
        </p>
      </div>
    </div>
  );
}
