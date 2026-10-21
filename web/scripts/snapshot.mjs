// Builds data/chogs.json: name, image and every attribute for all 1,969 Chog Genesis tokens.
// tokenURI is read on chain through Multicall3 (never <id>.json, see PRD K1), then each
// metadata file is fetched from IPFS with gateway fallback. Re-run when tokenURI changes.
import { createPublicClient, http, parseAbi } from "viem";
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const CHOG = "0xc96d31F8626c6D03Fae5dCD3d61e3FB9F4a73763";
const SUPPLY = 1969;
const OUT = new URL("../data/chogs.json", import.meta.url);
const PARTIAL = new URL("../data/.chogs-partial.json", import.meta.url);
const GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.filebase.io/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://dweb.link/ipfs/",
  "https://w3s.link/ipfs/",
];

const client = createPublicClient({
  chain: {
    id: 143,
    name: "Monad",
    nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
    rpcUrls: { default: { http: ["https://rpc.monad.xyz"] } },
    contracts: { multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" } },
  },
  transport: http("https://rpc.monad.xyz", { retryCount: 5 }),
});
const abi = parseAbi(["function tokenURI(uint256) view returns (string)"]);

async function readUris() {
  const uris = [];
  for (let start = 1; start <= SUPPLY; start += 250) {
    const ids = [];
    for (let id = start; id < Math.min(start + 250, SUPPLY + 1); id++) ids.push(id);
    const res = await client.multicall({
      contracts: ids.map((id) => ({ address: CHOG, abi, functionName: "tokenURI", args: [BigInt(id)] })),
      allowFailure: false,
    });
    uris.push(...res);
    console.log(`tokenURI ${start}..${start + ids.length - 1}`);
  }
  return uris;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(ipfsUri) {
  const path = ipfsUri.replace("ipfs://", "");
  for (let attempt = 0; attempt < 16; attempt++) {
    const gw = GATEWAYS[(attempt + (Math.random() < 0.5 ? 0 : 1)) % 2 === 0 ? 0 : attempt % 3 === 2 ? 2 + (((attempt / 3) | 0) % 3) : 1];
    try {
      const res = await fetch(gw + path, { signal: AbortSignal.timeout(20000) });
      if (res.ok) return await res.json();
    } catch {}
    await sleep(Math.min(15000, 800 * (attempt + 1)));
  }
  throw new Error(`metadata failed: ${ipfsUri}`);
}

async function main() {
  await mkdir(new URL("../data/", import.meta.url), { recursive: true });
  const uris = await readUris();
  const done = existsSync(PARTIAL) ? JSON.parse(await readFile(PARTIAL, "utf8")) : {};
  let next = 0;
  let count = Object.keys(done).length;
  async function worker() {
    while (next < SUPPLY) {
      const i = next++;
      const id = i + 1;
      if (done[id] && done[id].uri === uris[i]) continue;
      const meta = await fetchJson(uris[i]);
      done[id] = {
        uri: uris[i],
        name: meta.name,
        image: meta.image,
        attributes: (meta.attributes ?? []).map((a) => [a.trait_type, String(a.value)]),
      };
      if (++count % 100 === 0) {
        console.log(`metadata ${count}/${SUPPLY}`);
        await writeFile(PARTIAL, JSON.stringify(done));
      }
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker)).finally(() => writeFile(PARTIAL, JSON.stringify(done)));

  const tokens = [];
  for (let id = 1; id <= SUPPLY; id++) {
    const t = done[id];
    tokens.push({
      id,
      metaId: Number(t.uri.match(/\/(\d+)\.json$/)?.[1] ?? 0),
      name: t.name,
      image: t.image.replace("ipfs://", ""),
      attributes: t.attributes,
    });
  }
  const snapshot = { version: new Date().toISOString(), contract: CHOG, supply: SUPPLY, tokens };
  await writeFile(OUT, JSON.stringify(snapshot));
  console.log(`wrote ${tokens.length} tokens`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
