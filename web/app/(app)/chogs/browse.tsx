"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChogArt } from "@/components/chog-art";
import { StatusPill } from "@/components/status-pill";
import { DEFAULT_PRICE, SUPPLY } from "@/lib/config";
import { mon, price, thousands } from "@/lib/format";
import { useChogIndex, useNow, useStatuses } from "@/lib/hooks";
import type { Status } from "@/lib/dybbo";

type StatusFilter = "all" | "open" | "possessed" | "closed";
const PAGE = 60;
const TRAIT_FILTERS = ["Tier", "Background", "Head", "Eyes"] as const;

function stateOf(s: Status | undefined, now: number): Exclude<StatusFilter, "all"> | null {
  if (!s) return null;
  if (s.closed) return "closed";
  if (s.leased && s.until > now) return "possessed";
  return "open";
}

export function Browse() {
  const index = useChogIndex();
  const statuses = useStatuses();
  const now = useNow(1000);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [traits, setTraits] = useState<Record<string, string>>({});
  const [priceF, setPriceF] = useState<"any" | "default" | "custom">("any");
  const [sort, setSort] = useState<"number" | "price" | "escrow">("number");
  const [find, setFind] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [sheet, setSheet] = useState(false);

  // Counts and filters follow the half-minute, not every tick of the clock.
  const tick = Math.floor(now / 30);
  const byId = useMemo(() => new Map((statuses.data ?? []).map((s) => [s.id, s])), [statuses.data]);

  const counts = useMemo(() => {
    const c = { open: 0, possessed: 0, closed: 0 };
    for (const s of statuses.data ?? []) {
      const k = stateOf(s, now);
      if (k) c[k]++;
    }
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statuses.data, tick]);

  const list = useMemo(() => {
    const rows = index.data?.rows ?? [];
    const q = find.replace(/[^0-9]/g, "");
    let out = rows.filter((r) => {
      if (q && !String(r.n).startsWith(q) && String(r.id) !== q) return false;
      for (const [k, v] of Object.entries(traits)) if (v && r.t[k] !== v) return false;
      const s = byId.get(r.id);
      if (status !== "all" && stateOf(s, now) !== status) return false;
      if (priceF === "default" && s && s.price !== DEFAULT_PRICE) return false;
      if (priceF === "custom" && (!s || s.price === DEFAULT_PRICE)) return false;
      return true;
    });
    if (q) out = out.sort((a, b) => (String(a.n) === q ? -1 : String(b.n) === q ? 1 : a.n - b.n));
    if (sort === "price") out = [...out].sort((a, b) => Number((byId.get(a.id)?.price ?? 0n) - (byId.get(b.id)?.price ?? 0n)));
    if (sort === "escrow") out = [...out].sort((a, b) => Number((byId.get(b.id)?.escrow ?? 0n) - (byId.get(a.id)?.escrow ?? 0n)));
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index.data, byId, status, traits, priceF, sort, find, tick]);

  const filtered = status !== "all" || priceF !== "any" || find !== "" || Object.values(traits).some(Boolean);
  const clear = () => {
    setStatus("all");
    setTraits({});
    setPriceF("any");
    setFind("");
    setShown(PAGE);
  };
  const statusesReady = !!statuses.data;

  const filters = (
    <>
      <div className="segmented" role="group" aria-label="Status">
        {(["all", "open", "possessed", "closed"] as const).map((k) => (
          <button key={k} aria-pressed={status === k} onClick={() => (setStatus(k), setShown(PAGE))}>
            {k === "all" ? "All" : k[0].toUpperCase() + k.slice(1)}
          </button>
        ))}
      </div>
      {TRAIT_FILTERS.map((k) => (
        <label key={k} className="filter">
          <span className="sr-only">{k}</span>
          <select className="select" value={traits[k] ?? ""} onChange={(e) => (setTraits({ ...traits, [k]: e.target.value }), setShown(PAGE))}>
            <option value="">{k}</option>
            {(index.data?.traits[k] ?? []).map(([v, c]) => (
              <option key={v} value={v}>
                {v} ({c})
              </option>
            ))}
          </select>
        </label>
      ))}
    </>
  );

  const order = (
    <>
      <label className="filter">
        <span className="sr-only">Price</span>
        <select className="select" value={priceF} onChange={(e) => setPriceF(e.target.value as typeof priceF)}>
          <option value="any">Price: any</option>
          <option value="default">Default 0.01 MON</option>
          <option value="custom">Set by the holder</option>
        </select>
      </label>
      <label className="filter">
        <span className="sr-only">Sort</span>
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
          <option value="number">Sort: token</option>
          <option value="price">Sort: price</option>
          <option value="escrow">Sort: escrow</option>
        </select>
      </label>
    </>
  );

  return (
    <>
      <div className="title-row">
        <div>
          <h1>Chogs</h1>
          <p className="sub num">
            {thousands(SUPPLY)} Chog Genesis
            {statusesReady ? (
              <>
                {" "}· {thousands(counts.open)} open at {price(DEFAULT_PRICE)} MON a minute · {thousands(counts.possessed)} possessed · {thousands(counts.closed)} closed
              </>
            ) : statuses.error ? (
              " · live status unavailable"
            ) : (
              " · reading status from Monad…"
            )}
          </p>
        </div>
        <div className="title-row__actions">
          <a className="btn btn--primary" href="/api/random-open?go=1&minutes=5">Possess a random Chog</a>
        </div>
      </div>

      <div className="toolbar">
        <label className="find">
          <span className="sr-only">Find a Chog by number</span>
          <span aria-hidden="true" className="find__hash">#</span>
          <input
            className="field num"
            inputMode="numeric"
            placeholder="Find by number"
            value={find}
            onChange={(e) => (setFind(e.target.value), setShown(PAGE))}
          />
        </label>
        <div className="toolbar__filters">{filters}</div>
        <button className="btn btn--secondary toolbar__sheet" aria-expanded={sheet} onClick={() => setSheet(!sheet)}>
          Filters{filtered ? " · on" : ""}
        </button>
      </div>
      {sheet && <div className="filter-sheet">{filters}{order}</div>}

      {statuses.error && (
        <p className="empty browse__error">
          Couldn&rsquo;t reach Monad RPC, so statuses are missing. Art and traits are from the snapshot.{" "}
          <button className="btn btn--text" onClick={() => statuses.refetch()}>Retry</button>
        </p>
      )}

      <div className="count">
        <span className="num">
          {index.isLoading ? "Loading the collection…" : list.length === 0 ? "No Chog matches" : `Showing 1–${Math.min(shown, list.length)} of ${thousands(list.length)}`}
        </span>
        {filtered && <button className="btn btn--text" onClick={clear}>Clear filters</button>}
        <div className="count__order">{order}</div>
      </div>

      {index.data && list.length === 0 ? (
        <div className="empty">
          No Chog matches these filters. <button className="btn btn--text" onClick={clear}>Clear filters</button>
        </div>
      ) : (
        <ul className="cgrid">
          {(index.data ? list.slice(0, shown) : Array.from({ length: 12 }, (_, i) => ({ id: i + 1, n: 0, t: {} }))).map((r) => {
            const s = byId.get(r.id);
            return (
              <li key={r.id}>
                <Link href={`/chog/${r.id}`} className="ctile">
                  <div className="ctile__art">
                    {r.n ? <ChogArt id={r.id} name={`CHOG #${r.n}`} w={384} sizes="(max-width: 700px) 45vw, 180px" /> : null}
                  </div>
                  <div className="ctile__top">
                    <span className="ctile__name num">{r.n ? `#${r.n}` : <span className="skel">#0000</span>}</span>
                    <StatusPill s={statusesReady ? s : undefined} now={now} />
                  </div>
                  <dl className="ctile__facts">
                    <div><dt className="sr-only">Price</dt><dd className="num">{s ? price(s.price) : price(DEFAULT_PRICE)} <span className="muted">MON/min</span></dd></div>
                    <div><dt className="sr-only">Escrow</dt><dd className="num">{s && s.escrow > 0n ? <>{mon(s.escrow)} <span className="muted">in escrow</span></> : <span className="muted">—</span>}</dd></div>
                  </dl>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {list.length > shown && (
        <div className="more">
          <button className="btn btn--secondary btn--lg" onClick={() => setShown(shown + PAGE)}>
            Load {Math.min(PAGE, list.length - shown)} more
          </button>
        </div>
      )}
    </>
  );
}
