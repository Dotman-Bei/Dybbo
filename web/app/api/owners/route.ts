// Live holders of every Chog and whether each holder is a contract. Cached for 30 s.
import { ownersRange } from "@/lib/chain";
import { SUPPLY } from "@/lib/config";

type Row = { id: number; owner: string; ownerIsContract: boolean };
let cache: { at: number; rows: Row[] } | null = null;
let pending: Promise<Row[]> | null = null;

function refresh() {
  pending ??= ownersRange(1, SUPPLY)
    .then((rows) => {
      cache = { at: Date.now(), rows };
      return rows;
    })
    .finally(() => (pending = null));
  return pending;
}

/** Stale-while-revalidate: answer from the last read at once, refresh behind it. */
async function load(): Promise<Row[]> {
  if (cache) {
    if (Date.now() - cache.at > 30_000) refresh().catch(() => {});
    return cache.rows;
  }
  return refresh();
}

export async function GET() {
  try {
    const rows = await load();
    return Response.json({ at: cache?.at ?? Date.now(), rows }, { headers: { "cache-control": "public, max-age=15" } });
  } catch {
    return Response.json({ error: "Couldn't reach Monad RPC" }, { status: 502 });
  }
}
