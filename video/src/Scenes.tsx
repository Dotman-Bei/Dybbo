import React from "react";
import { Img, staticFile } from "remotion";
import { C, FONT, MONO, clamp01, easeInOut, easeOut, ramp, rise } from "./theme";

// Each scene takes t, the time in seconds from the start of the video.
const center: React.CSSProperties = { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" };
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
// A deterministic shuffle, so every render staggers the same way.
const jitter = (i: number) => ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;

// ---------------------------------------------------------------- 1-2: the wall of Chogs
export function Wall({ t }: { t: number }) {
  const cols = 12, size = 164, gap = 14, step = size + gap;
  const drift = ramp(t, 0, 9, (x) => x) * 40;
  const zoom = 1.06 - 0.06 * ramp(t, 0, 9, easeOut);
  // "Everyone else watches": the wall goes quiet.
  const quiet = ramp(t, 6.8, 1.4, easeInOut);
  const count = ramp(t, 0.5, 1.9);
  const words = 1 - ramp(t, 6.5, 0.5);
  return (
    <div style={{ position: "absolute", inset: 0, background: C.night, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: (1920 - cols * step) / 2, top: (1080 - 8 * step) / 2 - drift, transform: `scale(${zoom})`, transformOrigin: "50% 50%", display: "grid", gridTemplateColumns: `repeat(${cols}, ${size}px)`, gap }}>
        {Array.from({ length: 96 }, (_, i) => (
          <Img key={i} src={staticFile(`chogs/${i}.webp`)} style={{ width: size, height: size, borderRadius: 12, opacity: ramp(t, jitter(i) * 0.7, 0.5) * (1 - 0.75 * quiet), filter: `saturate(${1 - 0.7 * quiet})` }} />
        ))}
      </div>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(52% 48% at 50% 50%, rgba(12,31,23,${0.9 * words}) 0%, rgba(12,31,23,${0.45 * words + 0.2}) 100%)` }} />
      <div style={{ ...center, opacity: words }}>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 210, letterSpacing: -6, color: C.slime, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{fmt(1969 * count)}</div>
        <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 38, color: C.ink, marginTop: 22, ...rise(t, 1.3) }}>Chog Genesis</div>
        <div style={{ fontFamily: FONT, fontWeight: 400, fontSize: 30, color: C.inkMuted, marginTop: 12, ...rise(t, 3.9) }}>owned by fewer than 1,000 people</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 3: the old way
const CALL: [string, string][] = [
  ["setApprovalForAll", C.ink],
  ["(", C.inkMuted],
  ["operator", C.inkMuted],
  [", ", C.inkMuted],
  ["true", C.slime],
  [")", C.inkMuted],
];
function Call({ chars, caret, strike = 0, size = 64 }: { chars: number; caret?: boolean; strike?: number; size?: number }) {
  let left = chars;
  return (
    <div style={{ position: "relative", fontFamily: MONO, fontSize: size, whiteSpace: "pre" }}>
      {CALL.map(([s, color], i) => {
        const shown = s.slice(0, Math.max(0, left));
        left -= s.length;
        return <span key={i} style={{ color }}>{shown}</span>;
      })}
      <span style={{ color: "transparent" }}>{CALL.map(([s]) => s).join("").slice(chars)}</span>
      {caret && <span style={{ position: "absolute", top: "8%", height: "84%", width: 4, background: C.slime, left: `${chars * 0.55}em` }} />}
      {strike > 0 && <div style={{ position: "absolute", left: -12, top: "52%", height: 5, borderRadius: 3, width: `calc(${strike} * (100% + 24px))`, background: C.slime }} />}
    </div>
  );
}
const TOTAL = CALL.map(([s]) => s).join("").length;

export function Approval({ t }: { t: number }) {
  const chars = Math.floor(TOTAL * clamp01((t - 9.5) / 1.9));
  const blink = t > 11.4 ? Math.floor((t - 11.4) * 2.2) % 2 === 0 : true;
  // "...lets a contract move every NFT you own": the wallet's Chogs slide away together.
  const take = (i: number) => easeInOut(clamp01((t - 12.4 - i * 0.06) / 1.0));
  return (
    <div style={{ position: "absolute", inset: 0, background: C.night }}>
      <div style={{ ...center, gap: 90 }}>
        <Call chars={chars} caret={blink && t < 12.4} />
        <div style={{ display: "flex", gap: 18, ...rise(t, 10.6, 0.7) }}>
          {Array.from({ length: 7 }, (_, i) => (
            <Img key={i} src={staticFile(`chogs/${40 + i}.webp`)} style={{ width: 132, height: 132, borderRadius: 12, transform: `translateX(${take(6 - i) * 1500}px)`, opacity: 1 - take(6 - i) * 0.6 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 4: the sweep
function Figure({ t, at, n, label }: { t: number; at: number; n: number; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", ...rise(t, at, 0.5) }}>
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 170, letterSpacing: -5, color: C.ink, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{fmt(n * ramp(t, at, 1.2))}</div>
      <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 36, color: C.inkMuted, marginTop: 16 }}>{label}</div>
    </div>
  );
}
export function Sweep({ t }: { t: number }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: C.night }}>
      <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: 0.55 * ramp(t, 15.6, 0.6) }}>
        <Call chars={TOTAL} size={34} />
      </div>
      <div style={{ ...center, flexDirection: "row", gap: 180, top: 60 }}>
        <Figure t={t} at={19.0} n={3033} label="wallets" />
        <Figure t={t} at={20.5} n={25994} label="NFTs taken" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 5: none of that
export function None({ t }: { t: number }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: C.night }}>
      <div style={{ ...center, opacity: 1 - 0.65 * ramp(t, 24.7, 0.6) }}>
        <Call chars={TOTAL} strike={ramp(t, 24.05, 0.55, easeInOut)} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 6 and 14: the mark
const D = "M18 8H32A24 24 0 0 1 32 56H18A4 4 0 0 1 14 52V12A4 4 0 0 1 18 8Z";
const WISP = "M25 27A9.5 9.5 0 0 1 44 27V34C44 41 39 45 32 45.5L25 46Z";
export function Lockup({ t, at, size = 190, instant = false }: { t: number; at: number; size?: number; instant?: boolean }) {
  const p = (d: number, len: number) => (instant ? 1 : ramp(t, at + d, len));
  const d = p(0, 0.5), wisp = p(0.22, 0.55), eye = instant ? 1 : easeOut(clamp01((t - at - 0.7) / 0.16)), word = p(0.7, 0.6);
  const wordW = size * 2.15;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.1 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" style={{ opacity: d, transform: `scale(${0.94 + 0.06 * d})` }}>
        <path d={D} fill={C.slime} />
        <path d={WISP} fill={C.night} style={{ transformBox: "fill-box", transformOrigin: "50% 100%", transform: `translateY(${(1 - wisp) * 4}px) scale(${0.55 + 0.45 * wisp})`, opacity: wisp }} />
        <circle cx={36.5} cy={27.8} r={2.9} fill={C.slime} style={{ transformBox: "fill-box", transformOrigin: "50% 50%", transform: `scaleY(${eye})` }} />
      </svg>
      <div style={{ width: wordW, overflow: "hidden", clipPath: `inset(0 ${(1 - word) * 100}% 0 0)` }}>
        <Img src={staticFile("brand/dybbo-wordmark-white.svg")} style={{ width: wordW, display: "block", transform: `translateX(${(1 - word) * -16}px)` }} />
      </div>
    </div>
  );
}

export function Logo({ t }: { t: number }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: C.night }}>
      <div style={{ ...center, gap: 44 }}>
        <Lockup t={t} at={25.6} />
        <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 46, color: C.ink, ...rise(t, 26.75, 0.7) }}>Possess any Chog.</div>
      </div>
    </div>
  );
}

export function End({ t }: { t: number }) {
  const flash = 1 - clamp01((t - 88.4) / 0.2);
  return (
    <div style={{ position: "absolute", inset: 0, background: C.night }}>
      <div style={{ ...center, gap: 54, top: -30 }}>
        <Lockup t={t} at={88.4} instant />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 40, color: C.slime, ...rise(t, 89.2) }}>dybbo.vercel.app</div>
          <div style={{ fontFamily: FONT, fontWeight: 400, fontSize: 26, color: C.inkMuted, ...rise(t, 89.6) }}>Built on Monad for Chogathon 2026</div>
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, background: C.slime, opacity: 0.35 * flash }} />
    </div>
  );
}
