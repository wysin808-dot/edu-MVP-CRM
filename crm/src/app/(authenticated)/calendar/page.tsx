"use client";

import { useState, useMemo } from "react";
import { useContentList } from "@/hooks/useContents";
import { PLATFORMS } from "@/lib/constants";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { localDateStr, DAY_NAMES, getWeekStart, getWeekDates } from "@/lib/utils";

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: contents, isLoading } = useContentList();

  // Month navigation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const navigateMonth = (delta: number) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + delta);
    setCurrentDate(d);
  };

  const navigateWeek = (delta: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7 * delta);
    setCurrentDate(d);
  };

  const goToday = () => setCurrentDate(new Date());

  // Generate month grid
  const monthDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7; // Monday = 0
    const days: (Date | null)[] = [];

    // Padding for days before the 1st
    for (let i = 0; i < startOffset; i++) days.push(null);
    // Actual days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    // Pad to complete the last week
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [year, month]);

  // Week dates
  const weekMonday = getWeekStart(currentDate);
  const weekDates = getWeekDates(weekMonday);

  // Content lookup by date
  const contentsByDate = useMemo(() => {
    const map: Record<string, typeof contents> = {};
    contents?.forEach((c) => {
      if (c.publish_date) {
        if (!map[c.publish_date]) map[c.publish_date] = [];
        map[c.publish_date]!.push(c);
      }
    });
    return map;
  }, [contents]);

  const todayStr = localDateStr(new Date());
  const getPlatformInfo = (id: string) => PLATFORMS.find((p) => p.id === id);

  const monthNames = [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月",
  ];

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold m-0" style={{ color: "var(--ink)" }}>内容日历</h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {viewMode === "month"
              ? `${year}年${monthNames[month]}`
              : `${localDateStr(weekDates[0])} ~ ${localDateStr(weekDates[6])}`
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button onClick={() => viewMode === "month" ? navigateMonth(-1) : navigateWeek(-1)}
              className="w-8 h-8 rounded-lg border-none cursor-pointer flex items-center justify-center"
              style={{ background: "var(--surface-soft)", color: "var(--ink)" }}>
              ←
            </button>
            <button onClick={goToday}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border-none cursor-pointer"
              style={{ background: "var(--surface-soft)", color: "var(--brand)" }}>
              今天
            </button>
            <button onClick={() => viewMode === "month" ? navigateMonth(1) : navigateWeek(1)}
              className="w-8 h-8 rounded-lg border-none cursor-pointer flex items-center justify-center"
              style={{ background: "var(--surface-soft)", color: "var(--ink)" }}>
              →
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: "var(--surface-soft)" }}>
            <button onClick={() => setViewMode("month")}
              className="px-3 py-1.5 rounded-md text-xs font-medium border-none cursor-pointer transition-colors"
              style={{
                background: viewMode === "month" ? "var(--surface)" : "transparent",
                color: viewMode === "month" ? "var(--brand)" : "var(--muted)",
                boxShadow: viewMode === "month" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}>
              月视图
            </button>
            <button onClick={() => setViewMode("week")}
              className="px-3 py-1.5 rounded-md text-xs font-medium border-none cursor-pointer transition-colors"
              style={{
                background: viewMode === "week" ? "var(--surface)" : "transparent",
                color: viewMode === "week" ? "var(--brand)" : "var(--muted)",
                boxShadow: viewMode === "week" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}>
              周视图
            </button>
          </div>
        </div>
      </div>

      {viewMode === "month" ? (
        /* ── Month View ── */
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          {/* Day Headers */}
          <div className="grid grid-cols-7" style={{ borderBottom: "1px solid var(--border)" }}>
            {["周一", "周二", "周三", "周四", "周五", "周六", "周日"].map((day) => (
              <div key={day} className="text-center text-xs font-medium py-2" style={{ color: "var(--muted)" }}>
                {day}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7">
            {monthDays.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} className="min-h-[100px] p-1" style={{ background: "var(--surface-soft)", borderBottom: "1px solid var(--border)", borderRight: idx % 7 !== 6 ? "1px solid var(--border)" : "none" }} />;
              }
              const dateStr = localDateStr(date);
              const dayContents = contentsByDate[dateStr] || [];
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={dateStr}
                  className="min-h-[100px] p-1"
                  style={{
                    borderBottom: "1px solid var(--border)",
                    borderRight: idx % 7 !== 6 ? "1px solid var(--border)" : "none",
                    background: isToday ? "var(--brand-light)" : "transparent",
                  }}
                >
                  {/* Day Number */}
                  <div className="flex items-center justify-between mb-0.5 px-1">
                    <span className="text-xs font-medium" style={{
                      color: isToday ? "var(--brand)" : "var(--ink)",
                      fontWeight: isToday ? 700 : 500,
                    }}>
                      {date.getDate()}
                    </span>
                    {dayContents.length > 0 && (
                      <span className="text-xs px-1.5 py-0 rounded-full" style={{ background: "var(--brand)", color: "#fff", fontSize: "10px" }}>
                        {dayContents.length}
                      </span>
                    )}
                  </div>

                  {/* Content Dots */}
                  <div className="flex flex-col gap-0.5">
                    {dayContents.slice(0, 3).map((c) => {
                      const p = getPlatformInfo(c.platform);
                      return (
                        <div key={c.id} className="text-xs truncate px-1 py-0.5 rounded"
                          style={{ background: "var(--surface-soft)", color: "var(--muted)", fontSize: "10px" }}
                          title={c.title}>
                          {p?.icon} {c.title.slice(0, 8)}
                        </div>
                      );
                    })}
                    {dayContents.length > 3 && (
                      <div className="text-xs px-1" style={{ color: "var(--muted)", fontSize: "10px" }}>
                        +{dayContents.length - 3} 更多
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── Week View ── */
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="grid grid-cols-7">
            {weekDates.map((date, idx) => {
              const dateStr = localDateStr(date);
              const dayContents = contentsByDate[dateStr] || [];
              const isToday = dateStr === todayStr;

              return (
                <div key={dateStr} style={{
                  borderRight: idx < 6 ? "1px solid var(--border)" : "none",
                  background: isToday ? "var(--brand-light)" : "transparent",
                }}>
                  {/* Day Header */}
                  <div className="text-center py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      {DAY_NAMES[date.getDay()]}
                    </div>
                    <div className="text-lg font-bold" style={{
                      color: isToday ? "var(--brand)" : "var(--ink)",
                    }}>
                      {date.getDate()}
                    </div>
                  </div>

                  {/* Content Cards */}
                  <div className="p-2 min-h-[400px] flex flex-col gap-2">
                    {dayContents.map((c) => {
                      const p = getPlatformInfo(c.platform);
                      return (
                        <div key={c.id} className="rounded-lg p-2" style={{ background: "var(--surface-soft)", border: "1px solid var(--border)" }}>
                          <div className="text-xs mb-1" style={{ color: "var(--muted)" }}>
                            {p ? `${p.icon} ${p.label}` : c.platform}
                          </div>
                          <div className="text-xs font-medium truncate" style={{ color: "var(--ink)" }} title={c.title}>
                            {c.title}
                          </div>
                          <div className="mt-1">
                            <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                          </div>
                        </div>
                      );
                    })}
                    {dayContents.length === 0 && (
                      <div className="flex-1 flex items-center justify-center">
                        <span className="text-xs" style={{ color: "var(--muted)", opacity: 0.5 }}>无排期</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 w-24 rounded" style={{ background: "var(--surface-soft)" }} />
          <div className="h-4 w-32 rounded mt-2" style={{ background: "var(--surface-soft)" }} />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-32 rounded-lg" style={{ background: "var(--surface-soft)" }} />
          <div className="h-8 w-32 rounded-lg" style={{ background: "var(--surface-soft)" }} />
        </div>
      </div>
      <div className="h-[500px] rounded-xl" style={{ background: "var(--surface-soft)" }} />
    </div>
  );
}
