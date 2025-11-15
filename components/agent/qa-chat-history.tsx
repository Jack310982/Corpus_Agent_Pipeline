// components/agent/qa-chat-history.tsx

"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { QAResponse } from "@/lib/types";

interface Message {
  type: "question" | "answer";
  content: string;
  response?: QAResponse;
}

interface QAChatHistoryProps {
  messages: Message[];
}

export function QAChatHistory({ messages }: QAChatHistoryProps) {
  const [expandedCitations, setExpandedCitations] = useState<Set<number>>(
    new Set()
  );

  const toggleCitations = (index: number) => {
    const newExpanded = new Set(expandedCitations);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCitations(newExpanded);
  };

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">
            Ask your first question
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Get answers based on verified corpus data
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-6">
        {messages.map((message, index) => {
          if (message.type === "question") {
            return (
              <div key={index} className="flex justify-end">
                <div className="max-w-2xl rounded-2xl bg-primary px-5 py-3 text-primary-foreground">
                  <p className="leading-relaxed">{message.content}</p>
                </div>
              </div>
            );
          }

          const response = message.response!;
          const isExpanded = expandedCitations.has(index);

          return (
            <div key={index} className="flex justify-start">
              <div className="max-w-3xl space-y-4">
                <div className="rounded-2xl bg-muted px-5 py-4">
                  <p className="leading-relaxed text-foreground">{message.content}</p>
                </div>

                {response.citations.length > 0 && (
                  <div className="rounded-lg border border-border bg-card">
                    <button
                      onClick={() => toggleCitations(index)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {response.citations.length} Citations
                        </span>
                        <Badge
                          variant={
                            response.meta.confidence === "high"
                              ? "default"
                              : response.meta.confidence === "medium"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {response.meta.confidence} confidence
                        </Badge>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border px-4 py-3">
                        <div className="space-y-3">
                          {response.citations.map((citation, citIndex) => (
                            <div
                              key={citIndex}
                              className="rounded-lg border border-border bg-muted/30 p-3"
                            >
                              <div className="mb-2 flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="text-sm font-medium text-foreground">
                                    {citation.corpusItem.title}
                                  </h4>
                                  <div className="mt-1 flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {citation.corpusItem.contentKind}
                                    </Badge>
                                    {citation.corpusItem.positionInfo && (
                                      <span className="text-xs font-mono text-muted-foreground">
                                        {citation.corpusItem.positionInfo}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {citation.corpusItem.primaryUrl && (
                                  <Button
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className="shrink-0"
                                  >
                                    <a
                                      href={citation.corpusItem.primaryUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Open
                                    </a>
                                  </Button>
                                )}
                              </div>
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                {citation.textSnippet}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
