// app/agent/[entitySlug]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from 'next/navigation';
import { Bot, Calendar, FileType, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QAChatHistory } from "@/components/agent/qa-chat-history";
import { QAInputBox } from "@/components/agent/qa-input-box";
import { fetchEntityBySlug, askQuestion } from "@/lib/api/agent";
import type { Entity, QAResponse } from "@/lib/types";

interface Message {
  type: "question" | "answer";
  content: string;
  response?: QAResponse;
}

export default function AgentPage() {
  const params = useParams();
  const slug = params.entitySlug as string;

  const [entity, setEntity] = useState<Entity | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);

  // Filter states (for future implementation)
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [reliabilityFilter, setReliabilityFilter] = useState<string>("all");

  useEffect(() => {
    const loadEntity = async () => {
      try {
        const data = await fetchEntityBySlug(slug);
        setEntity(data);
      } catch (error) {
        console.error("Failed to load entity:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEntity();
  }, [slug]);

  const handleAskQuestion = async (question: string) => {
    setAsking(true);

    // Add user question
    setMessages((prev) => [...prev, { type: "question", content: question }]);

    try {
      const response = await askQuestion(slug, question);
      
      // Add answer
      setMessages((prev) => [
        ...prev,
        { type: "answer", content: response.answer, response },
      ]);
    } catch (error) {
      console.error("Failed to get answer:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "answer",
          content: "Sorry, I encountered an error while processing your question.",
          response: {
            answer: "Error occurred",
            citations: [],
            meta: {
              retrievedCount: 0,
              usedSegmentIds: [],
              confidence: "low",
            },
          },
        },
      ]);
    } finally {
      setAsking(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl p-6 lg:p-8">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="mt-6 h-96 w-full" />
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Entity not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto max-w-6xl px-6 py-6 lg:px-8">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={entity.avatarUrl || "/placeholder.svg"} alt={entity.name} />
              <AvatarFallback className="text-lg">
                {entity.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{entity.name}</h1>
                <Badge variant="secondary" className="gap-1">
                  <Bot className="h-3 w-3" />
                  Corpus Agent
                </Badge>
              </div>
              {entity.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {entity.description}
                </p>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex gap-3">
            <Select value={kindFilter} onValueChange={setKindFilter}>
              <SelectTrigger className="w-48">
                <FileType className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All Content Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Content Types</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="web_page">Web Page</SelectItem>
                <SelectItem value="social">Social</SelectItem>
              </SelectContent>
            </Select>

            <Select value={reliabilityFilter} onValueChange={setReliabilityFilter}>
              <SelectTrigger className="w-48">
                <Star className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All Reliability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reliability</SelectItem>
                <SelectItem value="5">Level 5 Only</SelectItem>
                <SelectItem value="4">Level 4+</SelectItem>
                <SelectItem value="3">Level 3+</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Filters coming soon
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto flex h-full max-w-6xl flex-col px-6 py-6 lg:px-8">
          <div className="flex-1 overflow-hidden">
            <QAChatHistory messages={messages} />
          </div>

          {/* Input Box */}
          <div className="mt-6">
            <QAInputBox onSubmit={handleAskQuestion} loading={asking} />
          </div>
        </div>
      </div>
    </div>
  );
}
