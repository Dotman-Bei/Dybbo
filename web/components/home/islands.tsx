"use client";
// Client parts of the home page. Each renders the same content without script (server HTML),
// then fills in live status from Monad and the Dybbo client.

import { useEffect, useState } from "react";
import { ChogArt } from "@/components/chog-art";
import { DEFAULT_PRICE, MAX_MINUTES, MIN_MINUTES } from "@/lib/config";
import { clock, mon, price as fmtPrice } from "@/lib/format";
import { useNow, useStatus, useStatuses } from "@/lib/hooks";
import type { Status } from "@/lib/dybbo";
import { setMinutes, useMinutes } from "./minutes";

export type BoardRow = { id: number; n: number; tier: string; background: string; head: string; eyes: string };

function statusWord(s: Status | undefined, now: number) {
  if (!s) return { word: "Open", tone: "open", line: "open at 0.01 MON a minute" };
  if (s.closed) return { word: "Closed", tone: "closed", line: s.closedReason === "contract" ? "closed: held by a contract" : "closed by its holder" };
  if (s.leased && s.until > now) return { word: "Possessed", tone: "held", line: `possessed for ${clock(s.until - now)} more` };
  return { word: "Open", tone: "open", line: `open at ${fmtPrice(s.price)} MON a minute` };
}

export function HeroStatus({ id, n }: { id: number; n: number }) {
  const { data } = useStatus(id);
  const now = useNow(1000);
  return (
    <figcaption className="hero__caption">
      CHOG #{n} · {statusWord(data, now).line}
    </figcaption>
  );
}

export function Board({ rows, openIndex = 3 }: { rows: BoardRow[]; openIndex?: number }) {
  const [open, setOpen] = useState(rows[openIndex]?.id);
  const { data } = useStatuses();
  const now = useNow(1000);
  const byId = new Map((data ?? []).map((s) => [s.id, s]));
  return (
    <ol className="board" data-ui aria-label="Chogs and their status">
      {rows.map((r) => {
        const s = byId.get(r.id);
        const st = statusWord(s, now);
        const isOpen = r.id === open;
        return (
          <li key={r.id} className={`board__row${isOpen ? " is-open" : ""}`}>
            <button className="board__hit" aria-expanded={isOpen} onClick={() => setOpen(r.id)}>
              <span className="board__name num">CHOG #{r.n}</span>
              <span className="board__fact">{r.tier}</span>
              <span className="board__fact">{r.background}</span>
              <span className="board__fact num">{s ? fmtPrice(s.price) : fmtPrice(DEFAULT_PRICE)} MON/min</span>
              <span className={`board__status tone-${st.tone}`}>{st.word}</span>
            </button>
            {isOpen && (
              <div className="board__detail">
                <ChogArt id={r.id} name={`CHOG #${r.n}`} w={192} className="board__art" />
                <p className="board__lines">
                  {r.tier} · {r.background} background · {r.head} · {r.eyes}
                  <br />
                  {s?.escrow ? `${mon(s.escrow)} MON waiting for its holder` : "Nothing in escrow yet"} · {st.line}
                </p>
                <a className="board__go" href={`/chog/${r.id}`}>
                  Possess #{r.n}
                </a>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function MinutesControl({ id, n }: { id: number; n: number }) {
  const m = useMinutes();
  return (
    <div className="slider" data-ui>
      <label htmlFor="minutes" className="slider__label">
        <span>Minutes on #{n}</span>
        <output htmlFor="minutes" className="num">{m} min</output>
      </label>
      <input
        id="minutes"
        type="range"
        min={MIN_MINUTES}
        max={MAX_MINUTES}
        step={1}
        value={m}
        aria-valuetext={`${m} minutes`}
        onChange={(e) => setMinutes(Number(e.target.value))}
        data-chog={id}
      />
    </div>
  );
}

export function FeeFigure({ id, n }: { id: number; n: number }) {
  const m = useMinutes();
  const { data } = useStatus(id);
  const p = data?.price ?? DEFAULT_PRICE;
  return (
    <>
      <p className="figure num" aria-live="polite">
        {mon(p * BigInt(m))}
        <span className="figure__unit">MON</span>
      </p>
      <p className="figure__working">
        {fmtPrice(p)} MON a minute × {m} {m === 1 ? "minute" : "minutes"}, paid in full into #{n}&rsquo;s escrow. Dybbo keeps nothing.
      </p>
    </>
  );
}

export function CtaBand() {
  const m = useMinutes();
  return (
    <a className="cta" href={`/api/random-open?go=1&minutes=${m}`}>
      <span className="cta__line">
        Start a {m}-minute lease on a random open Chog.
      </span>
      <svg className="cta__arrow" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M12 36 36 12M16 12h20v20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" />
      </svg>
      <h2 className="cta__word">Possess</h2>
    </a>
  );
}

/** Section entrances: once, at 88% of the viewport; content stays visible without script. */
export function RevealObserver() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) return els.forEach((el) => el.classList.add("is-in"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
