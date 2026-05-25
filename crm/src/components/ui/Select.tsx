"use client";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  label?: string;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
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
        onChange={onChange}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
        style={{
          background: "var(--surface-soft)",
          border: "1px solid var(--border)",
          color: "var(--ink)",
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default Select;
