// Preview engine: the Dybbo contract's rules (PRD §7–8) run in this browser until the
// contract is on mainnet. Ownership is real: every check reads ownerOf and the owner's
// code from Monad, exactly as the contract will.
import type { Address } from "viem";
import { isContract, ownerOf } from "../chain";
import {
  DEFAULT_PRICE, HAUNT_COOLDOWN, MARKS_PER_TOKEN, MARK_TTL, MAX_MINUTES, MAX_PRICE, MIN_MINUTES, MIN_PRICE,
  RECENT, TARGET_REPEAT_WINDOW, isTokenId,
} from "../config";
import { DybboError, type Activity, type DybboClient, type Lease, type Mark, type Stats, type Status, type Terms, type TxResult } from "./types";

type StoredLease = { possessor: Address; until: number; ownerAtStart: Address; startedAt: number; fee: string };
type StoredActivity = {
  kind: Activity["kind"]; id: number; actor: Address; at: number;
  targetId?: number; markId?: number; byPossessor?: boolean; minutes?: number; fee?: string; amount?: string;
};
type StoredTerms = { price: string; closed: boolean; setBy: Address };
type State = {
  leases: Record<number, StoredLease>;
  terms: Record<number, StoredTerms>;
  escrow: Record<number, string>;
  lastHauntAt: Record<number, number>;
  lastPairAt: Record<string, number>;
  marks: Record<number, Mark[]>;
  recent: StoredActivity[];
  counters: { possessions: number; haunts: number; paid: string; claimed: string };
  possessors: string[];
  tokens: number[];
};

const KEY = "dybbo.preview.v1";
const empty = (): State => ({
  leases: {}, terms: {}, escrow: {}, lastHauntAt: {}, lastPairAt: {}, marks: {}, recent: [],
  counters: { possessions: 0, haunts: 0, paid: "0", claimed: "0" }, possessors: [], tokens: [],
});

function load(): State {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    return empty();
  }
}

function save(s: State) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
  window.dispatchEvent(new Event("dybbo:change"));
}

const now = () => Math.floor(Date.now() / 1000);
const lc = (a: string) => a.toLowerCase();
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const ownerCache = new Map<number, { at: number; owner: Address }>();
async function owner(id: number): Promise<Address> {
  const hit = ownerCache.get(id);
  if (hit && Date.now() - hit.at < 10_000) return hit.owner;
  const o = await ownerOf(id);
  ownerCache.set(id, { at: Date.now(), owner: o });
  return o;
}
const codeCache = new Map<string, boolean>();
async function hasCode(a: Address) {
  const k = lc(a);
  if (!codeCache.has(k)) codeCache.set(k, await isContract(a));
  return codeCache.get(k)!;
}

function effectiveTerms(s: State, id: number, holder: Address, holderIsContract: boolean): Terms {
  const t = s.terms[id];
  if (t && lc(t.setBy) === lc(holder)) return { price: BigInt(t.price), closed: t.closed, defaults: false, holderIsContract };
  return { price: DEFAULT_PRICE, closed: holderIsContract, defaults: true, holderIsContract };
}

function leaseActive(l: StoredLease | undefined, holder: Address, t = now()) {
  return !!l && t < l.until && lc(l.ownerAtStart) === lc(holder);
}

function pushActivity(s: State, a: State["recent"][number]) {
  s.recent.unshift(a);
  s.recent = s.recent.slice(0, RECENT);
}

const SIMULATED: TxResult = { hash: null, block: null, simulated: true };

export class PreviewClient implements DybboClient {
  readonly preview = true;
  address = null;

  async status(owners: { id: number; owner: Address; ownerIsContract: boolean }[]): Promise<Status[]> {
    const s = load();
    const t = now();
    return owners.map(({ id, owner: o, ownerIsContract }) => {
      const terms = effectiveTerms(s, id, o, ownerIsContract);
      const l = s.leases[id];
      const leased = leaseActive(l, o, t);
      return {
        id, owner: o, leased, until: leased ? l!.until : 0, possessor: leased ? l!.possessor : null,
        price: terms.price, closed: terms.closed,
        closedReason: terms.closed ? (terms.defaults ? "contract" : "holder") : null,
        escrow: BigInt(s.escrow[id] ?? "0"),
      };
    });
  }

  async leaseOf(id: number): Promise<Lease | null> {
    const l = load().leases[id];
    if (!l) return null;
    const holder = await owner(id);
    return { ...l, fee: BigInt(l.fee), active: leaseActive(l, holder) };
  }

  async termsOf(id: number): Promise<Terms> {
    const holder = await owner(id);
    return effectiveTerms(load(), id, holder, await hasCode(holder));
  }

  async escrowOf(id: number) {
    return BigInt(load().escrow[id] ?? "0");
  }

  async marksOf(id: number) {
    const t = now();
    return (load().marks[id] ?? []).filter((m) => t - m.at < MARK_TTL).sort((a, b) => b.at - a.at);
  }

  async recentActivity(): Promise<Activity[]> {
    return load().recent.map((a) => ({
      ...a,
      ...(a.fee !== undefined ? { fee: BigInt(a.fee) } : {}),
      ...(a.amount !== undefined ? { amount: BigInt(a.amount) } : {}),
    })) as Activity[];
  }

  async stats(): Promise<Stats> {
    const s = load();
    return {
      possessions: s.counters.possessions, haunts: s.counters.haunts,
      paid: BigInt(s.counters.paid), claimed: BigInt(s.counters.claimed),
      possessors: s.possessors.length, tokens: s.tokens.length,
    };
  }

  async lastHauntAt(sourceId: number) {
    return load().lastHauntAt[sourceId] ?? 0;
  }

  async canHaunt(actor: Address, sourceId: number, targetId: number, markId = 0) {
    try {
      await this.haunt(actor, sourceId, targetId, markId, true);
      return null;
    } catch (e) {
      if (e instanceof DybboError) return e.errorName;
      throw e;
    }
  }

  async possess(actor: Address, id: number, minutes: number, value: bigint, dryRun = false) {
    if (!isTokenId(id)) throw new DybboError("TokenOutOfRange");
    const holder = await owner(id);
    if (lc(holder) === lc(actor)) throw new DybboError("SelfDybbo");
    const s = load();
    const terms = effectiveTerms(s, id, holder, await hasCode(holder));
    if (terms.closed) throw new DybboError("Closed");
    if (leaseActive(s.leases[id], holder)) throw new DybboError("LeaseActive");
    if (!Number.isInteger(minutes) || minutes < MIN_MINUTES || minutes > MAX_MINUTES) throw new DybboError("DurationOutOfRange");
    if (value !== terms.price * BigInt(minutes)) throw new DybboError("WrongPayment");
    if (dryRun) return SIMULATED;
    await wait(450);
    const s2 = load();
    const t = now();
    s2.leases[id] = { possessor: actor, until: t + minutes * 60, ownerAtStart: holder, startedAt: t, fee: value.toString() };
    s2.escrow[id] = (BigInt(s2.escrow[id] ?? "0") + value).toString();
    s2.counters.possessions++;
    s2.counters.paid = (BigInt(s2.counters.paid) + value).toString();
    if (!s2.possessors.includes(lc(actor))) s2.possessors.push(lc(actor));
    if (!s2.tokens.includes(id)) s2.tokens.push(id);
    pushActivity(s2, { kind: "possess", id, actor, at: t, minutes, fee: value.toString() });
    save(s2);
    return SIMULATED;
  }

  async haunt(actor: Address, sourceId: number, targetId: number, markId: number, dryRun = false) {
    if (!isTokenId(sourceId) || !isTokenId(targetId)) throw new DybboError("TokenOutOfRange");
    const s = load();
    const t = now();
    const holder = await owner(sourceId);
    const l = s.leases[sourceId];
    let byPossessor: boolean;
    if (l && lc(l.possessor) === lc(actor)) {
      // Possessor path: the lease must still be live, checked against ownerOf right now.
      if (lc(holder) !== lc(l.ownerAtStart)) throw new DybboError("OwnerChanged");
      if (t >= l.until) throw new DybboError("LeaseExpired");
      byPossessor = true;
    } else if (lc(holder) === lc(actor)) {
      if (leaseActive(l, holder, t)) throw new DybboError("LeaseActive");
      byPossessor = false;
    } else {
      throw new DybboError("NotController");
    }
    if (sourceId === targetId) throw new DybboError("SameToken");
    if (markId < 0 || markId > 2) throw new DybboError("BadMark");
    const targetHolder = await owner(targetId);
    if (effectiveTerms(s, targetId, targetHolder, await hasCode(targetHolder)).closed) throw new DybboError("Closed");
    if (t - (s.lastHauntAt[sourceId] ?? 0) < HAUNT_COOLDOWN) throw new DybboError("Cooldown", String(HAUNT_COOLDOWN - (t - (s.lastHauntAt[sourceId] ?? 0))));
    if (t - (s.lastPairAt[`${sourceId}:${targetId}`] ?? -Infinity) < TARGET_REPEAT_WINDOW) throw new DybboError("TargetRepeat");
    if (dryRun) return SIMULATED;
    await wait(350);
    const s2 = load();
    const at = now();
    const mark: Mark = { sourceId, targetId, actor, markId, at, byPossessor };
    s2.marks[targetId] = [mark, ...(s2.marks[targetId] ?? [])].slice(0, MARKS_PER_TOKEN);
    s2.lastHauntAt[sourceId] = at;
    s2.lastPairAt[`${sourceId}:${targetId}`] = at;
    s2.counters.haunts++;
    pushActivity(s2, { kind: "haunt", id: sourceId, targetId, actor, at, markId, byPossessor });
    save(s2);
    return SIMULATED;
  }

  async claim(actor: Address, ids: number[], dryRun = false) {
    const s = load();
    let total = 0n;
    for (const id of ids) {
      if (!isTokenId(id)) throw new DybboError("TokenOutOfRange");
      if (lc(await owner(id)) !== lc(actor)) throw new DybboError("NotOwner");
      total += BigInt(s.escrow[id] ?? "0");
    }
    if (total === 0n) throw new DybboError("NothingToClaim");
    if (dryRun) return SIMULATED;
    await wait(400);
    const s2 = load();
    const at = now();
    for (const id of ids) {
      const amount = BigInt(s2.escrow[id] ?? "0");
      if (amount === 0n) continue;
      s2.escrow[id] = "0";
      s2.counters.claimed = (BigInt(s2.counters.claimed) + amount).toString();
      pushActivity(s2, { kind: "claim", id, actor, at, amount: amount.toString() });
    }
    save(s2);
    return SIMULATED;
  }

  async setTerms(actor: Address, id: number, price: bigint, closed: boolean, dryRun = false) {
    if (!isTokenId(id)) throw new DybboError("TokenOutOfRange");
    if (lc(await owner(id)) !== lc(actor)) throw new DybboError("NotOwner");
    if (price < MIN_PRICE || price > MAX_PRICE) throw new DybboError("PriceOutOfRange");
    if (dryRun) return SIMULATED;
    await wait(350);
    const s2 = load();
    s2.terms[id] = { price: price.toString(), closed, setBy: actor };
    save(s2);
    return SIMULATED;
  }
}
