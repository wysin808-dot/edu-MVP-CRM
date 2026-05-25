"use client";

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[] | string[];
  placeholder?: string;
  label?: string;
  className?: string;
}

export default function Select({
  value,
  onChange,
  options,
  placeholder,
  label,
  className = "",
}: SelectProps) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <span
          className="text-xs font-medium"
          style={{ color: "var(--muted)" }}
        >
          {label}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
        style={{
          background: "var(--surface-soft)",
          border: "1px solid var(--border)",
          color: "var(--ink)",
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
