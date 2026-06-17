"use client";

import TodayPublishing from "@/components/dashboard/TodayPublishing";

// 「今日发布」已并入工作台；此路由保留，渲染同一组件，避免旧链接失效
export default function PublishingPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <TodayPublishing />
    </div>
  );
}
