"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  useContentWithMetrics,
  useUpdateContent,
  useUpdateMetrics,
  useAddReview,
  useAddComment,
  useRepurposeContent,
} from "@/hooks/useContents";
import { useAuth } from "@/components/providers/AuthProvider";
import { PLATFORMS, CONTENT_STATUSES, FUNNEL_STAGES, EMOTIONAL_TRIGGERS, CONTENT_TYPES, TOPIC_CLUSTERS } from "@/lib/constants";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { relativeTime } from "@/lib/utils";
import { MediaUploader } from "@/components/ui/MediaUploader";
import { useContentMedia } from "@/hooks/useContentMedia";

export default function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { profile, role } = useAuth();
  const { data: content, isLoading } = useContentWithMetrics(id);
  const { data: mediaFiles } = useContentMedia(id);
  const updateContent = useUpdateContent();
  const updateMetrics = useUpdateMetrics();
  const addReview = useAddReview();
  const addComment = useAddComment();
  const repurpose = useRepurposeContent();

  const [isEditing, setIsEditing] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [newComment, setNewComment] = useState("");
  const [showRepurpose, setShowRepurpose] = useState(false);
  const [repurposeForm, setRepurposeForm] = useState({ platform: "", title: "" });
  const [showMetrics, setShowMetrics] = useState(false);
  const [metricsForm, setMetricsForm] = useState({
    reads: 0, likes: 0, comments: 0, shares: 0, private_messages: 0, leads: 0,
  });
  const [aiReviewing, setAiReviewing] = useState(false);
  const [aiResult, setAiResult] = useState<{ suggestion: string; comment: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    title: "", status: "", funnel_stage: "", emotional_trigger: "",
    content_type: "", topic_cluster: "", publish_date: "", notes: "",
    wace_focus: false, author_name: "", cta: "", primary_keyword: "",
    cover_image_url: "", body: "",
  });

  const getPlatformInfo = (pid: string) => PLATFORMS.find((p) => p.id === pid);

  const startEditing = () => {
    if (!content) return;
    setEditForm({
      title: content.title, status: content.status,
      funnel_stage: content.funnel_stage, emotional_trigger: content.emotional_trigger,
      content_type: content.content_type, topic_cluster: content.topic_cluster,
      publish_date: content.publish_date || "", notes: content.notes || "",
      wace_focus: content.wace_focus, author_name: content.author_name || "",
      cta: content.cta || "", primary_keyword: content.primary_keyword || "",
      cover_image_url: content.cover_image_url || "", body: content.body || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateContent.mutateAsync({
        id,
        title: editForm.title.trim(),
        status: editForm.status,
        funnel_stage: editForm.funnel_stage,
        emotional_trigger: editForm.emotional_trigger,
        content_type: editForm.content_type,
        topic_cluster: editForm.topic_cluster,
        publish_date: editForm.publish_date || null,
        notes: editForm.notes || null,
        wace_focus: editForm.wace_focus,
        author_name: editForm.author_name || null,
        cta: editForm.cta || null,
        primary_keyword: editForm.primary_keyword || null,
        cover_image_url: editForm.cover_image_url || null,
        body: editForm.body || null,
      });
      setIsEditing(false);
    } catch (err) {
      alert("保存失败: " + (err instanceof Error ? err.message : "未知错误"));
    }
  };

  const handleReview = async (action: "approve" | "reject") => {
    try {
      await addReview.mutateAsync({
        content_id: id,
        reviewer_name: profile?.display_name || "未知用户",
        action,
        comment: reviewComment || undefined,
      });
      setReviewComment("");
    } catch (err) {
      alert("审核操作失败: " + (err instanceof Error ? err.message : "未知错误"));
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    try {
      await addComment.mutateAsync({
        content_id: id,
        author_name: profile?.display_name || "未知用户",
        body: newComment.trim(),
      });
      setNewComment("");
    } catch (err) {
      alert("评论发送失败: " + (err instanceof Error ? err.message : "未知错误"));
    }
  };

  const openMetricsForm = () => {
    if (content?.metrics) {
      setMetricsForm({
        reads: content.metrics.reads, likes: content.metrics.likes,
        comments: content.metrics.comments, shares: content.metrics.shares,
        private_messages: content.metrics.private_messages, leads: content.metrics.leads,
      });
    } else {
      setMetricsForm({ reads: 0, likes: 0, comments: 0, shares: 0, private_messages: 0, leads: 0 });
    }
    setShowMetrics(true);
  };

  const handleMetricsSave = async () => {
    try {
      await updateMetrics.mutateAsync({ content_id: id, ...metricsForm });
      setShowMetrics(false);
    } catch (err) {
      alert("数据保存失败: " + (err instanceof Error ? err.message : "未知错误"));
    }
  };

  const handleAiReview = async () => {
    if (!content) return;
    setAiReviewing(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/ai-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: content.title,
          account: content.platform,
          funnelStage: content.funnel_stage,
          emotionalTrigger: content.emotional_trigger,
          contentType: content.content_type,
          cta: content.cta,
          primaryKeyword: content.primary_keyword,
          waceFocus: content.wace_focus,
          topicCluster: content.topic_cluster,
          notes: content.notes,
          repurposeStatus: content.repurpose_status,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiResult(data);
        // Auto-add as a review record (non-blocking)
        try {
          await addReview.mutateAsync({
            content_id: id,
            reviewer_name: "DeepSeek AI",
            action: data.suggestion === "approve" ? "approve" : data.suggestion === "reject" ? "reject" : "comment",
            comment: data.comment,
          });
        } catch {
          // Review save failed, but AI result is still shown to user
        }
      } else {
        setAiResult({ suggestion: "error", comment: data.error || "AI 审核失败" });
      }
    } catch {
      setAiResult({ suggestion: "error", comment: "网络错误，无法连接 AI 服务" });
    } finally {
      setAiReviewing(false);
    }
  };

  const handleRepurpose = async () => {
    if (!repurposeForm.platform || !repurposeForm.title.trim()) return;
    try {
      await repurpose.mutateAsync({
        parentId: id,
        targetPlatform: repurposeForm.platform,
        title: repurposeForm.title.trim(),
      });
      setShowRepurpose(false);
      setRepurposeForm({ platform: "", title: "" });
    } catch (err) {
      alert("复用创建失败: " + (err instanceof Error ? err.message : "未知错误"));
    }
  };

  const handleSubmitForReview = async () => {
    if (!content) return;
    setSubmitError(null);

    const hasCover = !!content.cover_image_url;
    const hasBody = !!content.body?.trim();
    const hasMedia = (mediaFiles && mediaFiles.length > 0) || false;

    if (!hasCover && !hasBody && !hasMedia) {
      setSubmitError("提交审核前，请至少完成以下一项：上传封面图、填写正文文案、或上传视频/图片素材");
      return;
    }

    try {
      await updateContent.mutateAsync({ id, status: "待审核" });
      setSubmitError(null);
    } catch (err) {
      alert("操作失败: " + (err instanceof Error ? err.message : "未知错误"));
    }
  };

  if (isLoading) return <PageSkeleton />;
  if (!content) return (
    <div className="max-w-4xl mx-auto text-center py-12">
      <p style={{ color: "var(--muted)" }}>内容不存在</p>
      <Link href="/content" className="text-sm mt-2 inline-block" style={{ color: "var(--brand)" }}>← 返回内容库</Link>
    </div>
  );

  const platform = getPlatformInfo(content.platform);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Link */}
      <Link href="/content" className="text-sm mb-4 inline-block no-underline" style={{ color: "var(--brand)" }}>
        ← 返回内容库
      </Link>

      {/* Cover Image */}
      {content.cover_image_url && (
        <div className="rounded-xl overflow-hidden mb-4" style={{ border: "1px solid var(--border)" }}>
          <img
            src={content.cover_image_url}
            alt={content.title}
            className="w-full object-cover"
            style={{ maxHeight: "320px" }}
          />
        </div>
      )}

      {/* Header */}
      <div className="rounded-xl p-6 mb-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                {platform ? `${platform.icon} ${platform.label}` : content.platform}
              </span>
              <Badge variant={statusVariant(content.status)}>{content.status}</Badge>
              {content.wace_focus && <Badge variant="warning">WACE</Badge>}
              <Badge variant="outline">{content.repurpose_status}</Badge>
            </div>
            <h1 className="text-xl font-bold m-0" style={{ color: "var(--ink)" }}>{content.title}</h1>
          </div>
          <div className="flex gap-2 shrink-0 ml-4 flex-wrap justify-end">
            <Button variant="secondary" size="sm" onClick={openMetricsForm}>📊 数据回填</Button>
            <Button variant="secondary" size="sm" onClick={handleAiReview} disabled={aiReviewing}>
              {aiReviewing ? "🤖 审核中..." : "🤖 AI 审核"}
            </Button>
            <Button variant="secondary" size="sm" onClick={startEditing}>编辑</Button>
            <Button variant="secondary" size="sm" onClick={() => setShowRepurpose(true)}>一键复用</Button>
          </div>
        </div>

        {/* Strategy Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline">{content.funnel_stage}</Badge>
          <Badge variant="outline">{content.content_type}</Badge>
          <Badge variant="outline">{content.emotional_trigger}</Badge>
          <Badge variant="outline">{content.topic_cluster}</Badge>
          {content.primary_keyword && <Badge variant="info">关键词: {content.primary_keyword}</Badge>}
        </div>

        {/* AI Review Result */}
        {aiResult && (
          <div className="mb-4 p-4 rounded-lg text-sm" style={{
            background: aiResult.suggestion === "approve" ? "#f0fdf4" : aiResult.suggestion === "reject" ? "#fef2f2" : aiResult.suggestion === "error" ? "#fef2f2" : "#fffbeb",
            border: `1px solid ${aiResult.suggestion === "approve" ? "#86efac" : aiResult.suggestion === "reject" ? "#fca5a5" : aiResult.suggestion === "error" ? "#fca5a5" : "#fcd34d"}`,
          }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{aiResult.suggestion === "approve" ? "✅" : aiResult.suggestion === "reject" ? "❌" : aiResult.suggestion === "error" ? "⚠️" : "📝"}</span>
              <span className="font-semibold" style={{ color: "var(--ink)" }}>
                {aiResult.suggestion === "approve" ? "AI 建议：通过" : aiResult.suggestion === "reject" ? "AI 建议：退回" : aiResult.suggestion === "error" ? "AI 审核失败" : "AI 建议：修改后重审"}
              </span>
            </div>
            <pre className="text-xs whitespace-pre-wrap m-0 font-sans" style={{ color: "var(--ink)" }}>
              {aiResult.comment}
            </pre>
          </div>
        )}

        {/* Meta Info */}
        <div className="grid grid-cols-4 gap-4 text-xs" style={{ color: "var(--muted)" }}>
          <div><span className="block mb-0.5">作者</span><span style={{ color: "var(--ink)" }}>{content.author_name || "未指定"}</span></div>
          <div><span className="block mb-0.5">发布日期</span><span style={{ color: "var(--ink)" }}>{content.publish_date || "未排期"}</span></div>
          <div><span className="block mb-0.5">创建时间</span><span style={{ color: "var(--ink)" }}>{relativeTime(content.created_at)}</span></div>
          <div><span className="block mb-0.5">CTA</span><span style={{ color: "var(--ink)" }}>{content.cta || "无"}</span></div>
        </div>

        {content.notes && (
          <div className="mt-4 p-3 rounded-lg text-sm" style={{ background: "var(--surface-soft)", color: "var(--ink)" }}>
            <span className="text-xs block mb-1" style={{ color: "var(--muted)" }}>备注</span>
            {content.notes}
          </div>
        )}
      </div>

      {/* Body Content */}
      {content.body && (
        <div className="rounded-xl p-6 mb-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>正文内容</h3>
          <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--ink)" }}>
            {content.body}
          </div>
        </div>
      )}

      {/* Media Gallery & Upload */}
      <div className="rounded-xl p-6 mb-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>素材文件</h3>
        <MediaUploader contentId={id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Metrics + Reviews */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Metrics */}
          {content.metrics && (
            <div className="rounded-xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>内容数据</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { label: "阅读", value: content.metrics.reads, color: "var(--ink)" },
                  { label: "点赞", value: content.metrics.likes, color: "var(--brand)" },
                  { label: "评论", value: content.metrics.comments, color: "var(--blue)" },
                  { label: "分享", value: content.metrics.shares, color: "var(--green)" },
                  { label: "私信", value: content.metrics.private_messages, color: "var(--amber)" },
                  { label: "线索", value: content.metrics.leads, color: "var(--red)" },
                ].map((m) => (
                  <div key={m.label} className="text-center p-2 rounded-lg" style={{ background: "var(--surface-soft)" }}>
                    <div className="text-lg font-bold" style={{ color: m.color }}>{m.value}</div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review Panel */}
          <div className="rounded-xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>审核操作</h3>
            {(content.status === "待审核" || content.status === "审核中") ? (
              (role === "admin" || role === "lead") ? (
                <div className="flex flex-col gap-3">
                  <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="审核意见（可选）..." rows={2}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                    style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={() => handleReview("approve")}
                      disabled={addReview.isPending}>✓ 通过</Button>
                    <Button variant="danger" size="sm" onClick={() => handleReview("reject")}
                      disabled={addReview.isPending}>✗ 退回</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: "var(--surface-soft)" }}>
                  <span className="text-base">⏳</span>
                  <p className="text-xs m-0" style={{ color: "var(--muted)" }}>
                    已提交审核，等待负责人审批
                  </p>
                </div>
              )
            ) : (
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                当前状态为「{content.status}」，{content.status === "草稿" ? "提交审核后可操作" : "无需审核"}
              </p>
            )}

            {/* Review History */}
            {content.reviews && content.reviews.length > 0 && (
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                <h4 className="text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>审核记录</h4>
                <div className="flex flex-col gap-2">
                  {content.reviews.map((r) => (
                    <div key={r.id} className="flex items-start gap-2 text-xs">
                      <Badge variant={r.action === "approve" ? "success" : r.action === "reject" ? "danger" : "info"}>
                        {r.action === "approve" ? "通过" : r.action === "reject" ? "退回" : "评论"}
                      </Badge>
                      <span style={{ color: "var(--ink)" }}>{r.reviewer_name}</span>
                      {r.comment && <span style={{ color: "var(--muted)" }}>: {r.comment}</span>}
                      <span className="ml-auto" style={{ color: "var(--muted)" }}>{relativeTime(r.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="rounded-xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>
              评论 ({content.comments?.length || 0})
            </h3>
            <div className="flex gap-2 mb-4">
              <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)}
                placeholder="添加评论..." className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }}
                onKeyDown={(e) => e.key === "Enter" && handleComment()} />
              <Button variant="primary" size="sm" onClick={handleComment} disabled={addComment.isPending}>发送</Button>
            </div>
            {content.comments && content.comments.length > 0 ? (
              <div className="flex flex-col gap-3">
                {content.comments.map((c) => (
                  <div key={c.id} className="p-3 rounded-lg" style={{ background: "var(--surface-soft)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium" style={{ color: "var(--ink)" }}>{c.author_name}</span>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>{relativeTime(c.created_at)}</span>
                    </div>
                    <p className="text-sm m-0" style={{ color: "var(--ink)" }}>{c.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-center py-4" style={{ color: "var(--muted)" }}>暂无评论</p>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Knowledge Refs */}
          <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h3 className="text-xs font-semibold mb-3" style={{ color: "var(--ink)" }}>引用资料</h3>
            {content.knowledge_refs && content.knowledge_refs.length > 0 ? (
              <div className="flex flex-col gap-2">
                {content.knowledge_refs.map((k) => (
                  <div key={k.id} className="text-xs p-2 rounded" style={{ background: "var(--surface-soft)", color: "var(--ink)" }}>
                    📄 {k.title}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: "var(--muted)" }}>未引用资料</p>
            )}
          </div>

          {/* Repurpose Children */}
          <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h3 className="text-xs font-semibold mb-3" style={{ color: "var(--ink)" }}>复用链</h3>
            {content.repurpose_children && content.repurpose_children.length > 0 ? (
              <div className="flex flex-col gap-2">
                {content.repurpose_children.map((child) => {
                  const childPlat = getPlatformInfo(child.platform);
                  return (
                    <Link key={child.id} href={`/content/${child.id}`} className="no-underline">
                      <div className="text-xs p-2 rounded cursor-pointer" style={{ background: "var(--surface-soft)", color: "var(--ink)" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--border)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "var(--surface-soft)"}>
                        {childPlat?.icon} {child.title}
                        <Badge variant={statusVariant(child.status)}>{child.status}</Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs" style={{ color: "var(--muted)" }}>暂无复用内容</p>
            )}
          </div>

          {/* Quick Status Change */}
          <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h3 className="text-xs font-semibold mb-3" style={{ color: "var(--ink)" }}>快速操作</h3>
            <div className="flex flex-col gap-2">
              {content.status === "草稿" && (
                <>
                  <Button variant="primary" size="sm" className="w-full"
                    disabled={updateContent.isPending}
                    onClick={handleSubmitForReview}>
                    提交审核
                  </Button>
                  {submitError && (
                    <div className="p-2.5 rounded-lg text-xs" style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b" }}>
                      ⚠️ {submitError}
                    </div>
                  )}
                </>
              )}
              {content.status === "已通过" && (
                <Button variant="primary" size="sm" className="w-full"
                  disabled={updateContent.isPending}
                  onClick={() => updateContent.mutateAsync({ id, status: "已发布" }).catch((err) => alert("操作失败: " + (err instanceof Error ? err.message : "未知错误")))}>
                  标记已发布
                </Button>
              )}
              {content.status === "已发布" && (
                <Button variant="secondary" size="sm" className="w-full"
                  disabled={updateContent.isPending}
                  onClick={() => updateContent.mutateAsync({ id, status: "已归档" }).catch((err) => alert("操作失败: " + (err instanceof Error ? err.message : "未知错误")))}>
                  归档
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="编辑内容"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsEditing(false)}>取消</Button>
            <Button variant="primary" onClick={handleSave} disabled={updateContent.isPending}>
              {updateContent.isPending ? "保存中..." : "保存"}
            </Button>
          </div>
        }>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>标题</label>
            <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="状态" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              options={CONTENT_STATUSES.map((s) => ({ value: s, label: s }))} />
            <Select label="漏斗阶段" value={editForm.funnel_stage} onChange={(e) => setEditForm({ ...editForm, funnel_stage: e.target.value })}
              options={FUNNEL_STAGES.map((s) => ({ value: s, label: s }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="情绪钩子" value={editForm.emotional_trigger} onChange={(e) => setEditForm({ ...editForm, emotional_trigger: e.target.value })}
              options={EMOTIONAL_TRIGGERS.map((s) => ({ value: s, label: s }))} />
            <Select label="内容类型" value={editForm.content_type} onChange={(e) => setEditForm({ ...editForm, content_type: e.target.value })}
              options={CONTENT_TYPES.map((s) => ({ value: s, label: s }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="主题集群" value={editForm.topic_cluster} onChange={(e) => setEditForm({ ...editForm, topic_cluster: e.target.value })}
              options={TOPIC_CLUSTERS.map((s) => ({ value: s, label: s }))} />
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>发布日期</label>
              <input type="date" value={editForm.publish_date} onChange={(e) => setEditForm({ ...editForm, publish_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>作者</label>
              <input type="text" value={editForm.author_name} onChange={(e) => setEditForm({ ...editForm, author_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>主关键词</label>
              <input type="text" value={editForm.primary_keyword} onChange={(e) => setEditForm({ ...editForm, primary_keyword: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>封面图 URL</label>
            <input type="url" value={editForm.cover_image_url} onChange={(e) => setEditForm({ ...editForm, cover_image_url: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }}
              placeholder="粘贴封面图链接" />
            {editForm.cover_image_url && (
              <div className="mt-2 rounded-lg overflow-hidden h-24 w-full">
                <img src={editForm.cover_image_url} alt="预览" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>正文内容</label>
            <textarea value={editForm.body} onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
              rows={6} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }}
              placeholder="输入正文内容..." />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>备注</label>
            <textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              rows={3} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={editForm.wace_focus} onChange={(e) => setEditForm({ ...editForm, wace_focus: e.target.checked })} />
            <span className="text-sm" style={{ color: "var(--ink)" }}>WACE 重点内容</span>
          </label>
        </div>
      </Modal>

      {/* Repurpose Modal */}
      <Modal isOpen={showRepurpose} onClose={() => setShowRepurpose(false)} title="一键复用到其他平台"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowRepurpose(false)}>取消</Button>
            <Button variant="primary" onClick={handleRepurpose} disabled={repurpose.isPending}>
              {repurpose.isPending ? "创建中..." : "创建复用"}
            </Button>
          </div>
        }>
        <div className="flex flex-col gap-4">
          <Select label="目标平台" value={repurposeForm.platform}
            onChange={(e) => setRepurposeForm({ ...repurposeForm, platform: e.target.value })}
            options={[{ value: "", label: "选择平台" }, ...PLATFORMS.filter((p) => p.id !== content.platform).map((p) => ({ value: p.id, label: `${p.icon} ${p.label}` }))]} />
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>新标题</label>
            <input type="text" value={repurposeForm.title}
              onChange={(e) => setRepurposeForm({ ...repurposeForm, title: e.target.value })}
              placeholder={content.title}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
          </div>
        </div>
      </Modal>

      {/* Metrics Backfill Modal */}
      <Modal isOpen={showMetrics} onClose={() => setShowMetrics(false)} title="📊 数据回填"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowMetrics(false)}>取消</Button>
            <Button variant="primary" onClick={handleMetricsSave} disabled={updateMetrics.isPending}>
              {updateMetrics.isPending ? "保存中..." : "保存数据"}
            </Button>
          </div>
        }>
        <div className="grid grid-cols-2 gap-4">
          {([
            { key: "reads", label: "阅读量", icon: "👁️" },
            { key: "likes", label: "点赞数", icon: "👍" },
            { key: "comments", label: "评论数", icon: "💬" },
            { key: "shares", label: "分享数", icon: "🔗" },
            { key: "private_messages", label: "私信数", icon: "✉️" },
            { key: "leads", label: "线索数", icon: "🎯" },
          ] as const).map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>
                {field.icon} {field.label}
              </label>
              <input type="number" min="0"
                value={metricsForm[field.key]}
                onChange={(e) => setMetricsForm({ ...metricsForm, [field.key]: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="h-4 w-20 rounded mb-4" style={{ background: "var(--surface-soft)" }} />
      <div className="h-48 rounded-xl mb-4" style={{ background: "var(--surface-soft)" }} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="h-32 rounded-xl" style={{ background: "var(--surface-soft)" }} />
          <div className="h-48 rounded-xl" style={{ background: "var(--surface-soft)" }} />
        </div>
        <div className="flex flex-col gap-4">
          <div className="h-32 rounded-xl" style={{ background: "var(--surface-soft)" }} />
          <div className="h-32 rounded-xl" style={{ background: "var(--surface-soft)" }} />
        </div>
      </div>
    </div>
  );
}
