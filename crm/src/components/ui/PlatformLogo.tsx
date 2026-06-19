"use client";

import { useState } from "react";

// 平台图标：有官方 logo 就显示图片，加载失败/无 logo 则回退 emoji（永不显示破图）
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
  const [failed, setFailed] = useState(false);

  if (logoUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={label || ""}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        style={{ display: "inline-block", verticalAlign: "middle", objectFit: "contain" }}
      />
    );
  }
  return <span style={{ fontSize: size, lineHeight: 1 }}>{icon || "📱"}</span>;
}
