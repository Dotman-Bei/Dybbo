import Link from "next/link";
import { TopBar } from "@/components/shell";
import { REPO_URL } from "@/lib/config";
import "@/app/(app)/app.css";

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <TopBar />
      <main className="canvas">{children}</main>
      <footer className="app-foot">
        <span>Unofficial community project for Chogathon 2026. Dybbo never asks for an NFT approval.</span>
        <nav aria-label="Footer">
          <Link href="/about">About</Link>
          <Link href="/proof">The claim</Link>
          <a href={REPO_URL}>Source</a>
        </nav>
      </footer>
    </div>
  );
}
