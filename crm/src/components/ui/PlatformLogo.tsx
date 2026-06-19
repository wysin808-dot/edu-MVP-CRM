"use client";

// 平台图标：有官方 logo 就显示图片，否则回退 emoji
export function PlatformLogo({
  icon,
  logoUrl,
  label,
  size = 18,
}: {
  icon?: string | null;
  logoUrl?: string | null;
  label?: string | null;
  size?: number;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={label || ""}
        width={size}
        height={size}
        style={{ display: "inline-block", verticalAlign: "middle", objectFit: "contain" }}
      />
    );
  }
  return <span style={{ fontSize: size }}>{icon || "📱"}</span>;
}
