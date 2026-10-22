import { continueRender, delayRender, staticFile, Easing } from "remotion";

// Ectoplasm, as in the app.
export const C = {
  slime: "#3ddc97",
  night: "#0c1f17",
  nightStep: "#163325",
  ink: "#e8f5ee",
  inkMuted: "rgba(232, 245, 238, 0.62)",
};
export const FONT = '"Chillax", ui-rounded, system-ui, sans-serif';
export const MONO = 'Consolas, "SF Mono", ui-monospace, monospace';

const fontsReady = delayRender("Chillax");
Promise.all(
  [400, 500, 600].map((w) =>
    new FontFace("Chillax", `url(${staticFile(`fonts/chillax-${w}.woff2`)})`, { weight: String(w) })
      .load()
      .then((face) => document.fonts.add(face)),
  ),
).then(() => continueRender(fontsReady));

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
// 0 -> 1 over [t0, t0 + d], eased.
export const ramp = (t: number, t0: number, d: number, ease = easeOut) => ease(clamp01((t - t0) / d));
// The house entrance: fade up 12px.
export const rise = (t: number, t0: number, d = 0.6) => {
  const p = ramp(t, t0, d);
  return { opacity: p, transform: `translateY(${(1 - p) * 12}px)` };
};
