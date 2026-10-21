"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useNames } from "@/components/haunt-panel";

/** A live open Chog to test with; falls back to the random redirect without script. */
export function SuggestedChog() {
  const names = useNames();
  const { data } = useQuery({
    queryKey: ["suggested"],
    queryFn: async () => (await (await fetch("/api/random-open")).json()) as { id: number },
    staleTime: Infinity,
  });
  if (!data?.id || !names.ready)
    return <a className="btn btn--primary" href="/api/random-open?go=1&minutes=1">Possess a Chog for 1 minute</a>;
  return (
    <Link className="btn btn--primary" href={`/chog/${data.id}?minutes=1`}>
      Possess #{names.n(data.id)} for 1 minute
    </Link>
  );
}
