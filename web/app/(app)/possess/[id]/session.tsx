"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Address } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { ChogArt } from "@/components/chog-art";
import { HauntPanel, useNames } from "@/components/haunt-panel";
import { LeaseBar } from "@/components/lease-bar";
import { MarkChip } from "@/components/mark-row";
import { Revert } from "@/components/tx";
import { approvals, chogAbi, simulateTake } from "@/lib/chain";
import { DYBBO_ADDRESS, HAUNT_COOLDOWN, PREVIEW, explorerRead, CHOG_ADDRESS } from "@/lib/config";
import { dybbo, ERROR_TEXT, type DybboErrorName } from "@/lib/dybbo";
import { ago, clock, mon, shortAddr, timeOfDay } from "@/lib/format";
import { useActivity, useActor, useLastHaunt, useLease, useNow, useOwner } from "@/lib/hooks";
import type { Chog } from "@/lib/chogs";

const lc = (a?: string | null) => (a ?? "").toLowerCase();
const ZERO = "0x0000000000000000000000000000000000000000";

export function Session({ chog }: { chog: Chog }) {
  const id = chog.id;
  const n = chog.metaId;
  const router = useRouter();
  const now = useNow(100);
  const { actor } = useActor();
  const lease = useLease(id);
  const owner = useOwner(id);
  const l = lease.data;
  const mine = !!l && !!actor && lc(l.possessor) === lc(actor);

  // Redirect to the token page if this wallet holds no lease here, judged on a read made after this
  // page mounted: a cached read from before the possession would bounce the new possessor away.
  useEffect(() => {
    if (lease.isFetchedAfterMount && !lease.isFetching && actor && !mine) router.replace(`/chog/${id}`);
  }, [lease.isFetchedAfterMount, lease.isFetching, actor, mine, id, router]);

  if (!l || !mine || !actor) {
    return (
      <div className="title-row">
        <div>
          <h1>Possessing #{n}</h1>
          <p className="sub">{lease.isLoading || !actor ? "Reading your lease from Monad…" : "No lease on this Chog for this wallet."}</p>
        </div>
      </div>
    );
  }

  const ownerChanged = !!owner.data && lc(owner.data) !== lc(l.ownerAtStart);
  const over = now >= l.until;
  const state: "live" | "over" | "sold" = ownerChanged ? "sold" : over ? "over" : "live";
  const start = l.startedAt || l.until - 600;

  return (
    <>
      <div className="title-row">
        <div>
          <h1>Possessing #{n}</h1>
          <p className="sub num">
            Lease paid {l.fee ? `${mon(l.fee)} MON` : "in full"} to #{n}&rsquo;s escrow{l.startedAt ? ` · started ${timeOfDay(l.startedAt)}` : ""}
          </p>
        </div>
        <div className="title-row__actions">
          <Link className="btn btn--secondary" href={`/chog/${id}`}>#{n}&rsquo;s page</Link>
        </div>
      </div>

      <div className={`strip${state === "live" ? "" : " strip--over"}`} aria-hidden="true">
        <span className="num">{state === "live" ? clock(l.until - now) : "0:00"}</span>
        <LeaseBar start={start} until={l.until} now={now} />
      </div>

      <div className="session">
        <div className="stack">
          <section className={`card leasecard leasecard--${state}`} aria-labelledby="lease-h">
            <div className="leasecard__top">
              <ChogArt id={id} name={chog.name} w={192} className="leasecard__art" priority />
              <div className="row__main">
                <h2 id="lease-h" className="card__title">Lease on #{n}</h2>
                <p className="figure-lg num" aria-live="off">
                  {state === "live" ? clock(l.until - now) : "0:00"}
                  <span className="unit">{state === "live" ? "left" : "ended"}</span>
                </p>
              </div>
              <span className={`pill ${state === "live" ? "pill--held" : state === "sold" ? "pill--neg" : "pill--closed"}`}>
                {state === "live" ? "Live" : state === "sold" ? "Owner changed" : "Ended"}
              </span>
            </div>
            <LeaseBar start={start} until={l.until} now={now} />
            <dl className="well">
              <div className="kv"><dt>Ends</dt><dd className="num">{timeOfDay(l.until)}</dd></div>
              <div className="kv">
                <dt>Validity</dt>
                <dd>
                  {ownerChanged ? (
                    <span className="neg">Holder changed since you started</span>
                  ) : (
                    <>Holder unchanged since you started (<span className="mono">{shortAddr(l.ownerAtStart)}</span>)</>
                  )}
                </dd>
              </div>
              <Cooldown id={id} now={now} live={state === "live"} />
            </dl>
            {state !== "live" && <AfterLease id={id} n={n} actor={actor} sold={state === "sold"} until={l.until} />}
          </section>

          {state === "live" && <HauntPanel sourceId={id} actor={actor} mode="possessor" />}
          <YourMarks id={id} actor={actor} since={start} now={now} />
        </div>

        <div className="stack">
          <TakeIt id={id} n={n} actor={actor} holder={owner.data ?? l.ownerAtStart} />
        </div>
      </div>
    </>
  );
}

function Cooldown({ id, now, live }: { id: number; now: number; live: boolean }) {
  const last = useLastHaunt(id);
  const left = Math.max(0, (last.data ?? 0) + HAUNT_COOLDOWN - now);
  return (
    <div className="kv">
      <dt>Next haunt</dt>
      <dd className="num">{!live ? "—" : left > 0 ? `in ${Math.ceil(left)} s` : "Ready"}</dd>
    </div>
  );
}

function AfterLease({ id, n, actor, sold, until }: { id: number; n: number; actor: Address; sold: boolean; until: number }) {
  const [result, setResult] = useState<DybboErrorName | null | "none">("none");
  const [target, setTarget] = useState<number | null>(null);
  useEffect(() => {
    fetch(`/api/random-open?exclude=${id}`).then((r) => r.json()).then((d) => setTarget(d.id)).catch(() => {});
  }, [id]);
  async function tryOne() {
    try {
      await dybbo.haunt(actor, id, target ?? (id === 1 ? 2 : 1), 0, true);
      setResult(null);
    } catch (e) {
      setResult((e as { errorName?: DybboErrorName }).errorName ?? null);
    }
  }
  return (
    <div className="after">
      <p className="body16">
        {sold ? "This Chog changed hands; your lease ended." : `Your lease on #${n} ended at ${timeOfDay(until)}.`}
      </p>
      <div className="after__actions">
        <button className="btn btn--secondary" onClick={tryOne}>Try one more haunt</button>
        <Link className="btn btn--primary" href={sold ? "/api/random-open?go=1" : `/chog/${id}`}>
          {sold ? "Possess another Chog" : "Possess again"}
        </Link>
      </div>
      {result !== "none" &&
        (result ? <Revert name={result} message={ERROR_TEXT[result]} /> : <p className="txnote">The haunt would go through.</p>)}
    </div>
  );
}

function YourMarks({ id, actor, since, now }: { id: number; actor: Address; since: number; now: number }) {
  const activity = useActivity();
  const names = useNames();
  const mine = (activity.data ?? []).filter((a) => a.kind === "haunt" && a.id === id && lc(a.actor) === lc(actor) && a.at >= since);
  return (
    <section className="card" aria-labelledby="yours-h">
      <div className="card__head">
        <h2 id="yours-h">Your marks this session</h2>
        <span className="card__meta num">{mine.length} {mine.length === 1 ? "mark" : "marks"}</span>
      </div>
      {mine.length ? (
        <ul className="rows">
          {mine.map((a) =>
            a.kind === "haunt" ? (
              <li className="row" key={`${a.targetId}-${a.at}`}>
                <MarkChip id={a.markId} />
                <span className="row__main">
                  on <Link className="link" href={`/chog/${a.targetId}`}>#{names.n(a.targetId)}</Link>, signed &ldquo;by #{names.n(id)}, possessed&rdquo;
                </span>
                <span className="row__end muted">{ago(a.at, now)}</span>
              </li>
            ) : null,
          )}
        </ul>
      ) : (
        <p className="empty">No marks yet. Pick a target and haunt it.</p>
      )}
    </section>
  );
}

function TakeIt({ id, n, actor, holder }: { id: number; n: number; actor: Address; holder: Address }) {
  const [take, setTake] = useState<{ reverted: boolean; reason: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [reads, setReads] = useState<{ approvedForAll: boolean; approved: string } | null>(null);
  const operator = (DYBBO_ADDRESS || ZERO) as Address;
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    approvals(holder, operator, id).then(setReads).catch(() => {});
  }, [holder, operator, id]);

  async function tryTake() {
    setBusy(true);
    setTake(await simulateTake(actor, holder, id));
    setBusy(false);
  }

  return (
    <section className="card takeit" aria-labelledby="take-h">
      <div className="card__head">
        <h2 id="take-h">Try to take it</h2>
        <span className="card__meta">Runs on Chog Genesis itself</span>
      </div>
      <p className="body16">
        You control #{n} inside Dybbo. See whether you can move it out of its holder&rsquo;s wallet.
      </p>
      <button className="btn btn--primary btn--lg btn--block" onClick={tryTake} disabled={busy}>
        {busy ? "Asking Monad…" : "Try to take it"}
      </button>
      {take &&
        (take.reverted ? (
          <Revert
            name={take.reason}
            message={take.reason === "ERC721InsufficientApproval" ? `Nobody approved you to move #${n}. You control it inside Dybbo only.` : `You control #${n} inside Dybbo only.`}
          />
        ) : (
          <p className="txnote">The transfer would not revert. Report this.</p>
        ))}
      <dl className="well">
        <div className="kv">
          <dt>Approved for all</dt>
          <dd>{reads ? <span className={reads.approvedForAll ? "neg" : ""}>{String(reads.approvedForAll)}</span> : <span className="skel">false</span>}</dd>
        </div>
        <div className="kv">
          <dt>Approved address</dt>
          <dd className="mono">{reads ? shortAddr(reads.approved) : <span className="skel">0x0000…0000</span>}</dd>
        </div>
      </dl>
      <p className="row__sub">
        {PREVIEW ? "Read as isApprovedForAll(holder, Dybbo) once Dybbo is deployed; shown here against the zero address." : "isApprovedForAll(holder, Dybbo) and getApproved(token) on Chog Genesis."}{" "}
        <a className="link" href={explorerRead(CHOG_ADDRESS)}>Read on MonadScan</a>
      </p>
      <SendReal id={id} holder={holder} />
    </section>
  );
}

function SendReal({ id, holder }: { id: number; holder: Address }) {
  const { address } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  return (
    <details className="sendreal">
      <summary className="btn btn--text">Send it for real</summary>
      <p className="row__sub">
        A reverted transaction still pays gas on Monad, charged on the gas limit (100,000 here). The simulation above shows the same revert for free.
      </p>
      <button
        className="btn btn--secondary"
        disabled={!address || isPending}
        onClick={() =>
          address &&
          writeContract({ address: CHOG_ADDRESS, abi: chogAbi, functionName: "transferFrom", args: [holder, address, BigInt(id)], gas: 100_000n, chainId: 143 })
        }
      >
        {!address ? "Connect a wallet to send" : isPending ? "Confirm in wallet…" : "Send transferFrom from my wallet"}
      </button>
      {hash && <p className="row__sub">Sent: <a className="link mono" href={`https://monadscan.com/tx/${hash}`}>{shortAddr(hash)}</a></p>}
      {error && <p className="row__sub">{(error as { shortMessage?: string }).shortMessage ?? error.message}</p>}
    </details>
  );
}
