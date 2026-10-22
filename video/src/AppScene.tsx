import React from "react";
import { Img, staticFile } from "remotion";
import { CAMERA, CURSOR, RAMP, SHOTS, urlFor, type CamCue } from "./timeline";
import { C, FONT, clamp01, easeInOut, easeOut } from "./theme";

// The product in a browser window floating on deep green. The camera and cursor move in the
// window's own coordinates (the 1440x900 viewport the shots were taken at).
const W = 1440, H = 900, BAR = 40;
const WX = (1920 - W) / 2, WY = (1080 - (H + BAR)) / 2;
const OVERSCROLL = 160; // how far past the window's edge the camera may frame when zoomed

function shotAt(t: number): { shot: string; prev?: string; mix: number } {
  if (t >= RAMP.t0 && t < RAMP.t1) {
    // Speed-ramp: an even, fast tick through every captured second, so no step reads as a dropped frame.
    const p = clamp01((t - RAMP.t0) / (RAMP.t1 - RAMP.t0));
    return { shot: RAMP.shots[Math.min(RAMP.shots.length - 1, Math.floor(p * RAMP.shots.length))], mix: 1 };
  }
  let i = -1;
  for (let k = 0; k < SHOTS.length; k++) if (SHOTS[k].t <= t) i = k;
  if (i < 0) return { shot: SHOTS[0].shot, mix: 1 };
  const cue = SHOTS[i];
  if (cue.t < RAMP.t0 && t >= RAMP.t1) return { shot: RAMP.shots[RAMP.shots.length - 1], mix: 1 };
  const prev = i > 0 ? (SHOTS[i - 1].t < RAMP.t0 && cue.t >= RAMP.t1 ? RAMP.shots[RAMP.shots.length - 1] : SHOTS[i - 1].shot) : undefined;
  // State changes in the app are instant; a 2-frame blend keeps them from popping. Page cuts dissolve.
  const fade = cue.fade ?? 0.07;
  return { shot: cue.shot, prev, mix: clamp01((t - cue.t) / fade) };
}

function cameraAt(t: number): CamCue {
  let settled: CamCue = CAMERA[0];
  for (let k = 1; k < CAMERA.length; k++) {
    const c = CAMERA[k];
    if (c.t > t) break;
    if (c.cut || !c.d) {
      settled = c;
      continue;
    }
    const p = easeInOut(clamp01((t - c.t) / c.d));
    settled = { t: c.t, x: settled.x + (c.x - settled.x) * p, y: settled.y + (c.y - settled.y) * p, z: settled.z + (c.z - settled.z) * p };
  }
  return settled;
}

function cursorAt(t: number) {
  let i = 0;
  for (let k = 0; k < CURSOR.length; k++) if (CURSOR[k].t <= t) i = k;
  const a = CURSOR[i], b = CURSOR[i + 1];
  let x = a.x, y = a.y;
  if (b) {
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const dur = Math.max(0.45, Math.min(1.0, dist / 900));
    const p = clamp01((t - (b.t - dur)) / dur);
    if (p > 0) {
      const e = easeInOut(p);
      // A slight arc, as a hand moves; never a straight robotic line.
      const nx = -(b.y - a.y) / (dist || 1), ny = (b.x - a.x) / (dist || 1);
      const bow = Math.min(60, dist * 0.1);
      x = a.x + (b.x - a.x) * e + nx * bow * Math.sin(Math.PI * e);
      y = a.y + (b.y - a.y) * e + ny * bow * Math.sin(Math.PI * e);
    }
  }
  // The most recent click, for the press and the ring.
  let since = Infinity, at = { x: 0, y: 0 };
  for (const c of CURSOR) if (c.click && c.t <= t) (since = t - c.t), (at = c);
  return { x, y, since, at };
}

function Shot({ name, opacity }: { name: string; opacity: number }) {
  return <Img src={staticFile(`shots/${name}.png`)} style={{ position: "absolute", inset: 0, width: W, height: H, opacity }} />;
}

function Cursor({ x, y, press }: { x: number; y: number; press: number }) {
  return (
    <svg width={26} height={26} viewBox="0 0 26 26" style={{ position: "absolute", left: x - 3, top: y - 2, transform: `scale(${1 - 0.12 * press})`, transformOrigin: "3px 2px", filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))" }}>
      <path d="M3 2 L3 20 L7.8 15.6 L11 23 L14.4 21.5 L11.3 14.3 L17.8 14.3 Z" fill="#0c1f17" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  );
}

export function AppScene({ t }: { t: number }) {
  const { shot, prev, mix } = shotAt(t);
  const cam = cameraAt(t);
  const cur = cursorAt(t);

  // Frame the focus point, clamped so the window stays in frame (with a little overscroll).
  const z = cam.z;
  const fit = (want: number, lo: number, hi: number) => (lo > hi ? (lo + hi) / 2 : Math.max(lo, Math.min(hi, want)));
  const fx = fit(WX + cam.x, WX + 960 / z - (z > 1 ? OVERSCROLL : 0), WX + W - 960 / z + (z > 1 ? OVERSCROLL : 0));
  const fy = fit(WY + BAR + cam.y, WY + 540 / z - (z > 1 ? OVERSCROLL / 2 : 0), WY + BAR + H - 540 / z + (z > 1 ? OVERSCROLL : 0));

  const press = cur.since < 0.08 ? cur.since / 0.08 : cur.since < 0.2 ? 1 - (cur.since - 0.08) / 0.12 : 0;
  const ring = cur.since < 0.45 ? easeOut(cur.since / 0.45) : -1;

  return (
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 90% at 50% 45%, ${C.nightStep} 0%, ${C.night} 70%)`, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "0 0", transform: `translate(960px, 540px) scale(${z}) translate(${-fx}px, ${-fy}px)` }}>
        <div style={{ position: "absolute", left: WX, top: WY, width: W, height: H + BAR, borderRadius: 14, overflow: "hidden", background: "#fff", boxShadow: "0 50px 140px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)" }}>
          <div style={{ height: BAR, background: "#f1f1ef", borderBottom: "1px solid #e4e4e2", display: "flex", alignItems: "center", padding: "0 16px", gap: 8 }}>
            {["#e4e4e2", "#e4e4e2", "#e4e4e2"].map((c, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />
            ))}
            <div style={{ marginLeft: 380, width: 600, height: 26, borderRadius: 8, background: "#fff", border: "1px solid #e4e4e2", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 13.5, color: "#5f6368", letterSpacing: 0.1 }}>
              {urlFor(shot)}
            </div>
          </div>
          <div style={{ position: "relative", width: W, height: H }}>
            {prev && mix < 1 && <Shot name={prev} opacity={1} />}
            <Shot name={shot} opacity={mix} />
            {ring >= 0 && (
              <div style={{ position: "absolute", left: cur.at.x - 6 - 22 * ring, top: cur.at.y - 6 - 22 * ring, width: 12 + 44 * ring, height: 12 + 44 * ring, borderRadius: "50%", border: `2px solid ${C.slime}`, opacity: 0.9 * (1 - ring) }} />
            )}
            <Cursor x={cur.x} y={cur.y} press={press} />
          </div>
        </div>
      </div>
    </div>
  );
}
