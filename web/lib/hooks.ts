"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Address } from "viem";
import { useAccount, useBalance } from "wagmi";
import { ownerOf } from "./chain";
import { PREVIEW } from "./config";
import { dybbo, type Status } from "./dybbo";

export type OwnerRow = { id: number; owner: Address; ownerIsContract: boolean };
export type ChogIndex = { version: string; rows: { id: number; n: number; t: Record<string, string> }[]; traits: Record<string, [string, number][]> };

/** Seconds since epoch, ticking. 250ms keeps a m:ss countdown honest without busy rendering. */
export function useNow(ms = 250) {
  const [now, setNow] = useState(() => Date.now() / 1000);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now() / 1000), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

const PREVIEW_KEY = "dybbo.previewWallet";
function previewWallet(): Address | null {
  if (typeof window === "undefined" || !PREVIEW) return null;
  try {
    let a = window.localStorage.getItem(PREVIEW_KEY);
    if (!a) {
      const bytes = crypto.getRandomValues(new Uint8Array(20));
      a = "0x" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
      window.localStorage.setItem(PREVIEW_KEY, a);
    }
    return a as Address;
  } catch {
    return null;
  }
}
const noop = () => () => {};

/** Who acts: the connected wallet, or in preview mode a local preview wallet. */
export function useActor() {
  const { address, isConnected, chainId } = useAccount();
  const preview = useSyncExternalStore(noop, previewWallet, () => null);
  const actor = (address ?? (PREVIEW ? preview : null)) as Address | null;
  return { actor, connected: isConnected, wrongChain: isConnected && chainId !== 143, isPreviewWallet: !address && !!actor };
}

export function useMonBalance(addr: Address | null) {
  const { data } = useBalance({ address: addr ?? undefined, query: { enabled: !!addr && !PREVIEW } });
  return data?.value ?? null;
}

export function useChogIndex() {
  return useQuery({
    queryKey: ["chogs"],
    queryFn: async (): Promise<ChogIndex> => (await fetch("/api/chogs")).json(),
    staleTime: Infinity,
  });
}

export function useOwners() {
  return useQuery({
    queryKey: ["owners"],
    queryFn: async (): Promise<{ at: number; rows: OwnerRow[] }> => {
      const res = await fetch("/api/owners");
      if (!res.ok) throw new Error("Couldn't reach Monad RPC");
      return res.json();
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useStatuses() {
  const owners = useOwners();
  const q = useQuery({
    queryKey: ["dybbo", "status", owners.data?.at],
    enabled: !!owners.data,
    queryFn: () => dybbo.status(owners.data!.rows),
    refetchInterval: 15_000,
  });
  return { ...q, ownersAt: owners.data?.at, error: owners.error ?? q.error, isLoading: owners.isLoading || q.isLoading };
}

export function useOwner(id: number) {
  return useQuery({ queryKey: ["owner", id], queryFn: () => ownerOf(id), staleTime: 10_000, refetchInterval: 20_000 });
}

export function useStatus(id: number): { data: Status | undefined; isLoading: boolean; error: unknown } {
  const owner = useOwner(id);
  const q = useQuery({
    queryKey: ["dybbo", "status1", id, owner.data],
    enabled: !!owner.data,
    queryFn: async () => {
      const contract = await import("./chain").then((m) => m.isContract(owner.data!));
      return (await dybbo.status([{ id, owner: owner.data!, ownerIsContract: contract }]))[0];
    },
    refetchInterval: 10_000,
  });
  return { data: q.data, isLoading: owner.isLoading || q.isLoading, error: owner.error ?? q.error };
}

export const useLease = (id: number) => useQuery({ queryKey: ["dybbo", "lease", id], queryFn: () => dybbo.leaseOf(id), refetchInterval: 5_000 });
export const useTerms = (id: number) => useQuery({ queryKey: ["dybbo", "terms", id], queryFn: () => dybbo.termsOf(id) });
export const useEscrow = (id: number) => useQuery({ queryKey: ["dybbo", "escrow", id], queryFn: () => dybbo.escrowOf(id) });
export const useMarks = (id: number) => useQuery({ queryKey: ["dybbo", "marks", id], queryFn: () => dybbo.marksOf(id), refetchInterval: 15_000 });
export const useActivity = () => useQuery({ queryKey: ["dybbo", "activity"], queryFn: () => dybbo.recentActivity(), refetchInterval: 10_000 });
export const useStats = () => useQuery({ queryKey: ["dybbo", "stats"], queryFn: () => dybbo.stats(), refetchInterval: 15_000 });
export const useLastHaunt = (id: number) => useQuery({ queryKey: ["dybbo", "lastHaunt", id], queryFn: () => dybbo.lastHauntAt(id) });
