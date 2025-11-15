// app/page.tsx

import Link from "next/link";
import { ArrowRight, Database, Layers, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Layers className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Corpus Factory</span>
          </div>
          <nav className="flex gap-2">
            <Button asChild variant="ghost">
              <Link href="/admin">Admin</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/agent/elon-musk">Agent Demo</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Unified Text Corpus Factory
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Transform multi-source data into structured text corpus for powerful RAG-based
            question answering. Manage videos, documents, podcasts, and social media in one
            unified pipeline.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/admin">
                Open Admin Console
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/agent/elon-musk">Try Agent Demo</Link>
            </Button>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-24">
          <div className="container mx-auto px-6">
            <h2 className="text-center text-3xl font-bold text-foreground">
              Platform Features
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <Database className="mb-2 h-10 w-10 text-primary" />
                  <CardTitle>Multi-Source Ingestion</CardTitle>
                  <CardDescription>
                    Connect YouTube, podcasts, PDFs, web pages, and social media
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Configure data sources once and automatically ingest new content as it
                    becomes available.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Layers className="mb-2 h-10 w-10 text-primary" />
                  <CardTitle>Unified Pipeline</CardTitle>
                  <CardDescription>
                    Text extraction, segmentation, and vectorization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    All content flows through a consistent pipeline: import, segment, and
                    embed for optimal RAG performance.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <MessageSquare className="mb-2 h-10 w-10 text-primary" />
                  <CardTitle>RAG Q&A Interface</CardTitle>
                  <CardDescription>
                    Ask questions with cited, trustworthy answers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Get AI-powered answers backed by specific citations from your verified
                    corpus data.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Corpus Factory - Unified Text Corpus Management Platform</p>
          <p className="mt-2">Built with Next.js, TypeScript, and Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}
