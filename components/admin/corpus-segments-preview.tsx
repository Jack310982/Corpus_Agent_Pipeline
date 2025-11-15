// components/admin/corpus-segments-preview.tsx

"use client";

import { FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { SegmentPreview } from "@/lib/types";

interface CorpusSegmentsPreviewProps {
  segments: SegmentPreview[];
}

export function CorpusSegmentsPreview({ segments }: CorpusSegmentsPreviewProps) {
  if (segments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Segments Preview</CardTitle>
          <CardDescription>Text segments from this corpus item</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No segments available yet. Complete the pipeline steps above.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Segments Preview</CardTitle>
        <CardDescription>
          {segments.length} text segments from this corpus item
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {segments.map((segment, index) => (
              <div
                key={segment.id}
                className="rounded-lg border border-border bg-muted/30 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    Segment {index + 1}
                  </Badge>
                  {segment.positionInfo && (
                    <span className="text-xs font-mono text-muted-foreground">
                      {segment.positionInfo}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-foreground">
                  {segment.text}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
