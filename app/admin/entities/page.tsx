// app/admin/entities/page.tsx

import { fetchEntities } from "@/lib/api/admin";
import { EntitiesTable } from "@/components/admin/entities-table";

export default async function EntitiesPage() {
  const entities = await fetchEntities();

  return <EntitiesTable initialEntities={entities} />;
}
