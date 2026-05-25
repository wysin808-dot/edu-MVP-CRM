"use client";

import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
  hoverable?: boolean;
}

export default function Card({
  children,
  className = "",
  padding = "md",
  onClick,
  hoverable = false,
}: CardProps) {
  const paddingMap = { none: "0", sm: "12px", md: "20px", lg: "24px" };

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: paddingMap[padding],
        boxShadow: "var(--shadow)",
        cursor: onClick || hoverable ? "pointer" : "default",
        transition: "box-shadow 0.15s, border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.borderColor = "var(--brand)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.boxShadow = "var(--shadow)";
        }
      }}
    >
      {children}
    </div>
  );
}
