// Slim index of all 1,969 Chogs for the browse page, plus trait counts for its filters.
import { rows, snapshot, traitIndex } from "@/lib/chogs";

export const dynamic = "force-static";

export async function GET() {
  return Response.json({ version: snapshot().version, rows: rows(), traits: traitIndex() });
}
