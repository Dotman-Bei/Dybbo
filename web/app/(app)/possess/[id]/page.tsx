import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChog } from "@/lib/chogs";
import { Session } from "./session";
import "../../token.css";

export const metadata: Metadata = { title: "Session" };

export default async function PossessPage(props: PageProps<"/possess/[id]">) {
  const { id } = await props.params;
  const chog = getChog(Number(id));
  if (!chog) notFound();
  return <Session chog={chog} />;
}
