// components/layout/admin-sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Database, FileText, Layers, Settings } from 'lucide-react';
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const navigation = [
  {
    name: "Entities",
    href: "/admin/entities",
    icon: Database,
  },
  {
    name: "Sources",
    href: "/admin/sources",
    icon: FileText,
  },
  {
    name: "Corpus",
    href: "/admin/corpus",
    icon: Layers,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Layers className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Corpus Factory</h1>
            <p className="text-xs text-muted-foreground">Admin Console</p>
          </div>
        </Link>
      </div>
      
      <Separator />
      
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      
      <Separator />
      
      <div className="p-4">
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Mock Data Mode
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Connect to Supabase to use real data
          </p>
        </div>
      </div>
    </div>
  );
}
