import "server-only";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { isTokenId } from "./config";

export type Chog = {
  id: number;
  metaId: number;
  name: string;
  image: string; // "<cid>/<file>.webp"
  attributes: [string, string][];
};

type Snapshot = { version: string; contract: string; supply: number; tokens: Chog[] };

let cache: Snapshot | null = null;

export function snapshot(): Snapshot {
  if (!cache) {
    const file = path.join(process.cwd(), "data", "chogs.json");
    if (existsSync(file)) cache = JSON.parse(readFileSync(file, "utf8")) as Snapshot;
    else return partial();
  }
  return cache;
}

/** While scripts/snapshot.mjs is still running, serve what it has fetched so far. */
function partial(): Snapshot {
  const file = path.join(process.cwd(), "data", ".chogs-partial.json");
  const done: Record<string, { uri: string; name: string; image: string; attributes: [string, string][] }> = existsSync(file)
    ? JSON.parse(readFileSync(file, "utf8"))
    : {};
  const tokens = Object.entries(done)
    .map(([id, t]) => ({
      id: Number(id),
      metaId: Number(t.uri.match(/\/(\d+)\.json$/)?.[1] ?? 0),
      name: t.name,
      image: t.image.replace("ipfs://", ""),
      attributes: t.attributes,
    }))
    .sort((a, b) => a.id - b.id);
  const sparse: Chog[] = [];
  for (const t of tokens) sparse[t.id - 1] = t;
  return { version: "partial", contract: "", supply: 1969, tokens: sparse };
}

export function getChog(id: number): Chog | null {
  if (!isTokenId(id)) return null;
  return snapshot().tokens[id - 1] ?? null;
}

export const trait = (c: Chog, type: string) => c.attributes.find(([t]) => t === type)?.[1] ?? null;

/** Slim rows for the browse page: id plus the traits people filter by. */
export type ChogRow = { id: number; n: number; t: Record<string, string> };

export function rows(): ChogRow[] {
  return snapshot().tokens.filter(Boolean).map((c) => ({ id: c.id, n: c.metaId, t: Object.fromEntries(c.attributes) }));
}

export function traitIndex(): Record<string, [string, number][]> {
  const counts: Record<string, Record<string, number>> = {};
  for (const c of snapshot().tokens.filter(Boolean))
    for (const [k, v] of c.attributes) (counts[k] ??= {})[v] = ((counts[k] ??= {})[v] ?? 0) + 1;
  return Object.fromEntries(
    Object.entries(counts).map(([k, vs]) => [k, Object.entries(vs).sort((a, b) => b[1] - a[1])]),
  );
}

/** The number people read on the art and on OpenSea ("CHOG #1462" is token 1). */
export const label = (c: Chog) => `#${c.metaId}`;
