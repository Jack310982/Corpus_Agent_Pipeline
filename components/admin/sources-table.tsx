// components/admin/sources-table.tsx

"use client";

import { useState } from "react";
import { Plus } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { createSource, toggleSourceEnabled } from "@/lib/api/admin";
import type { Entity, Source, SourceKind, SourceOriginType } from "@/lib/types";

interface SourcesTableProps {
  initialSources: Source[];
  entities: Entity[];
}

export function SourcesTable({ initialSources, entities }: SourcesTableProps) {
  const [sources, setSources] = useState<Source[]>(initialSources);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<{
    name: string;
    kind: SourceKind;
    originType: SourceOriginType;
    entityId: string;
    configSummary: string;
    enabled: boolean;
  }>({
    name: "",
    kind: "video",
    originType: "youtube",
    entityId: "",
    configSummary: "",
    enabled: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newSource = await createSource({
        ...formData,
        entityId: formData.entityId || null,
      });
      setSources([...sources, newSource]);
      setOpen(false);
      setFormData({
        name: "",
        kind: "video",
        originType: "youtube",
        entityId: "",
        configSummary: "",
        enabled: true,
      });
      
      toast({
        title: "Success",
        description: "Source created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create source",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await toggleSourceEnabled(id, enabled);
      setSources(
        sources.map((s) => (s.id === id ? { ...s, enabled } : s))
      );
      
      toast({
        title: "Updated",
        description: `Source ${enabled ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update source",
        variant: "destructive",
      });
    }
  };

  const getEntityName = (entityId?: string | null) => {
    if (!entityId) return "Global";
    return entities.find((e) => e.id === entityId)?.name || "Unknown";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Sources</h2>
          <p className="text-sm text-muted-foreground">
            Configure data sources for corpus ingestion
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Source
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Source</DialogTitle>
                <DialogDescription>
                  Configure a new data source for corpus ingestion
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="YouTube Playlist"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entity">Entity</Label>
                    <Select
                      value={formData.entityId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, entityId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select entity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Global (No Entity)</SelectItem>
                        {entities.map((entity) => (
                          <SelectItem key={entity.id} value={entity.id}>
                            {entity.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kind">Kind *</Label>
                    <Select
                      value={formData.kind}
                      onValueChange={(value: SourceKind) =>
                        setFormData({ ...formData, kind: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="web_page">Web Page</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originType">Origin Type *</Label>
                    <Select
                      value={formData.originType}
                      onValueChange={(value: SourceOriginType) =>
                        setFormData({ ...formData, originType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="podcast">Podcast</SelectItem>
                        <SelectItem value="pdf_upload">PDF Upload</SelectItem>
                        <SelectItem value="web_url">Web URL</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="local_note">Local Note</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="configSummary">Config Summary *</Label>
                  <Input
                    id="configSummary"
                    value={formData.configSummary}
                    onChange={(e) =>
                      setFormData({ ...formData, configSummary: e.target.value })
                    }
                    placeholder="Playlist ID: PLx123456 / URL: https://..."
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, enabled: checked })
                    }
                  />
                  <Label htmlFor="enabled">Enable source</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Source"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Origin Type</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Config</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Ingest</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((source) => (
              <TableRow key={source.id}>
                <TableCell className="font-medium">{source.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{source.kind}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{source.originType}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {getEntityName(source.entityId)}
                </TableCell>
                <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                  {source.configSummary}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={source.enabled}
                    onCheckedChange={(checked) => handleToggle(source.id, checked)}
                  />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {source.lastIngestAt
                    ? new Date(source.lastIngestAt).toLocaleDateString()
                    : "Never"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
