"use client";

import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    const baseStyle: React.CSSProperties = {
      borderRadius: "var(--radius)",
      fontWeight: 500,
      cursor: props.disabled ? "not-allowed" : "pointer",
      transition: "all 0.15s",
      border: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      opacity: props.disabled ? 0.5 : 1,
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: "var(--brand)",
        color: "#fff",
      },
      secondary: {
        background: "var(--surface-soft)",
        color: "var(--ink)",
        border: "1px solid var(--border)",
      },
      ghost: {
        background: "transparent",
        color: "var(--ink)",
      },
      danger: {
        background: "var(--red)",
        color: "#fff",
      },
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: { padding: "4px 10px", fontSize: "12px" },
      md: { padding: "8px 16px", fontSize: "13px" },
      lg: { padding: "10px 20px", fontSize: "14px" },
    };

    return (
      <button
        ref={ref}
        className={cn(className)}
        style={{
          ...baseStyle,
          ...variantStyles[variant],
          ...sizeStyles[size],
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
