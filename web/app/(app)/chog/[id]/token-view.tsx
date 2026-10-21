"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChogArt } from "@/components/chog-art";
import { HauntPanel, useNames } from "@/components/haunt-panel";
import { MarkChip } from "@/components/mark-row";
import { LeaseBar } from "@/components/lease-bar";
import { busyLabel, Revert, TxNote, useTx } from "@/components/tx";
import { DEFAULT_PRICE, MAX_MINUTES, MAX_PRICE, MIN_MINUTES, MIN_PRICE, PREVIEW, WEI, explorerAddress } from "@/lib/config";
import { dybbo, type DybboErrorName } from "@/lib/dybbo";
import { ago, clock, mon, price, shortAddr, timeOfDay } from "@/lib/format";
import { useActivity, useActor, useEscrow, useLease, useMarks, useMonBalance, useNow, useOwner, useStatus, useTerms } from "@/lib/hooks";
import type { Chog } from "@/lib/chogs";

const lc = (a?: string | null) => (a ?? "").toLowerCase();

export function TokenView({ chog, initialMinutes, strike }: { chog: Chog; initialMinutes: number; strike?: number }) {
  const id = chog.id;
  const n = chog.metaId;
  const now = useNow(250);
  const { actor, isPreviewWallet } = useActor();
  const owner = useOwner(id);
  const lease = useLease(id);
  const isHolder = !!actor && lc(owner.data) === lc(actor);
  const tier = chog.attributes.find(([k]) => k === "Tier")?.[1];

  return (
    <>
      <div className="title-row">
        <div>
          <h1>CHOG #{n}</h1>
          <p className="sub">
            Token {id}
            {tier ? ` · ${tier}` : ""} · held by{" "}
            {owner.data ? (
              <a className="link mono" href={explorerAddress(owner.data)}>{isHolder ? "you" : shortAddr(owner.data)}</a>
            ) : owner.error ? (
              "—"
            ) : (
              <span className="skel">0x0000…0000</span>
            )}
          </p>
        </div>
      </div>

      <div className="token">
        <div className="stack">
          <div className="token__art o-art">
            <ChogArt id={id} name={chog.name} w={1000} priority sizes="(max-width: 960px) 92vw, 560px" />
          </div>
          <section className="card o-traits" aria-labelledby="traits">
            <div className="card__head">
              <h2 id="traits">Traits</h2>
              <span className="card__meta">From the token&rsquo;s metadata</span>
            </div>
            <dl className="well traits">
              {chog.attributes.map(([k, v]) => (
                <div className="kv" key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <div className="stack">
          <LeaseCard id={id} n={n} now={now} actor={actor} isHolder={isHolder} isPreviewWallet={isPreviewWallet} initialMinutes={initialMinutes} />
          <EscrowCard id={id} n={n} actor={actor} isHolder={isHolder} />
          <MarksCard id={id} n={n} now={now} />
          {isHolder && actor && (
            <>
              <TermsCard id={id} actor={actor} />
              <HauntPanel
                sourceId={id}
                actor={actor}
                mode="holder"
                initialTarget={strike}
                disabledReason={lease.data?.active ? "Someone is possessing this Chog. Holder mode opens when the lease ends." : null}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}

function LeaseCard({
  id, n, now, actor, isHolder, isPreviewWallet, initialMinutes,
}: {
  id: number; n: number; now: number; actor: `0x${string}` | null; isHolder: boolean; isPreviewWallet: boolean; initialMinutes: number;
}) {
  const router = useRouter();
  const status = useStatus(id);
  const terms = useTerms(id);
  const lease = useLease(id);
  const balance = useMonBalance(isPreviewWallet ? null : actor);
  const [minutes, setMinutes] = useState(Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.round(initialMinutes))));
  const tx = useTx();
  const s = status.data;
  const p = s?.price ?? DEFAULT_PRICE;
  const fee = p * BigInt(minutes);
  const leased = !!s?.leased && s.until > now;
  const mine = leased && lc(s?.possessor) === lc(actor);

  let state: "loading" | "closed" | "leased" | "open" = "loading";
  if (s) state = s.closed ? "closed" : leased ? "leased" : "open";

  const reason: string | null =
    state === "loading" ? "Reading this Chog from Monad…"
    : state === "closed" ? (s?.closedReason === "contract" ? "Closed: held by a contract. Its holder can open it." : "Closed by its holder.")
    : state === "leased" ? (mine ? null : `Possessed until ${timeOfDay(s!.until)}.`)
    : isHolder ? "You hold this Chog. Haunt with it below instead."
    : !actor ? "Connect a wallet to possess."
    : balance !== null && balance < fee ? `Your balance is ${mon(balance)} MON; this lease costs ${mon(fee)} MON.`
    : null;

  function possess() {
    if (!actor) return;
    tx.run(
      () => dybbo.possess(actor, id, minutes, fee, true),
      () => dybbo.possess(actor, id, minutes, fee),
      () => router.push(`/possess/${id}`),
    );
  }

  return (
    <section className="card lease o-lease" aria-labelledby="lease-title">
      <div className="card__head">
        <h2 id="lease-title">Lease</h2>
        {state === "open" && <span className="pill pill--open">Open</span>}
        {state === "leased" && <span className="pill pill--held">Possessed</span>}
        {state === "closed" && <span className="pill pill--closed">Closed</span>}
      </div>

      {state === "loading" && <p className="figure-md"><span className="skel">Open at 0.01 MON a minute</span></p>}
      {state === "open" && (
        <p className="figure-md num">
          {price(p)}<span className="unit">MON a minute</span>
          <span className="lease__src">{terms.data?.defaults === false ? "set by the holder" : "default price"}</span>
        </p>
      )}
      {state === "closed" && <p className="figure-md">{reason}</p>}
      {state === "leased" && lease.data && (
        <>
          <p className="figure-md num">
            {clock(s!.until - now)}<span className="unit">left</span>
          </p>
          <LeaseBar start={lease.data.startedAt || s!.until - 600} until={s!.until} now={now} />
          <p className="lease__who">
            Possessed by <span className="mono">{mine ? "you" : shortAddr(s!.possessor)}</span> until <span className="num">{timeOfDay(s!.until)}</span>
          </p>
        </>
      )}

      {(state === "open" || state === "loading") && !isHolder && (
        <>
          <div className="stepper" role="group" aria-label="Minutes">
            <span className="label">Minutes</span>
            <div className="stepper__ctl">
              <button className="btn btn--secondary" aria-label="One minute less" disabled={minutes <= MIN_MINUTES} onClick={() => setMinutes(minutes - 1)}>−</button>
              <output className="stepper__val num" aria-live="polite">{minutes}</output>
              <button className="btn btn--secondary" aria-label="One minute more" disabled={minutes >= MAX_MINUTES} onClick={() => setMinutes(minutes + 1)}>+</button>
            </div>
          </div>
          <dl className="well">
            <div className="kv"><dt>Fee to #{n}&rsquo;s escrow</dt><dd className="num">{mon(fee)} MON</dd></div>
            <div className="kv"><dt>Gas</dt><dd className="num"><span className="muted">{PREVIEW ? "none in preview" : "shown in your wallet"}</span></dd></div>
            <div className="kv"><dt>Your balance</dt><dd className="num">{balance !== null ? `${mon(balance)} MON` : <span className="muted">{isPreviewWallet ? "preview wallet" : "—"}</span>}</dd></div>
          </dl>
        </>
      )}

      {mine ? (
        <Link className="btn btn--primary btn--lg btn--block" href={`/possess/${id}`}>Open your session</Link>
      ) : state !== "closed" && !isHolder ? (
        <button className="btn btn--primary btn--lg btn--block" disabled={!!reason || tx.busy} onClick={possess}>
          {busyLabel(tx.state, `Possess for ${minutes} min`)}
        </button>
      ) : null}
      {reason && !mine && state !== "closed" && <p className="lease__why">{reason}</p>}
      <TxNote s={tx.state} done="Lease started." />
      <p className="lease__fine">No refunds if the lease ends early or the Chog is sold. Possessing never asks for an approval.</p>
    </section>
  );
}

function EscrowCard({ id, n, actor, isHolder }: { id: number; n: number; actor: `0x${string}` | null; isHolder: boolean }) {
  const escrow = useEscrow(id);
  const tx = useTx();
  // A try belongs to the wallet that made it; switching wallets clears it.
  const [triedBy, setTriedBy] = useState<{ actor: string | null; r: DybboErrorName | null } | null>(null);
  const tried: DybboErrorName | null | "none" = triedBy && triedBy.actor === actor ? triedBy.r : "none";
  const setTried = (r: DybboErrorName | null) => setTriedBy({ actor, r });
  const amount = escrow.data ?? 0n;

  async function tryClaim() {
    if (!actor) return;
    try {
      await dybbo.claim(actor, [id], true);
      setTried(null);
    } catch (e) {
      setTried((e as { errorName?: DybboErrorName }).errorName ?? null);
    }
  }

  return (
    <section className="card" aria-labelledby="escrow-title">
      <div className="card__head">
        <h2 id="escrow-title">Escrow</h2>
        <span className="card__meta">Claimable by whoever holds #{n}</span>
      </div>
      <p className={`figure-md num${amount === 0n ? " muted" : ""}`}>
        {escrow.isLoading ? <span className="skel">0.00 MON</span> : <>{mon(amount)}<span className="unit">MON waiting</span></>}
      </p>
      <p className="escrow__note">Unclaimed fees follow the token. If #{n} is sold, the buyer can claim them.</p>
      {isHolder && actor ? (
        <>
          <button
            className="btn btn--primary btn--block"
            disabled={amount === 0n || tx.busy}
            onClick={() => tx.run(() => dybbo.claim(actor, [id], true), () => dybbo.claim(actor, [id]))}
          >
            {busyLabel(tx.state, amount === 0n ? "Nothing to claim yet" : `Claim ${mon(amount)} MON`)}
          </button>
          <TxNote s={tx.state} done="Claimed." />
        </>
      ) : (
        <>
          <button className="btn btn--text" disabled={!actor} onClick={tryClaim}>Try to claim it</button>
          {tried !== "none" &&
            (tried ? (
              <Revert name={tried} message={tried === "NotOwner" ? `Only the wallet holding #${n} can claim.` : "The claim would fail."} />
            ) : (
              <p className="txnote">This wallet could claim it.</p>
            ))}
        </>
      )}
    </section>
  );
}

function MarksCard({ id, n, now }: { id: number; n: number; now: number }) {
  const marks = useMarks(id);
  const activity = useActivity();
  const names = useNames();
  const given = (activity.data ?? []).filter((a) => a.kind === "haunt" && a.id === id && now - a.at < 86400).slice(0, 5);
  return (
    <section className="card" aria-labelledby="marks-title">
      <div className="card__head">
        <h2 id="marks-title">Marks on #{n}</h2>
        <span className="card__meta">Last 24 hours · {marks.data?.length ?? 0} of 8</span>
      </div>
      {marks.isLoading ? (
        <div className="rows"><div className="row"><span className="skel" style={{ width: "60%" }}>loading</span></div></div>
      ) : marks.data && marks.data.length ? (
        <ul className="rows">
          {marks.data.map((m) => (
            <li className="row" key={`${m.sourceId}-${m.at}`}>
              <MarkChip id={m.markId} />
              <span className="row__main">
                by <Link className="link" href={`/chog/${m.sourceId}`}>#{names.n(m.sourceId)}</Link>
                {m.byPossessor ? ", possessed" : ""}
              </span>
              <span className="row__end muted">{ago(m.at, now)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">No marks in the last 24 hours.</p>
      )}
      <h3 className="card__title marks__given">Marks #{n} left</h3>
      {given.length ? (
        <ul className="rows">
          {given.map((a) =>
            a.kind === "haunt" ? (
              <li className="row" key={`${a.targetId}-${a.at}`}>
                <MarkChip id={a.markId} />
                <span className="row__main">
                  on <Link className="link" href={`/chog/${a.targetId}`}>#{names.n(a.targetId)}</Link>
                  {a.byPossessor ? ", possessed" : ""}
                </span>
                <span className="row__end muted">{ago(a.at, now)}</span>
              </li>
            ) : null,
          )}
        </ul>
      ) : (
        <p className="empty">#{n} hasn&rsquo;t haunted anyone today.</p>
      )}
    </section>
  );
}

function TermsCard({ id, actor }: { id: number; actor: `0x${string}` }) {
  const terms = useTerms(id);
  const tx = useTx();
  // Untouched fields show the stored terms; typing takes over.
  const [priceEdit, setPriceText] = useState<string | null>(null);
  const [closedEdit, setClosed] = useState<boolean | null>(null);
  const priceText = priceEdit ?? (terms.data ? price(terms.data.price) : "");
  const closed = closedEdit ?? terms.data?.closed ?? false;
  const parsed = /^\d*\.?\d+$/.test(priceText) ? BigInt(Math.round(Number(priceText) * 1e6)) * (WEI / 1_000_000n) : null;
  const valid = parsed !== null && parsed >= MIN_PRICE && parsed <= MAX_PRICE;

  return (
    <section className="card" aria-labelledby="terms-title">
      <div className="card__head">
        <h2 id="terms-title">Your terms</h2>
        <span className="card__meta">{terms.data?.defaults ? "Defaults apply" : "Set by you"}</span>
      </div>
      <form
        className="terms"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          tx.run(() => dybbo.setTerms(actor, id, parsed!, closed, true), () => dybbo.setTerms(actor, id, parsed!, closed));
        }}
      >
        <label className="terms__field">
          <span className="label">Price per minute (MON)</span>
          <input className="field num" inputMode="decimal" value={priceText} onChange={(e) => setPriceText(e.target.value)} aria-invalid={!valid} />
          <span className="row__sub">From 0.001 to 1 MON. Applies to new leases.</span>
        </label>
        <label className="toggle">
          <input type="checkbox" role="switch" checked={!closed} onChange={(e) => setClosed(!e.target.checked)} />
          <span className="toggle__track" aria-hidden="true" />
          <span>{closed ? "Closed: nobody can possess or haunt it" : "Open to possession"}</span>
        </label>
        {terms.data?.holderIsContract && <p className="notice">Your wallet has code, so this Chog starts closed. Open it here.</p>}
        <button className="btn btn--secondary" disabled={!valid || tx.busy}>{busyLabel(tx.state, "Save terms")}</button>
        <TxNote s={tx.state} done="Terms saved." />
      </form>
    </section>
  );
}
