// Generates the whole voiceover in one request (one consistent read), then the clips are split at the
// pauses. "Dybbo" is spelled "Dibbo" here only so the voice says DIB-oh, after the dybbuk. Usage: GEMINI_KEY_FILE=<path> node scripts/voice-one-take.mjs <model>
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const key = readFileSync(process.env.GEMINI_KEY_FILE, "utf8").trim();
const model = process.argv[2] || "gemini-3.1-flash-tts-preview";

const ORDER = ["s01", "s02", "s03", "s04", "s05", "s06", "s08", "s09", "s10a", "s10b", "s11", "s12", "s13", "s14"];
const LINES = {
  s01: "There are just under two thousand Chog Genesis. Fewer than a thousand people own one.",
  s02: "Everyone else watches.",
  s03: "Lending one used to mean signing an approval that lets a contract move every NFT you own.",
  s04: "In one sweep this year, a single forgotten approval cost three thousand wallets nearly twenty-six thousand NFTs.",
  s05: "Dibbo needs none of that.",
  s06: "Possess any Chog, for a few minutes.",
  s08: "Pick one. The fee goes straight into that Chog's escrow, for whoever holds it. No approval. No custody. The Chog never leaves its wallet.",
  s09: "While the timer runs, you control it. Leave a mark on another Chog. It stays on that Chog's page for a day, signed by the one you possessed.",
  s10a: "Now, try to take it.",
  s10b: "Chog Genesis says no. Dibbo was never approved, so neither are you.",
  s11: "And when the minute is up, control ends, in that very block.",
  s12: "The holder never signed up. They just find the fee waiting, and claim it.",
  s13: "Every rule is checked on Monad, every time. Anyone can run the checks.",
  s14: "Dibbo. Possess any Chog.",
};

const prompt =
  "You are the narrator of a calm, confident product film. Read the script below in a warm, low, unhurried, conversational voice, " +
  "like explaining something to a smart friend. No announcer energy, no sales voice. " +
  "Leave a clear pause of about two seconds between paragraphs, and only short natural pauses inside a paragraph.\n\n" +
  ORDER.map((id) => LINES[id]).join("\n\n");

const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } } } },
  }),
});
const j = await r.json();
if (j.error) throw new Error(`${j.error.code} ${j.error.message.slice(0, 200)}`);
const part = j.candidates[0].content.parts.find((p) => p.inlineData);
mkdirSync("public/vo", { recursive: true });
let buf = Buffer.from(part.inlineData.data, "base64");
if (buf.subarray(0, 4).toString() !== "RIFF") {
  // Raw 24 kHz mono 16-bit PCM: give it a WAV header.
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + buf.length, 4); h.write("WAVE", 8); h.write("fmt ", 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(24000, 24);
  h.writeUInt32LE(48000, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(buf.length, 40);
  buf = Buffer.concat([h, buf]);
}
writeFileSync("public/vo/take.wav", buf);
writeFileSync("public/vo/order.json", JSON.stringify(ORDER));
console.log(model, "ok", buf.length, "bytes");
