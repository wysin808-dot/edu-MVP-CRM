"use client";

import { use } from "react";

export default function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="max-w-4xl mx-auto">
      <div
        className="rounded-xl p-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--ink)" }}>
          内容详情
        </h2>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          内容 ID: {id}
        </p>
        <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
          数据库连接后将显示完整内容详情、审核面板、评论和复用链...
        </p>
      </div>
    </div>
  );
}
