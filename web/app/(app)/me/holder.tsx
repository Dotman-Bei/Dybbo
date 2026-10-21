"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import type { Address } from "viem";
import { useAccount } from "wagmi";
import { ChogArt } from "@/components/chog-art";
import { MarkChip } from "@/components/mark-row";
import { WalletButton } from "@/components/shell";
import { StatusPill } from "@/components/status-pill";
import { useNames } from "@/components/haunt-panel";
import { busyLabel, TxNote, useTx } from "@/components/tx";
import { isContract, tokensOfOwner } from "@/lib/chain";
import { DEFAULT_PRICE } from "@/lib/config";
import { dybbo } from "@/lib/dybbo";
import { ago, mon, price, shortAddr } from "@/lib/format";
import { useNow } from "@/lib/hooks";

const lc = (a?: string | null) => (a ?? "").toLowerCase();

export function Holder({ viewAddress }: { viewAddress: Address | null }) {
  const { address } = useAccount();
  const who = viewAddress ?? address ?? null;
  const own = !!address && lc(address) === lc(who);
  const now = useNow(1000);
  const names = useNames();
  const tx = useTx();
  const [lookup, setLookup] = useState("");

  const held = useQuery({
    queryKey: ["held", who],
    enabled: !!who,
    queryFn: async () => {
      const [ids, contract] = await Promise.all([tokensOfOwner(who!), isContract(who!)]);
      return { ids, contract };
    },
  });
  const ids = held.data?.ids ?? [];
  const data = useQuery({
    queryKey: ["dybbo", "holder", who, ids.join(",")],
    enabled: !!held.data,
    queryFn: async () => {
      const rows = ids.map((id) => ({ id, owner: who!, ownerIsContract: held.data!.contract }));
      const [statuses, marks] = await Promise.all([dybbo.status(rows), Promise.all(ids.map((id) => dybbo.marksOf(id)))]);
      return { statuses, marks };
    },
    refetchInterval: 15_000,
  });

  if (!who) {
    return (
      <>
        <div className="title-row">
          <div>
            <h1>My Chogs</h1>
            <p className="sub">Connect a wallet to see the Chogs it holds, what they earned and who haunted them.</p>
          </div>
          <div className="title-row__actions"><WalletButton /></div>
        </div>
        <LookUp value={lookup} onChange={setLookup} />
      </>
    );
  }

  const statuses = data.data?.statuses ?? [];
  const marks = (data.data?.marks ?? []).flat().sort((a, b) => b.at - a.at);
  const total = statuses.reduce((s, x) => s + x.escrow, 0n);
  const withEscrow = statuses.filter((s) => s.escrow > 0n);
  const hauntedCount = new Set(marks.map((m) => m.targetId)).size;
  const loading = held.isLoading || data.isLoading;

  return (
    <>
      <div className="title-row">
        <div>
          <h1>My Chogs</h1>
          <p className="sub num">
            {loading ? (
              "Reading this wallet from Monad…"
            ) : held.error ? (
              "Couldn't reach Monad RPC."
            ) : (
              <>
                {ids.length} {ids.length === 1 ? "Chog" : "Chogs"} held by <span className="mono">{own ? "you" : shortAddr(who)}</span>
                {ids.length > 0 && <> · {hauntedCount} haunted in the last 24 hours</>}
                {!own && " · read-only"}
              </>
            )}
          </p>
        </div>
      </div>

      {held.data?.contract && (
        <p className="notice me__notice">
          This wallet has code (a contract or an EIP-7702 wallet), so its Chogs start closed. Open them under Edit terms.
        </p>
      )}

      {!loading && ids.length === 0 && !held.error ? (
        <div className="card">
          <p className="body16">This wallet holds no Chog Genesis. You can still possess one.</p>
          <div className="me__empty-actions">
            <a className="btn btn--primary" href="/api/random-open?go=1&minutes=5">Possess a random Chog</a>
            <Link className="btn btn--secondary" href="/chogs">Browse the Chogs</Link>
          </div>
        </div>
      ) : (
        <div className="split me">
          <div className="stack">
            <section className="card" aria-labelledby="yours-h">
              <div className="card__head">
                <h2 id="yours-h">{own ? "Your Chogs" : "Chogs held"}</h2>
                <span className="card__meta">Price, escrow and marks</span>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Chog</th>
                    <th>Status</th>
                    <th className="num">Price</th>
                    <th className="num">Escrow</th>
                    <th className="num">Marks</th>
                    <th><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody>
                  {(loading ? [0, 1, 2] : ids).map((id, i) => {
                    const s = statuses[i];
                    const m = data.data?.marks[i] ?? [];
                    return (
                      <tr key={id}>
                        <td>
                          <span className="t-chog">
                            {loading ? <span className="skel t-art" /> : <ChogArt id={id} name={`CHOG #${names.n(id)}`} w={96} className="t-art" />}
                            <span>
                              <span className="t-name num">{loading ? <span className="skel">#0000</span> : `#${names.n(id)}`}</span>
                              <span className="row__sub t-sub num">
                                {s ? `${price(s.price)} MON/min · ${mon(s.escrow)} MON` : ""}
                              </span>
                            </span>
                          </span>
                        </td>
                        <td><StatusPill s={s} now={now} /></td>
                        <td className="num">{s ? <>{price(s.price)} <span className="muted">{s.price === DEFAULT_PRICE ? "default" : "yours"}</span></> : <span className="skel">0.01</span>}</td>
                        <td className="num">{s ? (s.escrow > 0n ? `${mon(s.escrow)} MON` : <span className="muted">0.00</span>) : <span className="skel">0.00</span>}</td>
                        <td className="num">{s ? (m.length || <span className="muted">0</span>) : ""}</td>
                        <td className="t-act">{!loading && <Link className="btn btn--text" href={`/chog/${id}#terms-title`}>{own ? "Edit terms" : "Open"}</Link>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>

            <section className="card" aria-labelledby="marks-h">
              <div className="card__head">
                <h2 id="marks-h">{own ? "Marks on your Chogs" : "Marks on these Chogs"}</h2>
                <span className="card__meta">Last 24 hours</span>
              </div>
              {marks.length ? (
                <ul className="rows">
                  {marks.slice(0, 8).map((mk) => (
                    <li className="row" key={`${mk.targetId}-${mk.sourceId}-${mk.at}`}>
                      <MarkChip id={mk.markId} />
                      <span className="row__main">
                        on #{names.n(mk.targetId)} by <Link className="link" href={`/chog/${mk.sourceId}`}>#{names.n(mk.sourceId)}</Link>
                        {mk.byPossessor ? ", possessed" : ""}
                        <span className="row__sub"> · {ago(mk.at, now)}</span>
                      </span>
                      {own && (
                        <Link className="btn btn--secondary" href={`/chog/${mk.targetId}?strike=${mk.sourceId}#haunt-${mk.targetId}`}>
                          Strike back
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty">{loading ? "Reading marks…" : own ? "Nobody has haunted your Chogs in the last 24 hours." : "Nobody has haunted these Chogs in the last 24 hours."}</p>
              )}
            </section>
          </div>

          <section className="card escrowcard" aria-labelledby="escrow-h">
            <div className="card__head">
              <h2 id="escrow-h">Waiting in escrow</h2>
            </div>
            <p className={`figure-lg num${total === 0n ? " muted" : ""}`}>
              {loading ? <span className="skel">0.00</span> : mon(total)}
              <span className="unit">MON</span>
            </p>
            <p className="muted">
              {withEscrow.length ? `Across ${withEscrow.length} of your ${ids.length} Chogs. Fees follow the token if you sell.` : "Nothing yet. Every possession of your Chogs pays in here."}
            </p>
            {withEscrow.length > 0 && (
              <dl className="well">
                {withEscrow.map((s) => (
                  <div className="kv" key={s.id}><dt>#{names.n(s.id)}</dt><dd className="num">{mon(s.escrow)} MON</dd></div>
                ))}
              </dl>
            )}
            {own ? (
              <>
                <button
                  className="btn btn--primary btn--lg btn--block"
                  disabled={total === 0n || tx.busy}
                  onClick={() => {
                    const claimIds = withEscrow.map((s) => s.id);
                    tx.run(() => dybbo.claim(address!, claimIds, true), () => dybbo.claim(address!, claimIds));
                  }}
                >
                  {busyLabel(tx.state, total === 0n ? "Nothing to claim" : `Claim all ${mon(total)} MON`)}
                </button>
                <TxNote s={tx.state} done="Claimed to your wallet." />
              </>
            ) : (
              <p className="row__sub">Only the holding wallet can claim. Connect it to claim.</p>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function LookUp({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const valid = /^0x[0-9a-fA-F]{40}$/.test(value.trim());
  return (
    <section className="card lookup" aria-labelledby="lookup-h">
      <h2 id="lookup-h" className="card__title">Look up any holder</h2>
      <p className="muted">See a wallet&rsquo;s Chogs, escrow and marks, read-only.</p>
      <form className="lookup__form" action="/me">
        <label className="sr-only" htmlFor="lookup">Wallet address</label>
        <input id="lookup" name="address" className="field mono" placeholder="0x…" value={value} onChange={(e) => onChange(e.target.value)} />
        <button className="btn btn--secondary" disabled={!valid}>Look up</button>
      </form>
    </section>
  );
}
