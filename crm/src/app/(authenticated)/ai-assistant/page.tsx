"use client";

import { useEffect, useState } from "react";

type HotQuestion = {
  question: string;
  count: number;
};

type AssistantStats = {
  todayPeople: number;
  totalChats: number;
  hotQuestions: HotQuestion[];
  wechatClicks: number;
};

export default function AiAssistantStatsPage() {
  const [stats, setStats] = useState<AssistantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const response = await fetch("/api/ai-assistant/stats");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "加载失败");
        }

        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "加载失败");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h2 className="m-0 text-xl font-bold" style={{ color: "var(--ink)" }}>
          AI升学助手
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          查看官网 AI 咨询、热门问题和微信引流数据
        </p>
      </div>

      {loading ? (
        <div className="rounded-lg bg-white p-8 text-center text-sm text-slate-500">
          正在加载统计...
        </div>
      ) : error ? (
        <div className="rounded-lg bg-white p-8 text-center text-sm text-red-600">
          {error}
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="今日咨询人数" value={stats?.todayPeople || 0} />
            <MetricCard label="总咨询次数" value={stats?.totalChats || 0} />
            <MetricCard label="热门问题数量" value={stats?.hotQuestions.length || 0} />
            <MetricCard label="微信按钮点击次数" value={stats?.wechatClicks || 0} />
          </div>

          <section
            className="rounded-lg bg-white p-6"
            style={{ border: "1px solid var(--border)" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="m-0 text-sm font-semibold" style={{ color: "var(--ink)" }}>
                热门问题 TOP10
              </h3>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                按相同问题出现次数统计
              </span>
            </div>

            {stats?.hotQuestions.length ? (
              <div className="overflow-hidden rounded-lg" style={{ border: "1px solid var(--border)" }}>
                <table className="w-full border-collapse text-left text-sm">
                  <thead style={{ background: "var(--surface-soft)", color: "var(--muted)" }}>
                    <tr>
                      <th className="w-16 px-4 py-3 font-medium">排名</th>
                      <th className="px-4 py-3 font-medium">问题</th>
                      <th className="w-24 px-4 py-3 text-right font-medium">次数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.hotQuestions.map((item, index) => (
                      <tr key={item.question} style={{ borderTop: "1px solid var(--border)" }}>
                        <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                        <td className="px-4 py-3" style={{ color: "var(--ink)" }}>
                          {item.question}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold" style={{ color: "#b91c1c" }}>
                          {item.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-lg py-10 text-center text-sm" style={{ background: "var(--surface-soft)", color: "var(--muted)" }}>
                暂无咨询记录
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-lg bg-white p-5"
      style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}
    >
      <div className="text-xs" style={{ color: "var(--muted)" }}>
        {label}
      </div>
      <div className="mt-3 text-3xl font-bold" style={{ color: "var(--ink)" }}>
        {value}
      </div>
    </div>
  );
}
