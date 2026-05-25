"use client";

import { useState } from "react";
import Link from "next/link";
import { useContentList, useCreateContent } from "@/hooks/useContents";
import { PLATFORMS, CONTENT_STATUSES, FUNNEL_STAGES, TOPIC_CLUSTERS, EMOTIONAL_TRIGGERS, CONTENT_TYPES } from "@/lib/constants";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import type { Content } from "@/lib/types";

export default function ContentPage() {
  const [filters, setFilters] = useState({ platform: "", status: "", funnelStage: "", topicCluster: "" });
  const { data: contents, isLoading } = useContentList({
    platform: filters.platform || undefined,
    status: filters.status || undefined,
    funnelStage: filters.funnelStage || undefined,
    topicCluster: filters.topicCluster || undefined,
  });
  const createContent = useCreateContent();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "", platform: "", status: "草稿", funnel_stage: "Awareness",
    emotional_trigger: "待定", content_type: "干货", topic_cluster: "未分类",
    publish_date: "", notes: "", wace_focus: false,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.platform) return;
    await createContent.mutateAsync({
      title: form.title.trim(),
      platform: form.platform,
      status: form.status,
      funnel_stage: form.funnel_stage,
      emotional_trigger: form.emotional_trigger,
      content_type: form.content_type,
      topic_cluster: form.topic_cluster,
      publish_date: form.publish_date || null,
      notes: form.notes || null,
      wace_focus: form.wace_focus,
    } as Partial<Content>);
    setShowCreate(false);
    setForm({
      title: "", platform: "", status: "草稿", funnel_stage: "Awareness",
      emotional_trigger: "待定", content_type: "干货", topic_cluster: "未分类",
      publish_date: "", notes: "", wace_focus: false,
    });
  };

  const getPlatform = (id: string) => PLATFORMS.find((p) => p.id === id);

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold m-0" style={{ color: "var(--ink)" }}>内容资产库</h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            共 {contents?.length || 0} 条内容
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>+ 新建内容</Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Select label="" value={filters.platform} onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
          options={[{ value: "", label: "全部平台" }, ...PLATFORMS.map((p) => ({ value: p.id, label: `${p.icon} ${p.label}` }))]} />
        <Select label="" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          options={[{ value: "", label: "全部状态" }, ...CONTENT_STATUSES.map((s) => ({ value: s, label: s }))]} />
        <Select label="" value={filters.funnelStage} onChange={(e) => setFilters({ ...filters, funnelStage: e.target.value })}
          options={[{ value: "", label: "全部阶段" }, ...FUNNEL_STAGES.map((s) => ({ value: s, label: s }))]} />
        <Select label="" value={filters.topicCluster} onChange={(e) => setFilters({ ...filters, topicCluster: e.target.value })}
          options={[{ value: "", label: "全部主题" }, ...TOPIC_CLUSTERS.map((s) => ({ value: s, label: s }))]} />
      </div>

      {/* Content Grid */}
      {contents && contents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contents.map((content) => {
            const platform = getPlatform(content.platform);
            return (
              <Link key={content.id} href={`/content/${content.id}`} className="no-underline">
                <div
                  className="rounded-xl p-4 cursor-pointer transition-all h-full"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs" style={{ color: "var(--muted)" }}>
                      {platform ? `${platform.icon} ${platform.label}` : content.platform}
                    </span>
                    <Badge variant={statusVariant(content.status)}>{content.status}</Badge>
                  </div>

                  {/* Title */}
                  <h3
                    className="text-sm font-semibold mb-2 line-clamp-2"
                    style={{ color: "var(--ink)", minHeight: "2.5em" }}
                  >
                    {content.title}
                  </h3>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="outline">{content.funnel_stage}</Badge>
                    <Badge variant="outline">{content.content_type}</Badge>
                    {content.wace_focus && <Badge variant="warning">WACE</Badge>}
                  </div>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-between pt-2 text-xs"
                    style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}
                  >
                    <span>{content.author_name || "未指定"}</span>
                    <span>{content.publish_date || "未排期"}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl p-12 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-4xl mb-3">📝</div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {Object.values(filters).some(Boolean) ? "没有匹配的内容，试试调整筛选条件" : "还没有内容，点击上方按钮创建第一条"}
          </p>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="新建内容"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>取消</Button>
            <Button variant="primary" onClick={handleCreate} disabled={createContent.isPending}>
              {createContent.isPending ? "创建中..." : "创建"}
            </Button>
          </div>
        }>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>标题 *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              required className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }}
              placeholder="输入内容标题" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="平台 *" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}
              options={[{ value: "", label: "选择平台" }, ...PLATFORMS.map((p) => ({ value: p.id, label: `${p.icon} ${p.label}` }))]} />
            <Select label="状态" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={CONTENT_STATUSES.map((s) => ({ value: s, label: s }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="漏斗阶段" value={form.funnel_stage} onChange={(e) => setForm({ ...form, funnel_stage: e.target.value })}
              options={FUNNEL_STAGES.map((s) => ({ value: s, label: s }))} />
            <Select label="情绪钩子" value={form.emotional_trigger} onChange={(e) => setForm({ ...form, emotional_trigger: e.target.value })}
              options={EMOTIONAL_TRIGGERS.map((s) => ({ value: s, label: s }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="内容类型" value={form.content_type} onChange={(e) => setForm({ ...form, content_type: e.target.value })}
              options={CONTENT_TYPES.map((s) => ({ value: s, label: s }))} />
            <Select label="主题集群" value={form.topic_cluster} onChange={(e) => setForm({ ...form, topic_cluster: e.target.value })}
              options={TOPIC_CLUSTERS.map((s) => ({ value: s, label: s }))} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>发布日期</label>
            <input type="date" value={form.publish_date} onChange={(e) => setForm({ ...form, publish_date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>备注</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.wace_focus} onChange={(e) => setForm({ ...form, wace_focus: e.target.checked })} />
            <span className="text-sm" style={{ color: "var(--ink)" }}>WACE 重点内容</span>
          </label>
        </form>
      </Modal>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 w-24 rounded" style={{ background: "var(--surface-soft)" }} />
          <div className="h-4 w-32 rounded mt-2" style={{ background: "var(--surface-soft)" }} />
        </div>
        <div className="h-9 w-24 rounded-lg" style={{ background: "var(--surface-soft)" }} />
      </div>
      <div className="flex gap-3 mb-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-32 rounded-lg" style={{ background: "var(--surface-soft)" }} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-44 rounded-xl" style={{ background: "var(--surface-soft)" }} />
        ))}
      </div>
    </div>
  );
}
