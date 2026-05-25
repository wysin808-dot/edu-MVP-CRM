"use client";

export default function PublishingPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
          今日发布
        </h2>
        <div className="text-sm" style={{ color: "var(--muted)" }}>
          完成度: --/--
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
          数据库连接后将显示今日发布任务列表...
        </p>
      </div>
    </div>
  );
}
