"use client";

import { type ReactNode } from "react";

export interface KanbanColumn<T> {
  id: string;
  title: string;
  items: T[];
  color?: string;
}

interface KanbanBoardProps<T> {
  columns: KanbanColumn<T>[];
  renderCard: (item: T) => ReactNode;
  itemKey: (item: T) => string;
  onMoveItem?: (itemId: string, fromColumn: string, toColumn: string) => void;
}

export default function KanbanBoard<T>({
  columns,
  renderCard,
  itemKey,
}: KanbanBoardProps<T>) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => (
        <div
          key={col.id}
          className="min-w-[280px] flex-1 flex flex-col rounded-xl"
          style={{
            background: "var(--surface-soft)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Column header */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              {col.color && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: col.color }}
                />
              )}
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--ink)" }}
              >
                {col.title}
              </span>
            </div>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "var(--brand-light)",
                color: "var(--brand)",
              }}
            >
              {col.items.length}
            </span>
          </div>

          {/* Cards */}
          <div className="flex-1 px-3 pb-3 flex flex-col gap-2 min-h-[100px]">
            {col.items.length === 0 ? (
              <div
                className="text-xs text-center py-6"
                style={{ color: "var(--muted)" }}
              >
                暂无项目
              </div>
            ) : (
              col.items.map((item) => (
                <div key={itemKey(item)}>{renderCard(item)}</div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
