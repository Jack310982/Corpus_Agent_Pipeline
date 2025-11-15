// components/admin/corpus-table.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { CorpusItem, Entity, ContentKind } from "@/lib/types";

interface CorpusTableProps {
  initialItems: CorpusItem[];
  entities: Entity[];
}

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  text_imported: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  segments_ready: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  embedded: "bg-green-500/10 text-green-700 dark:text-green-400",
  failed: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export function CorpusTable({ initialItems, entities }: CorpusTableProps) {
  const [items, setItems] = useState<CorpusItem[]>(initialItems);
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [kindFilter, setKindFilter] = useState<string>("all");

  const getEntityName = (entityId?: string | null) => {
    if (!entityId) return "—";
    return entities.find((e) => e.id === entityId)?.name || "Unknown";
  };

  const filteredItems = items.filter((item) => {
    if (entityFilter !== "all" && item.entityId !== entityFilter) return false;
    if (kindFilter !== "all" && item.contentKind !== kindFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Corpus</h2>
        <p className="text-sm text-muted-foreground">
          Unified text corpus items from all sources
        </p>
      </div>

      <div className="flex gap-3">
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Entities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {entities.map((entity) => (
              <SelectItem key={entity.id} value={entity.id}>
                {entity.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={kindFilter} onValueChange={setKindFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="document">Document</SelectItem>
            <SelectItem value="web_page">Web Page</SelectItem>
            <SelectItem value="social">Social</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Content Kind</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="max-w-xs">
                  <div className="font-medium">{item.title}</div>
                  {item.description && (
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {getEntityName(item.entityId)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.contentKind}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.originType}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={statusColors[item.status]}
                    variant="secondary"
                  >
                    {item.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.publishedAt
                    ? new Date(item.publishedAt).toLocaleDateString()
                    : "—"}
                </TableCell>
                <TableCell>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/corpus/${item.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
