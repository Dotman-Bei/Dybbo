import type { Metadata } from "next";
import { Possessions } from "./possessions";
import "../../token.css";
import "../me.css";

export const metadata: Metadata = { title: "My possessions" };

export default function PossessionsPage() {
  return <Possessions />;
}
