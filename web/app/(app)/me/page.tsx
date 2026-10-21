import type { Metadata } from "next";
import { Holder } from "./holder";
import "../token.css";
import "./me.css";

export const metadata: Metadata = { title: "My Chogs" };

export default async function MePage(props: PageProps<"/me">) {
  const sp = await props.searchParams;
  const address = typeof sp.address === "string" && /^0x[0-9a-fA-F]{40}$/.test(sp.address) ? sp.address : null;
  return <Holder viewAddress={address as `0x${string}` | null} />;
}
