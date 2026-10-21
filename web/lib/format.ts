import { WEI } from "./config";

/** MON with fixed decimals; trailing zeros kept to the metric's precision. */
export function mon(wei: bigint, decimals = 2): string {
  const neg = wei < 0n;
  const abs = neg ? -wei : wei;
  const scale = 10n ** BigInt(decimals);
  const rounded = (abs * scale + WEI / 2n) / WEI;
  const whole = rounded / scale;
  const frac = (rounded % scale).toString().padStart(decimals, "0");
  const w = whole.toLocaleString("en-US");
  return `${neg ? "-" : ""}${decimals ? `${w}.${frac}` : w}`;
}

/** Price per minute: three decimals when the holder set something below 0.01. */
export function price(wei: bigint): string {
  return wei % (WEI / 100n) === 0n ? mon(wei, 2) : mon(wei, 3);
}

export const shortAddr = (a?: string | null) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "—");

export function clock(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export function timeOfDay(unix: number): string {
  const d = new Date(unix * 1000);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function ago(unix: number, now = Date.now() / 1000): string {
  const s = Math.max(0, Math.floor(now - unix));
  if (s < 60) return s <= 5 ? "just now" : `${s} s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  return `${h} h ago`;
}

export const thousands = (n: number) => n.toLocaleString("en-US");
