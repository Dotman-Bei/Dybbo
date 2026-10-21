import type { Address } from "viem";

export type Lease = { possessor: Address; until: number; ownerAtStart: Address; active: boolean; startedAt: number; fee: bigint };
export type Terms = { price: bigint; closed: boolean; defaults: boolean; holderIsContract: boolean };
export type Mark = { sourceId: number; targetId: number; actor: Address; markId: number; at: number; byPossessor: boolean };
export type Activity =
  | { kind: "possess"; id: number; actor: Address; at: number; minutes: number; fee: bigint }
  | { kind: "haunt"; id: number; targetId: number; actor: Address; at: number; markId: number; byPossessor: boolean }
  | { kind: "claim"; id: number; actor: Address; at: number; amount: bigint };
export type Stats = { possessions: number; haunts: number; paid: bigint; claimed: bigint; possessors: number; tokens: number };
export type Status = {
  id: number;
  owner: Address;
  leased: boolean;
  until: number;
  possessor: Address | null;
  price: bigint;
  closed: boolean;
  closedReason: "holder" | "contract" | null;
  escrow: bigint;
};

/** Custom errors from PRD §8.7, plus the Chog contract's own revert for "Try to take it". */
export type DybboErrorName =
  | "TokenOutOfRange" | "Closed" | "LeaseActive" | "LeaseExpired" | "OwnerChanged" | "SelfDybbo"
  | "WrongPayment" | "DurationOutOfRange" | "PriceOutOfRange" | "NotOwner" | "NotController"
  | "SameToken" | "Cooldown" | "TargetRepeat" | "BadMark" | "NothingToClaim";

export class DybboError extends Error {
  constructor(public errorName: DybboErrorName, public detail = "") {
    super(errorName);
  }
}

/** One plain sentence for each revert, shown under the button that caused it. */
export const ERROR_TEXT: Record<DybboErrorName, string> = {
  TokenOutOfRange: "Chog Genesis runs from #1 to #1,969.",
  Closed: "This Chog is closed. It can't be possessed or haunted.",
  LeaseActive: "Someone else is possessing this Chog right now.",
  LeaseExpired: "Your lease has ended. Possess it again to act with it.",
  OwnerChanged: "This Chog changed hands, so your lease ended.",
  SelfDybbo: "You hold this Chog. Haunt with it in holder mode instead.",
  WrongPayment: "The payment must equal the price times the minutes.",
  DurationOutOfRange: "Leases run from 1 to 10 minutes.",
  PriceOutOfRange: "Prices run from 0.001 to 1 MON a minute.",
  NotOwner: "Only the wallet holding this Chog can do that.",
  NotController: "You don't control this Chog right now.",
  SameToken: "A Chog can't haunt itself.",
  Cooldown: "One haunt every 15 seconds. Wait a moment.",
  TargetRepeat: "This Chog already has your mark today.",
  BadMark: "Pick Boo, Slime or Hex.",
  NothingToClaim: "There is nothing in escrow to claim.",
};

export type TxResult = { hash: string | null; block: number | null; simulated: boolean };

export interface DybboClient {
  readonly preview: boolean;
  address: Address | null;
  status(owners: { id: number; owner: Address; ownerIsContract: boolean }[]): Promise<Status[]>;
  leaseOf(id: number): Promise<Lease | null>;
  termsOf(id: number): Promise<Terms>;
  escrowOf(id: number): Promise<bigint>;
  marksOf(id: number): Promise<Mark[]>;
  recentActivity(): Promise<Activity[]>;
  stats(): Promise<Stats>;
  lastHauntAt(sourceId: number): Promise<number>;
  canHaunt(actor: Address, sourceId: number, targetId: number, markId?: number): Promise<DybboErrorName | null>;
  possess(actor: Address, id: number, minutes: number, value: bigint, dryRun?: boolean): Promise<TxResult>;
  haunt(actor: Address, sourceId: number, targetId: number, markId: number, dryRun?: boolean): Promise<TxResult>;
  claim(actor: Address, ids: number[], dryRun?: boolean): Promise<TxResult>;
  setTerms(actor: Address, id: number, price: bigint, closed: boolean, dryRun?: boolean): Promise<TxResult>;
}
