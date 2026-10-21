// Measures Dybbo's gas on Monad mainnet itself (MIP-8 storage pricing, 10,100-gas cold access), not on
// a local EVM. The compiled runtime is injected with eth_estimateGas state overrides, and the storage each
// case needs (a live lease, escrow to claim) is seeded the same way. Nothing is sent to the chain.
//
//   cd contracts && forge build && node script/measure-gas.mjs
//
// Writes gas/monad-gas.json. Fresh storage is the worst case: the first write to a slot pays for state growth.
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(new URL("../../web/package.json", import.meta.url));
const viem = require("viem");
const { createPublicClient, createWalletClient, http, encodeFunctionData, keccak256, encodeAbiParameters, pad, toHex, parseEther, formatEther } = viem;
const { privateKeyToAccount } = require("viem/accounts");

const CHOG = "0xc96d31F8626c6D03Fae5dCD3d61e3FB9F4a73763";
const DYBBO = "0xD7bb0000000000000000000000000000000D7bb0"; // any unused address
const art = JSON.parse(readFileSync(new URL("../out/Dybbo.sol/Dybbo.json", import.meta.url)));
const abi = art.abi;

// 1. Runtime bytecode with the immutables filled in, from a throwaway local deploy.
const anvil = spawn("anvil", ["--port", "8555", "--silent"], { stdio: "ignore", shell: process.platform === "win32" });
await new Promise((r) => setTimeout(r, 2500));
const local = createPublicClient({ transport: http("http://127.0.0.1:8555") });
const deployer = privateKeyToAccount("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
const wallet = createWalletClient({ account: deployer, transport: http("http://127.0.0.1:8555"), chain: { id: 31337, name: "anvil", nativeCurrency: { name: "E", symbol: "E", decimals: 18 }, rpcUrls: { default: { http: ["http://127.0.0.1:8555"] } } } });
const hash = await wallet.deployContract({ abi, bytecode: art.bytecode.object, args: [CHOG, parseEther("0.01"), parseEther("0.001"), parseEther("1")] });
const { contractAddress } = await local.waitForTransactionReceipt({ hash });
const code = await local.getCode({ address: contractAddress });
anvil.kill();

// 2. Monad mainnet.
const rpc = (method, params) =>
  fetch("https://rpc.monad.xyz", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) })
    .then((r) => r.json())
    .then((j) => {
      if (j.error) throw new Error(`${method}: ${j.error.message} ${j.error.data ?? ""}`);
      return j.result;
    });
const call = (to, data) => rpc("eth_call", [{ to, data }, "latest"]);
const ownerOf = async (id) => "0x" + (await call(CHOG, encodeFunctionData({ abi: [{ type: "function", name: "ownerOf", inputs: [{ type: "uint256" }], outputs: [{ type: "address" }], stateMutability: "view" }], args: [BigInt(id)] }))).slice(26);
const hasCode = async (a) => (await rpc("eth_getCode", [a, "latest"])) !== "0x";

async function openToken(from) {
  for (let id = from; id <= 1969; id++) {
    const o = await ownerOf(id);
    if (!(await hasCode(o))) return { id, owner: o };
  }
}

const slotOf = (key, slot) => keccak256(encodeAbiParameters([{ type: "uint256" }, { type: "uint256" }], [BigInt(key), BigInt(slot)]));
const word = (n) => pad(toHex(n), { size: 32 });
const LOCKED = word(1n);

async function estimate(name, from, fn, args, { value = 0n, stateDiff = {}, balance = 0n } = {}) {
  const data = encodeFunctionData({ abi, functionName: fn, args });
  const override = {
    [DYBBO]: { code, balance: toHex(balance), stateDiff: { [word(144n)]: LOCKED, ...stateDiff } },
    [from]: { balance: toHex(parseEther("100")) },
  };
  const gas = BigInt(await rpc("eth_estimateGas", [{ from, to: DYBBO, data, value: toHex(value) }, "latest", override]));
  console.log(`${name.padEnd(34)} ${gas.toLocaleString("en-US").padStart(9)} gas`);
  return [name, Number(gas)];
}

const src = await openToken(1);
const target = await openToken(src.id + 1);
const possessor = "0x000000000000000000000000000000000000d1bb";
const now = BigInt(Math.floor(Date.now() / 1000));
// A live lease on src for the possessor: word 0 = possessor | until << 160 | start << 200; word 1 = ownerAtStart | fee << 160.
const leaseBase = BigInt(slotOf(src.id, 0));
const leaseState = {
  [word(leaseBase)]: word(BigInt(possessor) | ((now + 600n) << 160n) | (now << 200n)),
  [word(leaseBase + 1n)]: word(BigInt(src.owner) | (parseEther("0.05") << 160n)),
};

const rows = [];
rows.push(await estimate("possess (5 min, first ever)", possessor, "possess", [BigInt(src.id), 5], { value: parseEther("0.05") }));
rows.push(await estimate("haunt (possessor)", possessor, "haunt", [BigInt(src.id), BigInt(target.id), 0], { stateDiff: leaseState }));
rows.push(await estimate("haunt (holder mode)", src.owner, "haunt", [BigInt(src.id), BigInt(target.id), 1]));
rows.push(await estimate("claim", src.owner, "claim", [BigInt(src.id)], { stateDiff: { [slotOf(src.id, 2)]: word(parseEther("0.05")) }, balance: parseEther("0.05") }));
rows.push(await estimate("setTerms", src.owner, "setTerms", [BigInt(src.id), parseEther("0.02"), false]));

const gasPrice = BigInt(await rpc("eth_gasPrice", []));
const out = {
  measuredAt: new Date().toISOString(),
  network: "Monad mainnet (chainId 143), eth_estimateGas with state overrides",
  tokens: { source: src.id, target: target.id },
  gasPriceWei: gasPrice.toString(),
  note: "Fresh storage, so first writes pay for state growth; later writes to the same slots cost less. Monad charges the gas limit, so the app sets limit = estimate × 1.2.",
  gas: Object.fromEntries(rows),
  costMonAtGasPrice: Object.fromEntries(rows.map(([k, g]) => [k, formatEther(BigInt(Math.ceil(g * 1.2)) * gasPrice)])),
};
mkdirSync(new URL("../gas/", import.meta.url), { recursive: true });
writeFileSync(new URL("../gas/monad-gas.json", import.meta.url), JSON.stringify(out, null, 2) + "\n");
console.log(`gas price ${formatEther(gasPrice * 1_000_000_000n)} MON per billion gas; wrote gas/monad-gas.json`);
process.exit(0);
