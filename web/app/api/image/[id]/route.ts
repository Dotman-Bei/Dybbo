// Cached Chog art (F-MD-04): Pinata first, then other gateways; resized once and kept on disk.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getChog } from "@/lib/chogs";

const GATEWAYS = ["https://gateway.pinata.cloud/ipfs/", "https://ipfs.filebase.io/ipfs/", "https://ipfs.io/ipfs/", "https://w3s.link/ipfs/"];
const WIDTHS = [96, 192, 384, 640, 1000];
const DIR = path.join(process.cwd(), ".cache", "images");
const inflight = new Map<string, Promise<Buffer>>();

// Public gateways rate-limit bursts; a browse page asks for 60 at once.
let active = 0;
const queue: (() => void)[] = [];
async function slot<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= 6) await new Promise<void>((r) => queue.push(r));
  active++;
  try {
    return await fn();
  } finally {
    active--;
    queue.shift()?.();
  }
}

async function original(id: number, cid: string): Promise<Buffer> {
  const file = path.join(DIR, `${id}-orig.webp`);
  try {
    return await readFile(file);
  } catch {}
  for (let attempt = 0; attempt < 10; attempt++) {
    const gw = GATEWAYS[attempt % GATEWAYS.length];
    try {
      const res = await slot(() => fetch(gw + cid, { signal: AbortSignal.timeout(20000) }));
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        await mkdir(DIR, { recursive: true });
        await writeFile(file, buf);
        return buf;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
  }
  throw new Error("gateways failed");
}

async function sized(id: number, cid: string, w: number): Promise<Buffer> {
  const file = path.join(DIR, `${id}-${w}.webp`);
  try {
    return await readFile(file);
  } catch {}
  const buf = await sharp(await original(id, cid)).resize(w, w).webp({ quality: 82 }).toBuffer();
  await writeFile(file, buf);
  return buf;
}

export async function GET(req: Request, ctx: RouteContext<"/api/image/[id]">) {
  const { id: raw } = await ctx.params;
  const chog = getChog(Number(raw));
  if (!chog) return new Response("No such Chog", { status: 404 });
  const asked = Number(new URL(req.url).searchParams.get("w") ?? 384);
  const w = WIDTHS.find((x) => x >= asked) ?? 1000;
  const key = `${chog.id}-${w}`;
  try {
    let p = inflight.get(key);
    if (!p) {
      p = sized(chog.id, chog.image, w).finally(() => inflight.delete(key));
      inflight.set(key, p);
    }
    const body = await p;
    return new Response(new Uint8Array(body), {
      headers: { "content-type": "image/webp", "cache-control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Image gateways failed", { status: 502 });
  }
}
