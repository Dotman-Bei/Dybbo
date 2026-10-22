// Generates the voiceover, one clip per shot, with Gemini TTS (voice: Charon).
// Usage: GEMINI_KEY_FILE=<path> node scripts/voice.mjs [id ...]
// Writes public/vo/<id>.wav. The API key is read from a file outside the repo and never written here.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const keyFile = process.env.GEMINI_KEY_FILE;
if (!keyFile) throw new Error("Set GEMINI_KEY_FILE to a file holding the Gemini API key.");
const key = readFileSync(keyFile, "utf8").trim();

// One direction for every line, so the read stays consistent across clips.
const DIRECTION =
  "Read this as the narrator of a calm, confident product film. Warm, low, unhurried, conversational, like explaining something to a smart friend. " +
  "No announcer energy, no sales voice. Natural pauses at commas and full stops.";

export const LINES = {
  s01: "There are nineteen hundred and sixty-nine Chog Genesis. Fewer than a thousand people own one.",
  s02: "Everyone else watches.",
  s03: "Lending one used to mean signing an approval that lets a contract move every NFT you own.",
  s04: "In one sweep this year, a single forgotten approval cost three thousand wallets nearly twenty-six thousand NFTs.",
  s05: "Dybbo needs none of that.",
  s06: "Possess any Chog, for a few minutes.",
  s08: "Pick one. The fee goes straight into that Chog's escrow, for whoever holds it. No approval. No custody. The Chog never leaves its wallet.",
  s09: "While the timer runs, you control it. Leave a mark on another Chog. It stays on that Chog's page for a day, signed by the one you possessed.",
  s10a: "Now... try to take it.",
  s10b: "Chog Genesis refuses. Dybbo was never approved, so neither are you.",
  s11: "And when the minute is up, control ends, in that very block.",
  s12: "The holder never signed up. They just find the fee waiting, and claim it.",
  s13: "Every rule is checked on Monad, every time. Anyone can run the checks.",
  s14: "Dybbo. Possess any Chog.",
};

const wanted = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(LINES);
mkdirSync("public/vo", { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const id of wanted) {
  const out = `public/vo/${id}.wav`;
  if (existsSync(out) && !process.env.FORCE) continue;
  for (let attempt = 0; attempt < 6; attempt++) {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-tts:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${DIRECTION}\n\n${LINES[id]}` }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } } },
          },
        }),
      },
    );
    const j = await r.json();
    if (j.error) {
      console.log(id, "retry", j.error.code, j.error.message.slice(0, 90));
      await sleep(j.error.code === 429 ? 30000 : 5000);
      continue;
    }
    const part = j.candidates[0].content.parts.find((p) => p.inlineData);
    writeFileSync(out, Buffer.from(part.inlineData.data, "base64")); // already a WAV file
    console.log(id, "ok");
    break;
  }
  await sleep(8000);
}
