import type { Metadata } from "next";
import { ProofView } from "./proof-view";
import "../token.css";
import "./proof.css";

export const metadata: Metadata = { title: "The claim" };

export default function ProofPage() {
  return <ProofView />;
}
