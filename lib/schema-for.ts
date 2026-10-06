import { SCHEMA } from "@/lib/league-schema";
import { EXTRA_SCHEMA } from "@/lib/practice-schemas";

/**
 * Only the tables a question touches, so the schema panel stays short. Its
 * own small module so a client screen can show a question's tables without
 * importing the bank (lib/questions.ts re-exports it).
 */
export function schemaFor(q: { tables: string[] }) {
  return [...SCHEMA, ...EXTRA_SCHEMA].filter((t) => q.tables.includes(t.table));
}
