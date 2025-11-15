// app/admin/corpus/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CorpusPipelineSteps } from "@/components/admin/corpus-pipeline-steps";
import { CorpusSegmentsPreview } from "@/components/admin/corpus-segments-preview";
import { fetchCorpusItemById, fetchSegmentsPreview } from "@/lib/api/admin";
import type { CorpusItem, PipelineStepStatus, SegmentPreview } from "@/lib/types";

export default function CorpusItemPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [item, setItem] = useState<CorpusItem | null>(null);
  const [pipeline, setPipeline] = useState<PipelineStepStatus | null>(null);
  const [segments, setSegments] = useState<SegmentPreview[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [itemData, segmentsData] = await Promise.all([
        fetchCorpusItemById(id),
        fetchSegmentsPreview(id),
      ]);
      setItem(itemData);
      setPipeline(itemData.pipeline);
      setSegments(segmentsData);
    } catch (error) {
      console.error("Failed to load corpus item:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!item || !pipeline) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Corpus item not found</p>
        <Button onClick={() => router.push("/admin/corpus")} className="mt-4">
          Back to Corpus
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/corpus")}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Corpus
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {item.title}
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{item.contentKind}</Badge>
            <Badge variant="secondary">{item.originType}</Badge>
            {item.primaryUrl && (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-2 text-xs"
              >
                <a href={item.primaryUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" />
                  Open Source
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Corpus Item Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Language</dt>
              <dd className="mt-1 text-sm font-medium text-foreground uppercase">
                {item.language}
              </dd>
            </div>
            {item.publishedAt && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Published At
                </dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {new Date(item.publishedAt).toLocaleDateString()}
                </dd>
              </div>
            )}
            {item.reliabilityLevel && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Reliability Level
                </dt>
                <dd className="mt-1">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-2 rounded-full ${
                          i < item.reliabilityLevel!
                            ? "bg-green-600"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium text-foreground">
                      {item.reliabilityLevel}/5
                    </span>
                  </div>
                </dd>
              </div>
            )}
            {item.description && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">
                  Description
                </dt>
                <dd className="mt-1 text-sm text-foreground">{item.description}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Pipeline */}
      <CorpusPipelineSteps
        corpusItemId={id}
        initialPipeline={pipeline}
        onUpdate={loadData}
      />

      {/* Segments */}
      <CorpusSegmentsPreview segments={segments} />
    </div>
  );
}
