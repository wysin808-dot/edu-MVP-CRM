"use client";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: { value: number; label: string };
}

export default function StatsCard({
  label,
  value,
  icon,
  color,
  trend,
}: StatsCardProps) {
  return (
    <div
      className="rounded-xl p-4 flex items-center gap-3"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
        style={{ background: `${color}18` }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div
          className="text-2xl font-bold leading-tight"
          style={{ color: "var(--ink)" }}
        >
          {value}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {label}
          </span>
          {trend && (
            <span
              className="text-[10px] font-medium"
              style={{
                color: trend.value >= 0 ? "var(--green)" : "var(--red)",
              }}
            >
              {trend.value >= 0 ? "+" : ""}
              {trend.value}% {trend.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
