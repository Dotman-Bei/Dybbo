// The deployed Dybbo contract (PRD §8). Every write: simulate → explicit gas limit → sign →
// proposed → confirmed from the receipt (F-WL-03..05).
import { BaseError, ContractFunctionRevertedError, type Address, type WalletClient } from "viem";
import { publicClient } from "../chain";
import { DYBBO_ADDRESS } from "../config";
import { dybboAbi } from "./abi";
import { DybboError, type Activity, type DybboClient, type DybboErrorName, type Lease, type Mark, type Stats, type Status, type Terms, type TxResult } from "./types";

export { dybboAbi };

const REASONS: (DybboErrorName | null)[] = [
  null, "TokenOutOfRange", "Closed", "LeaseActive", "LeaseExpired", "OwnerChanged", "SelfDybbo", "WrongPayment",
  "DurationOutOfRange", "PriceOutOfRange", "NotOwner", "NotController", "SameToken", "Cooldown", "TargetRepeat", "BadMark", "NothingToClaim",
];

const address = DYBBO_ADDRESS as Address;
const read = <T,>(functionName: string, args: unknown[] = []) =>
  publicClient.readContract({ address, abi: dybboAbi, functionName: functionName as never, args: args as never }) as Promise<T>;

function decode(e: unknown): never {
  if (e instanceof BaseError) {
    const reverted = e.walk((x) => x instanceof ContractFunctionRevertedError) as ContractFunctionRevertedError | null;
    const name = reverted?.data?.errorName as DybboErrorName | undefined;
    if (name) throw new DybboError(name);
  }
  throw e;
}

export class LiveClient implements DybboClient {
  readonly preview = false;
  address = address;
  wallet: WalletClient | null = null;

  async status(owners: { id: number; owner: Address; ownerIsContract: boolean }[]): Promise<Status[]> {
    if (!owners.length) return [];
    const from = owners[0].id;
    const to = owners[owners.length - 1].id;
    const rows = await read<{ leased: boolean; until: number; possessor: Address; price: bigint; closed: boolean; defaults: boolean; escrow: bigint }[]>("statusBatch", [BigInt(from), BigInt(to)]);
    const byId = new Map(owners.map((o) => [o.id, o]));
    return rows.map((r, i) => {
      const id = from + i;
      return {
        id, owner: byId.get(id)?.owner ?? ("0x" as Address), leased: r.leased, until: Number(r.until),
        possessor: r.leased ? r.possessor : null, price: r.price, closed: r.closed,
        closedReason: r.closed ? (r.defaults ? "contract" : "holder") : null, escrow: r.escrow,
      };
    });
  }

  async leaseOf(id: number): Promise<Lease | null> {
    const [possessor, until, ownerAtStart, active, startedAt, fee] = await read<[Address, number, Address, boolean, number, bigint]>("leaseOf", [BigInt(id)]);
    if (/^0x0+$/.test(possessor)) return null;
    return { possessor, until: Number(until), ownerAtStart, active, startedAt: Number(startedAt), fee };
  }

  async termsOf(id: number): Promise<Terms> {
    const [price, closed, defaults, holderIsContract] = await read<[bigint, boolean, boolean, boolean]>("termsOf", [BigInt(id)]);
    return { price, closed, defaults, holderIsContract };
  }

  escrowOf = (id: number) => read<bigint>("escrowOf", [BigInt(id)]);

  async marksOf(id: number): Promise<Mark[]> {
    const marks = await read<{ sourceId: number; actor: Address; markId: number; at: number; byPossessor: boolean }[]>("marksOf", [BigInt(id)]);
    return marks.map((m) => ({ ...m, targetId: id, at: Number(m.at) })).sort((a, b) => b.at - a.at);
  }

  async recentActivity(): Promise<Activity[]> {
    const rows = await read<{ kind: number; id: number; targetId: number; actor: Address; markId: number; byPossessor: boolean; at: number; amount: bigint; mins: number }[]>("recentActivity");
    return rows.filter((r) => Number(r.at) > 0).map((r): Activity =>
      r.kind === 0 ? { kind: "possess", id: r.id, actor: r.actor, at: Number(r.at), minutes: r.mins, fee: r.amount }
      : r.kind === 1 ? { kind: "haunt", id: r.id, targetId: r.targetId, actor: r.actor, at: Number(r.at), markId: r.markId, byPossessor: r.byPossessor }
      : { kind: "claim", id: r.id, actor: r.actor, at: Number(r.at), amount: r.amount },
    );
  }

  async stats(): Promise<Stats> {
    const [possessions, haunts, paid, claimed, possessors, tokens] = await read<bigint[]>("stats");
    return { possessions: Number(possessions), haunts: Number(haunts), paid, claimed, possessors: Number(possessors), tokens: Number(tokens) };
  }

  lastHauntAt = async (id: number) => Number(await read<number>("lastHauntAt", [BigInt(id)]));

  async canHaunt(actor: Address, sourceId: number, targetId: number) {
    const [ok, reason] = await read<[boolean, number]>("canHaunt", [actor, BigInt(sourceId), BigInt(targetId)]);
    return ok ? null : REASONS[reason] ?? "NotController";
  }

  private async send(actor: Address, functionName: string, args: unknown[], value = 0n, dryRun = false): Promise<TxResult> {
    let request;
    try {
      ({ request } = await publicClient.simulateContract({ account: actor, address, abi: dybboAbi, functionName: functionName as never, args: args as never, value }));
    } catch (e) {
      decode(e);
    }
    if (dryRun) return { hash: null, block: null, simulated: true };
    if (!this.wallet) throw new Error("Connect a wallet first");
    const gas = await publicClient.estimateContractGas({ account: actor, address, abi: dybboAbi, functionName: functionName as never, args: args as never, value });
    const hash = await this.wallet.writeContract({ ...(request as object), gas: (gas * 12n) / 10n, account: actor, chain: publicClient.chain } as never);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") throw new Error("Transaction reverted");
    return { hash, block: Number(receipt.blockNumber), simulated: false };
  }

  possess = (actor: Address, id: number, minutes: number, value: bigint, dryRun?: boolean) => this.send(actor, "possess", [BigInt(id), minutes], value, dryRun);
  haunt = (actor: Address, s: number, t: number, m: number, dryRun?: boolean) => this.send(actor, "haunt", [BigInt(s), BigInt(t), m], 0n, dryRun);
  claim = (actor: Address, ids: number[], dryRun?: boolean) =>
    ids.length === 1 ? this.send(actor, "claim", [BigInt(ids[0])], 0n, dryRun) : this.send(actor, "claimMany", [ids.map(BigInt)], 0n, dryRun);
  setTerms = (actor: Address, id: number, price: bigint, closed: boolean, dryRun?: boolean) => this.send(actor, "setTerms", [BigInt(id), price, closed], 0n, dryRun);
}
