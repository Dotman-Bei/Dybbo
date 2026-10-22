// An original score and sound effects for the Dybbo demo, synthesised from scratch.
// 108 BPM, A minor. The arrangement follows the edit (seconds below match src/timeline.ts).
//   node scripts/score.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const SR = 44100;
const BPM = 108;
const BEAT = 60 / BPM;
const LENGTH = 95.5;

// ---------------------------------------------------------------- the edit's sections (seconds)
// Every boundary sits on a beat, so the parts that enter later stay on the same grid.
const q = (t) => Math.round(t / BEAT) * BEAT;
const S = {
  hookEnd: q(9.0), // pad + sub only
  storyEnd: q(23.8), // + quiet mallets
  pauseEnd: q(25.6), // pull back before the logo; the groove enters with it
  takeStart: q(57.0), // drop to pulse for "try to take it"
  takeEnd: q(67.5),
  end: q(88.4), // end card: final chord
};

// ---------------------------------------------------------------- helpers
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
}
const SAW = (() => {
  // band-limited sawtooth wavetable (16 harmonics), 4096 samples
  const n = 4096, t = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let v = 0;
    for (let h = 1; h <= 16; h++) v += Math.sin((2 * Math.PI * h * i) / n) / h;
    t[i] = v * 0.55;
  }
  return t;
})();
const saw = (ph) => SAW[Math.floor((ph - Math.floor(ph)) * 4096) & 4095];

function stereo(len) {
  return [new Float32Array(Math.ceil(len * SR)), new Float32Array(Math.ceil(len * SR))];
}
function add(buf, startSec, mono, gain = 1, pan = 0) {
  const s0 = Math.floor(startSec * SR);
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4), gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < mono.length; i++) {
    const j = s0 + i;
    if (j < 0 || j >= buf[0].length) continue;
    buf[0][j] += mono[i] * gl;
    buf[1][j] += mono[i] * gr;
  }
}
function onePoleLP(x, cutoff) {
  const a = Math.exp((-2 * Math.PI * cutoff) / SR);
  let y = 0;
  for (let i = 0; i < x.length; i++) x[i] = y = (1 - a) * x[i] + a * y;
  return x;
}

// ---------------------------------------------------------------- instruments
function pad(notes, dur, bright = 900) {
  const len = Math.ceil((dur + 2.5) * SR), out = new Float32Array(len);
  const r = rng(notes[0] * 7);
  for (const n of notes) {
    for (const det of [-0.11, 0.11]) {
      const f = midi(n) * 2 ** (det / 12);
      let ph = (r() + 1) / 2;
      for (let i = 0; i < len; i++) {
        ph += f / SR;
        out[i] += saw(ph) * 0.12;
      }
    }
  }
  onePoleLP(out, bright);
  onePoleLP(out, bright * 1.6);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 1.4) * (t > dur ? Math.exp(-(t - dur) / 0.9) : 1);
    out[i] *= env;
  }
  return out;
}
function mallet(n, vel = 1) {
  const len = Math.ceil(1.6 * SR), out = new Float32Array(len), f = midi(n);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const a = Math.min(1, t / 0.002);
    out[i] = a * vel * (Math.sin(2 * Math.PI * f * t) * Math.exp(-t / 0.55) + 0.28 * Math.sin(2 * Math.PI * f * 3.98 * t) * Math.exp(-t / 0.09) + 0.12 * Math.sin(2 * Math.PI * f * 9.1 * t) * Math.exp(-t / 0.03));
  }
  return out;
}
function bass(n, dur) {
  const len = Math.ceil((dur + 0.3) * SR), out = new Float32Array(len), f = midi(n);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.02) * (t > dur ? Math.exp(-(t - dur) / 0.08) : 1) * (0.75 + 0.25 * Math.exp(-t / 0.3));
    out[i] = env * (Math.sin(2 * Math.PI * f * t) + 0.18 * Math.sin(4 * Math.PI * f * t));
  }
  return out;
}
function kick(gain = 1) {
  const len = Math.ceil(0.35 * SR), out = new Float32Array(len);
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR, f = 45 + 75 * Math.exp(-t / 0.03);
    ph += f / SR;
    out[i] = gain * Math.sin(2 * Math.PI * ph) * Math.exp(-t / 0.16);
  }
  return out;
}
function hat(gain = 1, seed = 1) {
  const len = Math.ceil(0.08 * SR), out = new Float32Array(len), r = rng(seed);
  let prev = 0;
  for (let i = 0; i < len; i++) {
    const w = r(), hp = w - prev; // crude high-pass
    prev = w;
    out[i] = gain * hp * Math.exp(-i / SR / 0.018);
  }
  return out;
}

// ---------------------------------------------------------------- reverb (Schroeder)
function reverb(buf, mix = 0.24) {
  const combs = [1557, 1617, 1491, 1422], allp = [225, 556];
  for (let c = 0; c < 2; c++) {
    const x = buf[c], wet = new Float32Array(x.length);
    for (const [k, d0] of combs.entries()) {
      const d = d0 + c * 23 + k, line = new Float32Array(d);
      let idx = 0, lp = 0;
      for (let i = 0; i < x.length; i++) {
        const y = line[idx];
        lp = y * 0.6 + lp * 0.4;
        line[idx] = x[i] * 0.25 + lp * 0.82;
        wet[i] += y;
        idx = (idx + 1) % d;
      }
    }
    for (const d0 of allp) {
      const d = d0 + c * 11, line = new Float32Array(d);
      let idx = 0;
      for (let i = 0; i < x.length; i++) {
        const b = line[idx], y = -wet[i] + b;
        line[idx] = wet[i] + b * 0.5;
        wet[i] = y;
        idx = (idx + 1) % d;
      }
    }
    for (let i = 0; i < x.length; i++) x[i] = x[i] * (1 - mix) + wet[i] * mix;
  }
}

function writeWav(path, ch, peak = 0.89) {
  const n = ch[0].length, nc = ch.length;
  let m = 0;
  for (const c of ch) for (let i = 0; i < n; i++) m = Math.max(m, Math.abs(c[i]));
  const g = m > 0 ? peak / m : 1;
  const data = Buffer.alloc(n * nc * 2);
  for (let i = 0; i < n; i++)
    for (let c = 0; c < nc; c++) data.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(ch[c][i] * g * 32767))), (i * nc + c) * 2);
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8); h.write("fmt ", 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(nc, 22); h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * nc * 2, 28); h.writeUInt16LE(nc * 2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(data.length, 40);
  writeFileSync(path, Buffer.concat([h, data]));
}

// ---------------------------------------------------------------- the score
const music = stereo(LENGTH + 3);
// Progression, 2 bars each: Am9, Fmaj7, Cmaj7, G6 (as MIDI note sets for the pad), roots for the bass.
const CHORDS = [
  { pad: [57, 60, 64, 67, 71], root: 45, arp: [69, 72, 76, 79] },
  { pad: [53, 57, 60, 64, 67], root: 41, arp: [65, 69, 72, 76] },
  { pad: [55, 60, 64, 67, 71], root: 48, arp: [67, 72, 76, 79] },
  { pad: [55, 59, 62, 64, 67], root: 43, arp: [67, 71, 74, 79] },
];
const BAR = BEAT * 4;
const phrase = (t) => CHORDS[Math.floor(t / (2 * BAR)) % 4];

// Pad throughout, until the end card.
for (let t = 0; t < S.end; t += 2 * BAR) {
  const c = phrase(t);
  const quiet = t >= S.takeStart && t < S.takeEnd;
  add(music, t, pad(c.pad, 2 * BAR, quiet ? 650 : 950), quiet ? 0.5 : 0.62, 0);
}
// Sub pulse on beats 1 and 3, from the start; carries the hook and the take-it drop alone.
for (let t = 0; t < S.end; t += 2 * BEAT) {
  if (t >= S.storyEnd && t < S.pauseEnd) continue;
  add(music, t, bass(phrase(t).root - 12, BEAT * 0.9), t < S.pauseEnd || (t >= S.takeStart && t < S.takeEnd) ? 0.34 : 0.3, 0);
}
// Mallet ostinato: eighth notes. Quiet in the story section, full from the logo, out for the take-it drop.
for (let t = S.hookEnd, k = 0; t < S.end; t += BEAT / 2, k++) {
  if (t >= S.storyEnd && t < S.pauseEnd) continue;
  if (t >= S.takeStart && t < S.takeEnd) continue;
  const c = phrase(t), pat = [0, 2, 1, 3, 2, 1, 3, 2];
  const n = c.arp[pat[k % 8]];
  const v = t < S.pauseEnd ? 0.16 : 0.26;
  add(music, t, mallet(n, k % 4 === 0 ? v * 1.15 : v), 1, ((k % 2) * 2 - 1) * 0.35);
}
// Groove from the logo: soft kick on 1 and 3, a quiet hat on every off-beat, a bass line.
for (let t = S.pauseEnd; t < S.end; t += BEAT) {
  if (t >= S.takeStart && t < S.takeEnd) continue;
  const beat = Math.round(t / BEAT) % 4;
  if (beat === 0 || beat === 2) add(music, t, kick(0.5), 1, 0);
  add(music, t + BEAT / 2, hat(0.07, Math.round(t * 100)), 1, 0.25);
  if (beat === 0) add(music, t, bass(phrase(t).root, BEAT * 1.8), 0.28, 0);
}
// A soft swell into the logo, and the end card's final chord: A minor add9 resolving on the root.
{
  const sw = pad([57, 64, 71, 76], 2.2, 1400);
  for (let i = 0; i < sw.length; i++) sw[i] *= Math.min(1, i / SR / 2.0) ** 2;
  add(music, S.pauseEnd - 2.2, sw, 0.5, 0);
  add(music, S.end, pad([45, 57, 64, 71, 76], 4.5, 1100), 0.8, 0);
  add(music, S.end, bass(33, 3.5), 0.3, 0);
  for (const [k, n] of [76, 81, 84, 88].entries()) add(music, S.end + k * BEAT / 2, mallet(n, 0.3), 1, (k - 1.5) * 0.3);
}
reverb(music, 0.26);
// Fade the last seconds to silence.
for (let i = 0; i < music[0].length; i++) {
  const t = i / SR;
  const g = t > LENGTH - 3 ? Math.max(0, (LENGTH - t) / 3) : 1;
  music[0][i] *= g;
  music[1][i] *= g;
}
mkdirSync("public/audio", { recursive: true });
writeWav("public/audio/music.wav", music.map((c) => c.subarray(0, Math.round(LENGTH * SR))));

// ---------------------------------------------------------------- sound effects (mono)
function sfx(len, fn) {
  const out = new Float32Array(Math.ceil(len * SR));
  for (let i = 0; i < out.length; i++) out[i] = fn(i / SR, i);
  return out;
}
const n1 = rng(7), n2 = rng(9), n3 = rng(11);
const effects = {
  // A soft, rounded mouse click: a short high blip over a tiny noise tick.
  click: sfx(0.05, (t) => (Math.sin(2 * Math.PI * 2100 * t) * 0.6 + n1() * 0.25) * Math.exp(-t / 0.006)),
  // Key tick for typing: lighter and higher.
  key: sfx(0.03, (t) => (Math.sin(2 * Math.PI * 3200 * t) * 0.4 + n2() * 0.2) * Math.exp(-t / 0.004)),
  // The refusal: a low, short thud. Felt more than heard.
  thud: sfx(0.6, (t) => Math.sin(2 * Math.PI * (38 + 40 * Math.exp(-t / 0.05)) * t) * Math.exp(-t / 0.18) + n3() * 0.04 * Math.exp(-t / 0.02)),
  // Confirmation: two soft bell partials, a fifth apart.
  chime: sfx(1.2, (t) => (Math.sin(2 * Math.PI * 1318.5 * t) * Math.exp(-t / 0.35) + 0.6 * Math.sin(2 * Math.PI * 1975.5 * t) * Math.exp(-t / 0.25)) * Math.min(1, t / 0.004)),
  // Air: filtered noise swelling and falling over half a second.
  whoosh: (() => {
    const o = sfx(0.7, (t) => n1() * Math.sin(Math.PI * Math.min(1, t / 0.7)) ** 2);
    return onePoleLP(onePoleLP(o, 1800), 2600);
  })(),
  // A small pop when the wisp opens in the logo.
  pop: sfx(0.15, (t) => Math.sin(2 * Math.PI * (300 + 500 * Math.exp(-t / 0.02)) * t) * Math.exp(-t / 0.04)),
};
mkdirSync("public/audio/sfx", { recursive: true });
for (const [name, x] of Object.entries(effects)) writeWav(`public/audio/sfx/${name}.wav`, [x], 0.8);
console.log("score and", Object.keys(effects).length, "effects written");
