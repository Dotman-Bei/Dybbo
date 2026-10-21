// One place for every number the copy and the contract share (PRD §8.2).
// Copy reads these; nothing in the UI types a price or a limit twice.

export const CHAIN_ID = 143;
export const CHOG_ADDRESS = "0xc96d31F8626c6D03Fae5dCD3d61e3FB9F4a73763" as const;
export const MULTICALL3 = "0xcA11bde05977b3631167028862bE2a173976CA11" as const;
export const RPC_URLS = ["https://rpc.monad.xyz", "https://rpc1.monad.xyz"] as const;
export const EXPLORER = "https://monadscan.com";

/** Set once the contract is deployed; until then the app runs in preview mode. */
export const DYBBO_ADDRESS = (process.env.NEXT_PUBLIC_DYBBO_ADDRESS || "") as `0x${string}` | "";
export const PREVIEW = DYBBO_ADDRESS === "";

export const REPO_URL = process.env.NEXT_PUBLIC_REPO_URL || "https://github.com/";
export const VIDEO_URL = process.env.NEXT_PUBLIC_VIDEO_URL || "";

export const SUPPLY = 1969;
export const MIN_MINUTES = 1;
export const MAX_MINUTES = 10;
export const WEI = 10n ** 18n;
export const DEFAULT_PRICE = WEI / 100n; // 0.01 MON per minute
export const MIN_PRICE = WEI / 1000n; // 0.001 MON
export const MAX_PRICE = WEI; // 1 MON
export const HAUNT_COOLDOWN = 15; // seconds
export const TARGET_REPEAT_WINDOW = 24 * 60 * 60;
export const MARK_TTL = 24 * 60 * 60;
export const MARKS_PER_TOKEN = 8;
export const RECENT = 64;

export const MARKS = [
  { id: 0, name: "Boo", line: "A sheet with two holes. The classic." },
  { id: 1, name: "Slime", line: "Lime ooze down the side of the card." },
  { id: 2, name: "Hex", line: "A crimson spiral. Bad luck for a day." },
] as const;

export function isTokenId(n: number) {
  return Number.isInteger(n) && n >= 1 && n <= SUPPLY;
}

export const explorerAddress = (a: string) => `${EXPLORER}/address/${a}`;
export const explorerTx = (h: string) => `${EXPLORER}/tx/${h}`;
export const explorerRead = (a: string) => `${EXPLORER}/address/${a}#readContract`;
export const explorerCode = (a: string) => `${EXPLORER}/address/${a}#code`;
