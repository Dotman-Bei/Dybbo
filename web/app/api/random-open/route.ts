// A random Chog that is open by default (held by a wallet without code). With ?go=1 it
// redirects to that Chog's page, so links and the home page's buttons work without script.
import { isContract, ownerOf } from "@/lib/chain";
import { MAX_MINUTES, MIN_MINUTES, SUPPLY } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const exclude = new Set((url.searchParams.get("exclude") ?? "").split(",").map(Number));
  let id = 0;
  for (let i = 0; i < 12; i++) {
    const pick = 1 + Math.floor(Math.random() * SUPPLY);
    if (exclude.has(pick)) continue;
    try {
      if (!(await isContract(await ownerOf(pick)))) {
        id = pick;
        break;
      }
    } catch {}
  }
  if (!id) return Response.json({ error: "Couldn't reach Monad RPC" }, { status: 502 });
  if (url.searchParams.get("go")) {
    const m = Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Number(url.searchParams.get("minutes")) || 5));
    return Response.redirect(new URL(`/chog/${id}?minutes=${m}`, url), 307);
  }
  return Response.json({ id });
}
