"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "muted";
  size?: "sm" | "md";
}

const variantColors: Record<string, { bg: string; fg: string }> = {
  default: { bg: "var(--brand-light)", fg: "var(--brand)" },
  success: { bg: "#dcfce7", fg: "var(--green)" },
  warning: { bg: "#fef3c7", fg: "var(--amber)" },
  danger: { bg: "#fee2e2", fg: "var(--red)" },
  info: { bg: "#dbeafe", fg: "var(--blue)" },
  muted: { bg: "var(--surface-soft)", fg: "var(--muted)" },
};

export default function Badge({
  children,
  variant = "default",
  size = "sm",
}: BadgeProps) {
  const colors = variantColors[variant] || variantColors.default;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: size === "sm" ? "2px 8px" : "4px 12px",
        borderRadius: "12px",
        fontSize: size === "sm" ? "11px" : "12px",
        fontWeight: 500,
        background: colors.bg,
        color: colors.fg,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

// Mapping content status to badge variant
export function statusVariant(
  status: string
): "default" | "success" | "warning" | "danger" | "info" | "muted" {
  switch (status) {
    case "草稿":
      return "muted";
    case "待审核":
      return "warning";
    case "审核中":
      return "info";
    case "已通过":
      return "success";
    case "已发布":
      return "success";
    case "已归档":
      return "muted";
    default:
      return "default";
  }
}
