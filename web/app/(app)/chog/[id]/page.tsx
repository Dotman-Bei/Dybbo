import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChog } from "@/lib/chogs";
import { TokenView } from "./token-view";
import "../../token.css";

export async function generateMetadata(props: PageProps<"/chog/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const c = getChog(Number(id));
  return { title: c ? c.name.replace("CHOG", "Chog") : "No Chog lives here" };
}

export default async function ChogPage(props: PageProps<"/chog/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const chog = getChog(Number(id));
  if (!chog) notFound();
  const minutes = Number(Array.isArray(sp.minutes) ? sp.minutes[0] : sp.minutes) || 5;
  const strike = Number(Array.isArray(sp.strike) ? sp.strike[0] : sp.strike) || undefined;
  return <TokenView chog={chog} initialMinutes={minutes} strike={strike} />;
}
