import { getChog } from "@/lib/chogs";

export async function GET(_req: Request, ctx: RouteContext<"/api/chog/[id]">) {
  const { id } = await ctx.params;
  const chog = getChog(Number(id));
  if (!chog) return Response.json({ error: "Token ID must be between 1 and 1,969" }, { status: 404 });
  return Response.json(chog, { headers: { "cache-control": "public, max-age=3600" } });
}
