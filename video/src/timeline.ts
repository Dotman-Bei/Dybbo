// The whole edit, in seconds. The score (scripts/score.mjs) is arranged against these same times.
export const FPS = 30;
export const DURATION = 95.5;
export const f = (s: number) => Math.round(s * FPS);

export const SCENES = {
  wall: [0, 9.0],
  approval: [9.0, 15.5],
  sweep: [15.5, 23.8],
  none: [23.8, 25.6],
  logo: [25.6, 29.6],
  app: [29.6, 88.4],
  end: [88.4, DURATION],
} as const;

// Voiceover clips (public/vo/<id>.wav) and where each starts.
export const VO: [string, number][] = [
  ["s01", 0.6],
  ["s02", 7.0],
  ["s03", 9.4],
  ["s04", 15.7],
  ["s05", 23.9],
  ["s06", 26.6],
  ["s08", 34.4],
  ["s09", 44.5],
  ["s10a", 57.2],
  ["s10b", 59.2],
  ["s11", 67.4],
  ["s12", 74.8],
  ["s13", 80.8],
  ["s14", 89.0],
];
export const VO_LENGTH: Record<string, number> = {
  s01: 5.87, s02: 1.51, s03: 5.7, s04: 7.5, s05: 1.58, s06: 2.85, s08: 9.35,
  s09: 9.01, s10a: 1.58, s10b: 4.66, s11: 4.23, s12: 4.0, s13: 4.95, s14: 2.56,
};

// ---------------------------------------------------------------- the product, as captured
// Positions are CSS px in the 1440x900 viewport the shots were taken at.
export type Pt = { x: number; y: number };
// A page or state change: from t, show this shot. fade is the cross-dissolve in seconds.
export type ShotCue = { t: number; shot: string; fade?: number };
// The camera eases to frame (x, y) at zoom z, starting at t and taking d seconds.
export type CamCue = { t: number; x: number; y: number; z: number; d?: number; cut?: boolean };
// The cursor arrives at (x, y) at t; click marks a press there.
export type CursorCue = { t: number; x: number; y: number; click?: boolean };
// For a speed-ramp, a run of shots spread over [t0, t1] with an ease.
export type RampCue = { t0: number; t1: number; shots: string[] };

const timers = Array.from({ length: 42 }, (_, i) => `timer-${String(i).padStart(2, "0")}`);

export const SHOTS: ShotCue[] = [
  { t: 29.6, shot: "home" },
  { t: 31.3, shot: "browse", fade: 0.2 },
  { t: 34.0, shot: "token", fade: 0.2 },
  { t: 42.7, shot: "token-pending" },
  { t: 43.5, shot: "session-start", fade: 0.25 },
  { t: 44.9, shot: "session-bynumber" },
  { t: 45.6, shot: "session-type1" },
  { t: 45.8, shot: "session-type2" },
  { t: 46.0, shot: "session-type3" },
  { t: 46.2, shot: "session-type4" },
  { t: 46.9, shot: "session-found" },
  { t: 47.6, shot: "session-hex" },
  { t: 48.3, shot: "session-haunting" },
  { t: 49.4, shot: "session-haunted" },
  { t: 50.6, shot: "target", fade: 0.3 },
  { t: 56.4, shot: "session-haunted", fade: 0.3 },
  { t: 58.0, shot: "session-taking" },
  { t: 58.6, shot: "session-taken" },
  // 66.8 - 69.6: the timer speed-ramp (RAMP below) runs timer-00 .. timer-41.
  { t: 69.9, shot: "session-ended" },
  { t: 71.4, shot: "session-expired" },
  { t: 74.2, shot: "me", fade: 0.3 },
  { t: 76.9, shot: "me-claiming" },
  { t: 78.0, shot: "me-claimed" },
  { t: 80.3, shot: "proof", fade: 0.3 },
  { t: 81.9, shot: "proof-running" },
  { t: 82.8, shot: "proof-done" },
];
export const RAMP: RampCue = { t0: 66.8, t1: 69.6, shots: timers };

export const CAMERA: CamCue[] = [
  { t: 29.6, x: 720, y: 450, z: 1, cut: true },
  // Browse: lean in on "1,968 open".
  { t: 31.6, x: 520, y: 330, z: 1.3, d: 1.2 },
  // Token: the fee well, then back out for "the Chog never leaves its wallet".
  { t: 34.0, x: 720, y: 450, z: 1, cut: true },
  { t: 35.2, x: 1000, y: 420, z: 1.45, d: 1.4 },
  { t: 40.2, x: 760, y: 450, z: 1.12, d: 1.5 },
  // Session: haunt by number.
  { t: 43.5, x: 720, y: 450, z: 1, cut: true },
  { t: 44.7, x: 540, y: 640, z: 1.4, d: 1.3 },
  // The mark on the target's page.
  { t: 50.6, x: 720, y: 560, z: 1.1, cut: true },
  { t: 51.5, x: 1000, y: 900, z: 1.5, d: 1.8 },
  // Try to take it.
  { t: 56.4, x: 1080, y: 380, z: 1.35, cut: true },
  { t: 58.7, x: 1080, y: 470, z: 1.55, d: 1.2 },
  // The timer running out, then the expired lease.
  { t: 65.8, x: 524, y: 300, z: 1.6, d: 1.0 },
  { t: 70.6, x: 524, y: 440, z: 1.5, d: 0.9 },
  // The holder.
  { t: 74.2, x: 980, y: 330, z: 1.3, cut: true },
  // Proof.
  { t: 80.3, x: 720, y: 450, z: 1, cut: true },
  { t: 82.6, x: 560, y: 520, z: 1.3, d: 1.3 },
];

export const CURSOR: CursorCue[] = [
  { t: 29.6, x: 960, y: 380 },
  { t: 31.0, x: 1132, y: 34, click: true }, // the "Chogs" link in the header
  { t: 31.6, x: 1180, y: 760 },
  { t: 33.6, x: 236, y: 400, click: true },
  { t: 34.2, x: 330, y: 470 },
  { t: 41.2, x: 1060, y: 650 },
  { t: 42.6, x: 1008, y: 514, click: true },
  { t: 43.6, x: 1060, y: 620 },
  { t: 44.9, x: 380, y: 537, click: true },
  { t: 45.4, x: 236, y: 587, click: true },
  { t: 46.5, x: 346, y: 587, click: true },
  { t: 47.5, x: 766, y: 720, click: true },
  { t: 48.2, x: 560, y: 781, click: true },
  { t: 48.9, x: 640, y: 812 },
  { t: 50.6, x: 1100, y: 600 },
  { t: 52.0, x: 1250, y: 760 },
  { t: 56.4, x: 1180, y: 560 },
  { t: 58.0, x: 1108, y: 329, click: true },
  { t: 58.6, x: 1220, y: 300 },
  { t: 70.9, x: 252, y: 497, click: true },
  { t: 71.5, x: 420, y: 420 },
  { t: 74.2, x: 1220, y: 560 },
  { t: 76.8, x: 1108, y: 408, click: true },
  { t: 77.4, x: 1200, y: 470 },
  { t: 80.3, x: 760, y: 300 },
  { t: 81.8, x: 403, y: 353, click: true },
  { t: 82.4, x: 520, y: 300 },
];
// Typed characters (one key tick each).
export const KEYS = [45.6, 45.8, 46.0, 46.2];

// The address bar follows the page.
export const urlFor = (shot: string) =>
  shot === "home" ? "dybbo.vercel.app" :
  shot === "browse" ? "dybbo.vercel.app/chogs" :
  shot.startsWith("token") ? "dybbo.vercel.app/chog/1" :
  shot === "target" ? "dybbo.vercel.app/chog/8" :
  shot.startsWith("me") ? "dybbo.vercel.app/me" :
  shot.startsWith("proof") ? "dybbo.vercel.app/proof" :
  "dybbo.vercel.app/possess/1";

// Sound effects: [name, time, volume].
export const SFX: [string, number, number][] = [
  ...CURSOR.filter((c) => c.click).map((c): [string, number, number] => ["click", c.t, 0.55]),
  ...KEYS.map((t): [string, number, number] => ["key", t, 0.25]),
  ["whoosh", 25.3, 0.18],
  ["pop", 26.3, 0.3],
  ["chime", 49.4, 0.22],
  ["thud", 58.6, 0.7],
  ["thud", 71.4, 0.45],
  ["chime", 78.0, 0.22],
  ["chime", 82.8, 0.18],
];
