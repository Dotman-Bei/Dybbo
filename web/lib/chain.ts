// Public reads against Monad mainnet. Used by the server routes and by the browser.
import { createPublicClient, defineChain, fallback, http, parseAbi, type Address, type Hex } from "viem";
import { CHOG_ADDRESS, MULTICALL3, RPC_URLS } from "./config";

export const monad = defineChain({
  id: 143,
  name: "Monad",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [...RPC_URLS], webSocket: ["wss://rpc.monad.xyz", "wss://rpc1.monad.xyz"] } },
  blockExplorers: { default: { name: "MonadScan", url: "https://monadscan.com" } },
  contracts: { multicall3: { address: MULTICALL3 } },
  blockTime: 300,
});

export const publicClient = createPublicClient({
  chain: monad,
  transport: fallback(RPC_URLS.map((u) => http(u, { batch: { batchSize: 100 }, retryCount: 2 }))),
});

export const chogAbi = parseAbi([
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokensOfOwner(address owner) view returns (uint256[])",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function balanceOf(address owner) view returns (uint256)",
]);

export async function ownerOf(id: number): Promise<Address> {
  return publicClient.readContract({ address: CHOG_ADDRESS, abi: chogAbi, functionName: "ownerOf", args: [BigInt(id)] });
}

export async function isContract(addr: Address): Promise<boolean> {
  const code = await publicClient.getCode({ address: addr });
  return !!code && code !== "0x";
}

export async function tokensOfOwner(addr: Address): Promise<number[]> {
  const ids = await publicClient.readContract({
    address: CHOG_ADDRESS,
    abi: chogAbi,
    functionName: "tokensOfOwner",
    args: [addr],
  });
  return ids.map(Number).sort((a, b) => a - b);
}

export async function approvals(holder: Address, operator: Address, id: number) {
  const [all, single] = await Promise.all([
    publicClient.readContract({ address: CHOG_ADDRESS, abi: chogAbi, functionName: "isApprovedForAll", args: [holder, operator] }),
    publicClient.readContract({ address: CHOG_ADDRESS, abi: chogAbi, functionName: "getApproved", args: [BigInt(id)] }),
  ]);
  return { approvedForAll: all, approved: single };
}

/** eth_call of transferFrom(holder → from, id) sent from `from`. Returns the revert text. */
export async function simulateTake(from: Address, holder: Address, id: number): Promise<{ reverted: boolean; reason: string }> {
  try {
    await publicClient.simulateContract({
      account: from,
      address: CHOG_ADDRESS,
      abi: chogAbi,
      functionName: "transferFrom",
      args: [holder, from, BigInt(id)],
    });
    return { reverted: false, reason: "" };
  } catch (e) {
    return { reverted: true, reason: revertText(e) };
  }
}

// OpenZeppelin v5 ERC-721 custom errors, which Chog Genesis reverts with.
const OZ_ERRORS: Record<string, string> = {
  "0x177e802f": "ERC721InsufficientApproval",
  "0x64283d7b": "ERC721IncorrectOwner",
  "0x7e273289": "ERC721NonexistentToken",
  "0x64a0ae92": "ERC721InvalidReceiver",
  "0xa9fbf51f": "ERC721InvalidSender",
};

export function revertText(e: unknown): string {
  const err = e as { shortMessage?: string; details?: string; message?: string; data?: { errorName?: string } };
  if (err?.data?.errorName) return err.data.errorName;
  const sel = String(err?.message ?? "").match(/0x[0-9a-fA-F]{8}(?![0-9a-fA-F])/)?.[0]?.toLowerCase();
  if (sel && OZ_ERRORS[sel]) return OZ_ERRORS[sel];
  const msg = err?.shortMessage || err?.details || err?.message || "Reverted";
  const m = msg.match(/reverted with the following (?:reason|signature):\s*\n?\s*(.+)/i);
  if (m) return m[1].trim();
  return msg.split("\n")[0].replace(/^The contract function "\w+" reverted\.?\s*/, "").trim() || "Reverted";
}

/** Owners of a range of tokens through Multicall3, and which owners have code (PRD F-DO). */
export async function ownersRange(from: number, to: number) {
  const ids: number[] = [];
  for (let i = from; i <= to; i++) ids.push(i);
  const owners: Address[] = [];
  for (let s = 0; s < ids.length; s += 400) {
    const part = ids.slice(s, s + 400);
    const res = await publicClient.multicall({
      contracts: part.map((id) => ({ address: CHOG_ADDRESS, abi: chogAbi, functionName: "ownerOf" as const, args: [BigInt(id)] })),
      allowFailure: true,
    });
    for (const r of res) owners.push((r.status === "success" ? r.result : "0x0000000000000000000000000000000000000000") as Address);
  }
  const unique = [...new Set(owners.map((o) => o.toLowerCase() as Address))];
  const codes = await Promise.all(unique.map((a) => publicClient.getCode({ address: a }).catch(() => undefined as Hex | undefined)));
  const contracts = new Set(unique.filter((_, i) => codes[i] && codes[i] !== "0x"));
  return ids.map((id, i) => ({ id, owner: owners[i], ownerIsContract: contracts.has(owners[i].toLowerCase() as Address) }));
}
