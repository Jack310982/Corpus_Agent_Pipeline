// lib/api/agent.ts - Agent API client (Mock Implementation)

import type { Entity, QAResponse, QAFilters } from "@/lib/types";

// TODO: replace with real Supabase + API route implementation via Cursor

// Mock Data
const mockEntitiesAgent = [
  {
    id: "1",
    name: "Elon Musk",
    slug: "elon-musk",
    description: "CEO of Tesla and SpaceX, entrepreneur and innovator",
    avatarUrl: "/elon-musk-inspired-visionary.png",
    createdAt: "2024-01-15T10:00:00Z",
  },
];

export async function fetchEntityBySlug(slug: string): Promise<Entity> {
  // TODO: replace with real Supabase + API route implementation via Cursor
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const entity = mockEntitiesAgent.find((e) => e.slug === slug);
      if (!entity) {
        reject(new Error("Entity not found"));
        return;
      }
      resolve(entity);
    }, 300);
  });
}

export async function askQuestion(
  entitySlug: string,
  question: string,
  filters?: QAFilters
): Promise<QAResponse> {
  // TODO: replace with real Supabase + API route implementation via Cursor
  console.log(`[Mock] Asking question for ${entitySlug}:`, question, filters);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockResponse: QAResponse = {
        answer: `Based on the available corpus data for ${entitySlug}, here's what I found: ${question.includes("Tesla") ? "Tesla is focused on accelerating sustainable energy through electric vehicles and solar power. The company continues to innovate in manufacturing automation and battery technology." : question.includes("SpaceX") ? "SpaceX aims to make humanity a multi-planetary species. The company is developing Starship for Mars missions and continues to advance reusable rocket technology." : "This is a comprehensive answer based on multiple sources from videos, documents, and official communications. The information is drawn from reliable sources with high confidence levels."}`,
        citations: [
          {
            segmentId: "seg1",
            textSnippet: "Tesla's manufacturing process has been revolutionized through advanced automation...",
            corpusItem: {
              id: "1",
              title: "Elon Musk Interview at Tesla Gigafactory",
              primaryUrl: "https://youtube.com/watch?v=abc123",
              contentKind: "video",
              publishedAt: "2024-01-20T15:00:00Z",
              positionInfo: "00:12:35-00:13:10",
            },
          },
          {
            segmentId: "seg4",
            textSnippet: "The company's Q4 results show significant growth in production capacity and efficiency...",
            corpusItem: {
              id: "2",
              title: "Tesla Q4 2023 Annual Report",
              primaryUrl: "https://ir.tesla.com/2023-q4-report.pdf",
              contentKind: "document",
              publishedAt: "2024-01-15T00:00:00Z",
              positionInfo: "Page 12, Section 3.2",
            },
          },
          {
            segmentId: "seg7",
            textSnippet: "Future developments in Autopilot technology will leverage neural network improvements...",
            corpusItem: {
              id: "4",
              title: "Official Tesla Blog: Future of Autopilot",
              primaryUrl: "https://tesla.com/blog/autopilot-future",
              contentKind: "web_page",
              publishedAt: "2024-01-10T09:00:00Z",
              positionInfo: "Introduction, Paragraph 3",
            },
          },
        ],
        meta: {
          retrievedCount: 12,
          usedSegmentIds: ["seg1", "seg4", "seg7"],
          confidence: "high",
        },
      };
      
      resolve(mockResponse);
    }, 1500);
  });
}
