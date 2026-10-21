"use client";

import type { Status } from "@/lib/dybbo";
import { clock } from "@/lib/format";

export function StatusPill({ s, now }: { s: Status | undefined; now: number }) {
  if (!s) return <span className="pill skel" style={{ width: 56 }}>Open</span>;
  if (s.closed) return <span className="pill pill--closed">Closed</span>;
  if (s.leased && s.until > now) return <span className="pill pill--held num">Possessed · {clock(s.until - now)}</span>;
  return <span className="pill pill--open">Open</span>;
}
