// lib/types.ts - 全局类型定义

export interface Entity {
  id: string;
  name: string;
  slug: string;
  description?: string;
  avatarUrl?: string;
  createdAt: string;
}

export type SourceKind = "video" | "audio" | "document" | "web_page" | "social";
export type SourceOriginType =
  | "youtube"
  | "podcast"
  | "pdf_upload"
  | "web_url"
  | "twitter"
  | "local_note"
  | string;

export interface Source {
  id: string;
  entityId?: string | null;
  name: string;
  kind: SourceKind;
  originType: SourceOriginType;
  configSummary: string;
  enabled: boolean;
  lastIngestAt?: string;
  createdAt: string;
}

export type ContentKind = "video" | "audio" | "document" | "web_page" | "social";

export interface CorpusItem {
  id: string;
  entityId?: string | null;
  sourceId?: string | null;
  contentKind: ContentKind;
  originType: SourceOriginType;
  title: string;
  description?: string;
  primaryUrl?: string;
  language: string;
  publishedAt?: string;
  status: "pending" | "text_imported" | "segments_ready" | "embedded" | "failed";
  reliabilityLevel?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStepStatus {
  textImported: boolean;
  segmentsBuilt: boolean;
  embeddingsReady: boolean;
}

export interface SegmentPreview {
  id: string;
  corpusItemId: string;
  text: string;
  positionInfo?: string;
}

export interface QACitation {
  segmentId: string;
  textSnippet: string;
  corpusItem: {
    id: string;
    title: string;
    primaryUrl?: string;
    contentKind: ContentKind;
    publishedAt?: string;
    positionInfo?: string;
  };
}

export interface QAResponseMeta {
  retrievedCount: number;
  usedSegmentIds: string[];
  confidence: "high" | "medium" | "low";
}

export interface QAResponse {
  answer: string;
  citations: QACitation[];
  meta: QAResponseMeta;
}

export interface CreateEntityInput {
  name: string;
  slug: string;
  description?: string;
  avatarUrl?: string;
}

export interface CreateSourceInput {
  entityId?: string | null;
  name: string;
  kind: SourceKind;
  originType: SourceOriginType;
  configSummary: string;
  enabled: boolean;
}

export interface CorpusFilters {
  entityId?: string;
  contentKind?: ContentKind;
}

export interface QAFilters {
  timeRange?: { from: string; to: string };
  contentKinds?: ContentKind[];
  minReliability?: number;
}
