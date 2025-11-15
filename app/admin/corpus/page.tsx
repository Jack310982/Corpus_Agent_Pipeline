// app/admin/corpus/page.tsx

import { fetchCorpusItems, fetchEntities } from "@/lib/api/admin";
import { CorpusTable } from "@/components/admin/corpus-table";

export default async function CorpusPage() {
  const [items, entities] = await Promise.all([
    fetchCorpusItems(),
    fetchEntities(),
  ]);

  return <CorpusTable initialItems={items} entities={entities} />;
}
