// ── Database Row Types ──
// These match the Supabase table schemas exactly

export interface Persona {
  id: string;
  name: string;
  role_title: string | null;
  tone: string | null;
  platforms: string[];
  avatar_url: string | null;
  monthly_target: number;
  team: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  account_name: string;
  platform: string;
  persona_id: string | null;
  operator_name: string | null;
  stage: string;
  follower_count: number;
  total_posts: number;
  total_leads: number;
  team: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  persona?: Persona;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  detail: string | null;
  source_url: string | null;
  source_type: string;
  subject_tags: string[];
  item_type: string;
  numeric_data: string | null;
  review_cycle: string;
  verified_by: string | null;
  last_verified: string | null;
  visibility: string;
  used_count: number;
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: string;
  title: string;
  platform: string;
  account_id: string | null;
  persona_id: string | null;
  author_name: string | null;
  // Strategy tags
  status: string;
  funnel_stage: string;
  emotional_trigger: string;
  content_type: string;
  topic_cluster: string;
  lead_magnet: string | null;
  primary_keyword: string | null;
  wace_focus: boolean;
  cta: string | null;
  audience_personas: string[];
  // Repurpose
  repurpose_status: string;
  repurpose_parent_id: string | null;
  // Publishing
  publish_date: string | null;
  notes: string | null;
  // Content body & cover
  cover_image_url: string | null;
  body: string | null;
  // AI
  prompts_used: string | null;
  ai_search_ready: boolean;
  team: string;
  created_at: string;
  updated_at: string;
  // Joined fields (optional)
  account?: Account;
  persona?: Persona;
  metrics?: ContentMetrics;
  reviews?: ContentReview[];
  comments?: ContentComment[];
  knowledge_refs?: KnowledgeItem[];
  repurpose_children?: Content[];
  media?: ContentMedia[];
}

export interface ContentMetrics {
  id: string;
  content_id: string;
  reads: number;
  likes: number;
  comments: number;
  shares: number;
  private_messages: number;
  leads: number;
  recorded_at: string;
}

export interface CrmLead {
  id: string;
  name: string;
  phone: string | null;
  child_name: string | null;
  child_grade: string | null;
  source_platform: string | null;
  source_content_id: string | null;
  source_persona_id: string | null;
  source_account_id: string | null;
  stage: string;
  assigned_to: string | null;
  interest_program: string | null;
  notes: string | null;
  next_followup: string | null;
  team: string;
  created_at: string;
  updated_at: string;
  // Joined
  source_content?: Content;
}

export interface AiPrompt {
  id: string;
  name: string;
  category: string | null;
  persona_id: string | null;
  target_platform: string | null;
  prompt_text: string;
  use_count: number;
  last_used_at: string | null;
  team: string;
  created_at: string;
  // Joined
  persona?: Persona;
}

export interface PublishedPost {
  id: string;
  content_id: string | null;
  account_id: string | null;
  platform: string | null;
  scheduled_time: string | null;
  actual_time: string | null;
  status: string;
  operator_name: string | null;
  created_at: string;
  // Joined
  content?: Content;
  account?: Account;
}

export interface ContentReview {
  id: string;
  content_id: string;
  reviewer_name: string;
  action: "approve" | "reject" | "comment";
  comment: string | null;
  created_at: string;
}

export interface ContentComment {
  id: string;
  content_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  role: string;
  team: string;
  avatar_url: string | null;
  daily_publish_target: number;
  created_at: string;
}

export interface ContentMedia {
  id: string;
  content_id: string;
  file_url: string;
  file_name: string;
  file_type: string;  // image, video, document
  file_size: number;
  sort_order: number;
  created_at: string;
}

export interface KnowledgeMedia {
  id: string;
  knowledge_id: string;
  file_url: string;
  file_name: string;
  file_type: string;  // image, document
  file_size: number;
  sort_order: number;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

// ── Coach System Types ──
export interface CoachGenerated {
  id: string;
  user_id: string | null;
  user_name: string | null;
  topic: string;
  platform: string;
  audience_tag: string | null;
  tone: string | null;
  content_type: string;
  output_text: string;
  is_daily: boolean;
  batch_id: string | null;
  is_saved: boolean;
  created_at: string;
  // Token 统计（migration 006，可选）
  model?: string | null;
  prompt_tokens?: number | null;
  completion_tokens?: number | null;
  total_tokens?: number | null;
}

// ── Form Input Types ──
export type ContentInsert = Omit<Content, "id" | "created_at" | "updated_at" | "team" | "account" | "persona" | "metrics" | "reviews" | "comments" | "knowledge_refs" | "repurpose_children" | "media">;
export type ContentUpdate = Partial<ContentInsert>;
export type KnowledgeInsert = Omit<KnowledgeItem, "id" | "created_at" | "updated_at">;
export type PersonaInsert = Omit<Persona, "id" | "created_at" | "updated_at" | "team">;
export type AccountInsert = Omit<Account, "id" | "created_at" | "updated_at" | "team" | "persona">;
export type CrmLeadInsert = Omit<CrmLead, "id" | "created_at" | "updated_at" | "team" | "source_content">;
export type AiPromptInsert = Omit<AiPrompt, "id" | "created_at" | "team" | "persona">;
