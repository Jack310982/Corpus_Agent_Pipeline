// lib/api/admin.ts - Admin API client (Mock Implementation)

import type {
  Entity,
  Source,
  CorpusItem,
  PipelineStepStatus,
  SegmentPreview,
  CreateEntityInput,
  CreateSourceInput,
  CorpusFilters,
} from "@/lib/types";

// TODO: replace with real Supabase + API route implementation via Cursor

// Mock Data
const mockEntities: Entity[] = [
  {
    id: "1",
    name: "Elon Musk",
    slug: "elon-musk",
    description: "CEO of Tesla and SpaceX, entrepreneur and innovator",
    avatarUrl: "/elon-musk-inspired-visionary.png",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Steve Jobs",
    slug: "steve-jobs",
    description: "Co-founder of Apple Inc.",
    createdAt: "2024-01-20T14:30:00Z",
  },
];

const mockSources: Source[] = [
  {
    id: "1",
    entityId: "1",
    name: "Elon Musk YouTube Playlist",
    kind: "video",
    originType: "youtube",
    configSummary: "Playlist ID: PLx1234567",
    enabled: true,
    lastIngestAt: "2024-01-25T08:00:00Z",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    entityId: "1",
    name: "Tesla Annual Reports",
    kind: "document",
    originType: "pdf_upload",
    configSummary: "Auto-fetch from investor.tesla.com",
    enabled: true,
    lastIngestAt: "2024-01-24T12:00:00Z",
    createdAt: "2024-01-16T09:00:00Z",
  },
  {
    id: "3",
    entityId: "1",
    name: "@elonmusk Twitter",
    kind: "social",
    originType: "twitter",
    configSummary: "Username: @elonmusk",
    enabled: false,
    createdAt: "2024-01-17T11:00:00Z",
  },
];

const mockCorpusItems: CorpusItem[] = [
  {
    id: "1",
    entityId: "1",
    sourceId: "1",
    contentKind: "video",
    originType: "youtube",
    title: "Elon Musk Interview at Tesla Gigafactory",
    description: "Discussion about Tesla's manufacturing innovations",
    primaryUrl: "https://youtube.com/watch?v=abc123",
    language: "en",
    publishedAt: "2024-01-20T15:00:00Z",
    status: "embedded",
    reliabilityLevel: 5,
    createdAt: "2024-01-21T10:00:00Z",
    updatedAt: "2024-01-22T14:30:00Z",
  },
  {
    id: "2",
    entityId: "1",
    sourceId: "2",
    contentKind: "document",
    originType: "pdf_upload",
    title: "Tesla Q4 2023 Annual Report",
    description: "Official Tesla annual financial report",
    primaryUrl: "https://ir.tesla.com/2023-q4-report.pdf",
    language: "en",
    publishedAt: "2024-01-15T00:00:00Z",
    status: "segments_ready",
    reliabilityLevel: 5,
    createdAt: "2024-01-16T09:30:00Z",
    updatedAt: "2024-01-17T11:00:00Z",
  },
  {
    id: "3",
    entityId: "1",
    sourceId: "1",
    contentKind: "video",
    originType: "youtube",
    title: "SpaceX Starship Launch Commentary",
    primaryUrl: "https://youtube.com/watch?v=xyz789",
    language: "en",
    publishedAt: "2024-01-18T12:00:00Z",
    status: "text_imported",
    reliabilityLevel: 4,
    createdAt: "2024-01-19T08:00:00Z",
    updatedAt: "2024-01-19T10:00:00Z",
  },
  {
    id: "4",
    entityId: "1",
    contentKind: "web_page",
    originType: "web_url",
    title: "Official Tesla Blog: Future of Autopilot",
    primaryUrl: "https://tesla.com/blog/autopilot-future",
    language: "en",
    publishedAt: "2024-01-10T09:00:00Z",
    status: "embedded",
    reliabilityLevel: 5,
    createdAt: "2024-01-11T10:00:00Z",
    updatedAt: "2024-01-12T14:00:00Z",
  },
  {
    id: "5",
    entityId: "1",
    sourceId: "3",
    contentKind: "social",
    originType: "twitter",
    title: "Twitter Thread: Mars Mission Vision",
    primaryUrl: "https://twitter.com/elonmusk/status/123456",
    language: "en",
    publishedAt: "2024-01-22T16:30:00Z",
    status: "pending",
    reliabilityLevel: 3,
    createdAt: "2024-01-23T08:00:00Z",
    updatedAt: "2024-01-23T08:00:00Z",
  },
];

const mockSegments: SegmentPreview[] = [
  {
    id: "seg1",
    corpusItemId: "1",
    text: "Tesla's manufacturing process has been revolutionized through advanced automation and AI-driven quality control systems...",
    positionInfo: "00:12:35-00:13:10",
  },
  {
    id: "seg2",
    corpusItemId: "1",
    text: "We're seeing unprecedented efficiency gains in our Gigafactory operations, with production rates increasing by 40%...",
    positionInfo: "00:15:20-00:16:05",
  },
  {
    id: "seg3",
    corpusItemId: "1",
    text: "The future of sustainable energy relies on scaling battery production while reducing costs through innovation...",
    positionInfo: "00:22:10-00:22:55",
  },
];

// API Functions

export async function fetchEntities(): Promise<Entity[]> {
  // TODO: replace with real Supabase + API route implementation via Cursor
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockEntities]), 300);
  });
}

export async function createEntity(input: CreateEntityInput): Promise<Entity> {
  // TODO: replace with real Supabase + API route implementation via Cursor
  return new Promise((resolve) => {
    setTimeout(() => {
      const newEntity: Entity = {
        id: String(mockEntities.length + 1),
        ...input,
        createdAt: new Date().toISOString(),
      };
      mockEntities.push(newEntity);
      resolve(newEntity);
    }, 500);
  });
}

export async function fetchSources(): Promise<Source[]> {
  // TODO: replace with real Supabase + API route implementation via Cursor
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockSources]), 300);
  });
}

export async function createSource(input: CreateSourceInput): Promise<Source> {
  // TODO: replace with real Supabase + API route implementation via Cursor
  return new Promise((resolve) => {
    setTimeout(() => {
      const newSource: Source = {
        id: String(mockSources.length + 1),
        ...input,
        createdAt: new Date().toISOString(),
      };
      mockSources.push(newSource);
      resolve(newSource);
    }, 500);
  });
}

export async function toggleSourceEnabled(
  id: string,
  enabled: boolean
): Promise<void> {
  // TODO: replace with real Supabase + API route implementation via Cursor
  return new Promise((resolve) => {
    setTimeout(() => {
      const source = mockSources.find((s) => s.id === id);
      if (source) {
        source.enabled = enabled;
      }
      resolve();
    }, 300);
  });
}

export async function fetchCorpusItems(
  filters?: CorpusFilters
): Promise<CorpusItem[]> {
  // TODO: replace with real Supabase + API route implementation via Cursor
  return new Promise((resolve) => {
    setTimeout(() => {
      let items = [...mockCorpusItems];
      
      if (filters?.entityId) {
        items = items.filter((item) => item.entityId === filters.entityId);
      }
      
      if (filters?.contentKind) {
        items = items.filter((item) => item.contentKind === filters.contentKind);
      }
      
      resolve(items);
    }, 300);
  });
}

export async function fetchCorpusItemById(
  id: string
): Promise<CorpusItem & { pipeline: PipelineStepStatus }> {
  // TODO: replace with real Supabase + API route implementation via Cursor
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const item = mockCorpusItems.find((i) => i.id === id);
      if (!item) {
        reject(new Error("Corpus item not found"));
        return;
      }
      
      const pipeline: PipelineStepStatus = {
        textImported: ["text_imported", "segments_ready", "embedded"].includes(item.status),
        segmentsBuilt: ["segments_ready", "embedded"].includes(item.status),
        embeddingsReady: item.status === "embedded",
      };
      
      resolve({ ...item, pipeline });
    }, 300);
  });
}

export async function fetchSegmentsPreview(
  corpusItemId: string
): Promise<SegmentPreview[]> {
  // TODO: replace with real Supabase + API route implementation via Cursor
  return new Promise((resolve) => {
    setTimeout(() => {
      const segments = mockSegments.filter(
        (seg) => seg.corpusItemId === corpusItemId
      );
      resolve(segments);
    }, 300);
  });
}

export async function triggerImportText(corpusItemId: string): Promise<void> {
  // TODO: replace with real Supabase + API route implementation via Cursor
  console.log(`[Mock] Triggering text import for corpus item: ${corpusItemId}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const item = mockCorpusItems.find((i) => i.id === corpusItemId);
      if (item && item.status === "pending") {
        item.status = "text_imported";
      }
      resolve();
    }, 1000);
  });
}

export async function triggerBuildSegments(corpusItemId: string): Promise<void> {
  // TODO: replace with real Supabase + API route implementation via Cursor
  console.log(`[Mock] Triggering segment building for corpus item: ${corpusItemId}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const item = mockCorpusItems.find((i) => i.id === corpusItemId);
      if (item && item.status === "text_imported") {
        item.status = "segments_ready";
      }
      resolve();
    }, 1500);
  });
}

export async function triggerBuildEmbeddings(
  corpusItemId: string
): Promise<void> {
  // TODO: replace with real Supabase + API route implementation via Cursor
  console.log(`[Mock] Triggering embeddings building for corpus item: ${corpusItemId}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const item = mockCorpusItems.find((i) => i.id === corpusItemId);
      if (item && item.status === "segments_ready") {
        item.status = "embedded";
      }
      resolve();
    }, 2000);
  });
}
