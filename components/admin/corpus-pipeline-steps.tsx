// components/admin/corpus-pipeline-steps.tsx

"use client";

import { useState } from "react";
import { CheckCircle2, Circle, XCircle, Play, RotateCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  triggerImportText,
  triggerBuildSegments,
  triggerBuildEmbeddings,
} from "@/lib/api/admin";
import type { PipelineStepStatus } from "@/lib/types";

interface CorpusPipelineStepsProps {
  corpusItemId: string;
  initialPipeline: PipelineStepStatus;
  onUpdate: () => void;
}

export function CorpusPipelineSteps({
  corpusItemId,
  initialPipeline,
  onUpdate,
}: CorpusPipelineStepsProps) {
  const [pipeline, setPipeline] = useState(initialPipeline);
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTrigger = async (
    step: "import" | "segments" | "embeddings",
    action: () => Promise<void>
  ) => {
    setLoading(step);
    try {
      await action();
      onUpdate();
      toast({
        title: "Success",
        description: `${step === "import" ? "Text import" : step === "segments" ? "Segment building" : "Embeddings generation"} triggered successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to trigger ${step}`,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const steps = [
    {
      id: "import",
      title: "Text Imported",
      description: "Extract or transcribe text from source",
      completed: pipeline.textImported,
      action: () => handleTrigger("import", () => triggerImportText(corpusItemId)),
    },
    {
      id: "segments",
      title: "Segments Built",
      description: "Split text into semantic chunks",
      completed: pipeline.segmentsBuilt,
      disabled: !pipeline.textImported,
      action: () => handleTrigger("segments", () => triggerBuildSegments(corpusItemId)),
    },
    {
      id: "embeddings",
      title: "Embeddings Ready",
      description: "Generate vector embeddings for RAG",
      completed: pipeline.embeddingsReady,
      disabled: !pipeline.segmentsBuilt,
      action: () => handleTrigger("embeddings", () => triggerBuildEmbeddings(corpusItemId)),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Steps</CardTitle>
        <CardDescription>
          Processing stages for corpus item preparation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-border p-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : step.disabled ? (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Circle className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{step.title}</h4>
                    {step.completed && (
                      <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                        Complete
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
              <Button
                variant={step.completed ? "outline" : "default"}
                size="sm"
                disabled={step.disabled || loading === step.id}
                onClick={step.action}
              >
                {loading === step.id ? (
                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                ) : step.completed ? (
                  <RotateCw className="mr-2 h-4 w-4" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {step.completed ? "Rebuild" : "Build"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
