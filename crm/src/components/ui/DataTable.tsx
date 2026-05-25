"use client";

import { type ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export default function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  emptyMessage = "暂无数据",
}: DataTableProps<T>) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <table className="w-full" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr
            style={{
              background: "var(--surface-soft)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left text-xs font-semibold px-4 py-3"
                style={{
                  color: "var(--muted)",
                  width: col.width,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-8 text-sm"
                style={{ color: "var(--muted)" }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={rowKey(item)}
                onClick={() => onRowClick?.(item)}
                className="transition-colors"
                style={{
                  borderBottom: "1px solid var(--border)",
                  cursor: onRowClick ? "pointer" : "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface-soft)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "";
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-sm"
                    style={{ color: "var(--ink)" }}
                  >
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
