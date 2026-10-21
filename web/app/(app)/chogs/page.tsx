import type { Metadata } from "next";
import { Browse } from "./browse";
import "./chogs.css";

export const metadata: Metadata = { title: "Chogs" };

export default function ChogsPage() {
  return <Browse />;
}
