"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ChogArt } from "@/components/chog-art";
import { useNames } from "@/components/haunt-panel";
import { LeaseBar } from "@/components/lease-bar";
import { MarkChip } from "@/components/mark-row";
import { WalletButton } from "@/components/shell";
import { dybbo, type Activity } from "@/lib/dybbo";
import { ago, clock, mon, timeOfDay } from "@/lib/format";
import { useActivity, useActor, useNow } from "@/lib/hooks";

const lc = (a?: string | null) => (a ?? "").toLowerCase();
type Possess = Extract<Activity, { kind: "possess" }>;

export function Possessions() {
  const { actor } = useActor();
  const now = useNow(250);
  const names = useNames();
  const activity = useActivity();
  const mine = (activity.data ?? []).filter((a) => lc(a.actor) === lc(actor));
  const leases = mine.filter((a): a is Possess => a.kind === "possess");
  const haunts = mine.filter((a) => a.kind === "haunt");
  const latestPerToken = [...new Map(leases.map((l) => [l.id, l])).values()];
  const live = useQuery({
    queryKey: ["dybbo", "mylive", latestPerToken.map((l) => l.id).join(",")],
    enabled: latestPerToken.length > 0,
    queryFn: async () => Promise.all(latestPerToken.map((l) => dybbo.leaseOf(l.id))),
    refetchInterval: 5_000,
  });
  const running = latestPerToken.filter((l, i) => {
    const lease = live.data?.[i];
    return lease && lease.active && lc(lease.possessor) === lc(actor) && lease.until > now;
  });
  const ended = leases.filter((l) => !running.some((r) => r.id === l.id && r.at === l.at));

  if (!actor) {
    return (
      <div className="title-row">
        <div>
          <h1>My possessions</h1>
          <p className="sub">Connect a wallet to see the Chogs it has possessed.</p>
        </div>
        <div className="title-row__actions"><WalletButton /></div>
      </div>
    );
  }

  return (
    <>
      <div className="title-row">
        <div>
          <h1>My possessions</h1>
          <p className="sub num">
            {activity.isLoading ? "Reading recent activity…" : `${running.length} running · ${ended.length} ended`}
          </p>
        </div>
        <div className="title-row__actions">
          <a className={`btn ${running.length ? "btn--secondary" : "btn--primary"}`} href="/api/random-open?go=1&minutes=5">Possess a random Chog</a>
        </div>
      </div>

      {!activity.isLoading && leases.length === 0 ? (
        <div className="card">
          <p className="body16">You haven&rsquo;t possessed a Chog yet.</p>
          <div className="me__empty-actions">
            <Link className="btn btn--secondary" href="/chogs">Browse the Chogs</Link>
          </div>
        </div>
      ) : (
        <div className="split">
          <div className="stack">
            <section className="card" aria-labelledby="run-h">
              <div className="card__head">
                <h2 id="run-h">Running</h2>
                <span className="card__meta num">{running.length}</span>
              </div>
              {running.length ? (
                <ul className="rows">
                  {running.map((l) => {
                    const lease = live.data?.[latestPerToken.indexOf(l)];
                    return (
                      <li className="row run" key={l.id}>
                        <ChogArt id={l.id} name={`CHOG #${names.n(l.id)}`} w={96} className="t-art" />
                        <div className="row__main">
                          <div className="run__line">
                            <span className="t-name num">#{names.n(l.id)}</span>
                            <span className="figure-md num">{lease ? clock(lease.until - now) : ""}</span>
                          </div>
                          {lease && <LeaseBar start={lease.startedAt || l.at} until={lease.until} now={now} />}
                        </div>
                        <Link className="btn btn--primary" href={`/possess/${l.id}`}>Resume</Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="empty">No lease is running. Ended ones are listed below.</p>
              )}
            </section>

            <section className="card" aria-labelledby="ended-h">
              <div className="card__head">
                <h2 id="ended-h">Ended</h2>
                <span className="card__meta num">{ended.length}</span>
              </div>
              {ended.length ? (
                <ul className="rows">
                  {ended.slice(0, 10).map((l) => (
                    <li className="row" key={`${l.id}-${l.at}`}>
                      <ChogArt id={l.id} name={`CHOG #${names.n(l.id)}`} w={96} className="t-art" />
                      <div className="row__main">
                        <span className="t-name num">#{names.n(l.id)}</span>
                        <span className="row__sub num">
                          {l.minutes} min · {mon(l.fee)} MON · ended {timeOfDay(l.at + l.minutes * 60)}
                        </span>
                      </div>
                      <Link className="btn btn--secondary" href={`/chog/${l.id}`}>Possess again</Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty">Nothing has ended yet.</p>
              )}
            </section>
          </div>

          <section className="card" aria-labelledby="haunts-h">
            <div className="card__head">
              <h2 id="haunts-h">Your recent haunts</h2>
              <span className="card__meta num">{haunts.length}</span>
            </div>
            {haunts.length ? (
              <ul className="rows">
                {haunts.slice(0, 10).map((a) =>
                  a.kind === "haunt" ? (
                    <li className="row" key={`${a.id}-${a.targetId}-${a.at}`}>
                      <MarkChip id={a.markId} />
                      <span className="row__main">
                        #{names.n(a.targetId)} <span className="row__sub">by #{names.n(a.id)}</span>
                      </span>
                      <span className="row__end muted">{ago(a.at, now)}</span>
                    </li>
                  ) : null,
                )}
              </ul>
            ) : (
              <p className="empty">No haunts yet.</p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
