"use client";
// The minutes chosen on the home page's slider, shared with the CTA band below the FAQ.
import { useSyncExternalStore } from "react";

let minutes = 5;
const subs = new Set<() => void>();

export function setMinutes(m: number) {
  minutes = m;
  subs.forEach((f) => f());
}

export function useMinutes() {
  return useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => minutes,
    () => 5,
  );
}
