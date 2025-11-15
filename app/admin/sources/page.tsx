// app/admin/sources/page.tsx

import { fetchSources, fetchEntities } from "@/lib/api/admin";
import { SourcesTable } from "@/components/admin/sources-table";

export default async function SourcesPage() {
  const [sources, entities] = await Promise.all([
    fetchSources(),
    fetchEntities(),
  ]);

  return <SourcesTable initialSources={sources} entities={entities} />;
}
