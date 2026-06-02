"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// 选题中心已合并进「内容生产」(/coach)。此路由保留并重定向，兼容旧书签。
export default function TopicsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/coach");
  }, [router]);
  return (
    <div className="py-20 text-center text-sm text-[var(--muted,#6b7280)]">
      选题中心已合并到「内容生产」，正在跳转…
    </div>
  );
}
