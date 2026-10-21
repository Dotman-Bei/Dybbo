"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Address } from "viem";
import { ChogArt } from "@/components/chog-art";
import { MarkGlyph } from "@/components/marks";
import { StatusPill } from "@/components/status-pill";
import { busyLabel, TxNote, useTx } from "@/components/tx";
import { HAUNT_COOLDOWN, MARKS } from "@/lib/config";
import { dybbo, ERROR_TEXT, type DybboErrorName } from "@/lib/dybbo";
import { useChogIndex, useLastHaunt, useMarks, useNow, useStatus } from "@/lib/hooks";

type Tab = "random" | "number" | "back";

export function useNames() {
  const index = useChogIndex();
  return useMemo(() => {
    const byId = new Map<number, number>();
    const byN = new Map<number, number>();
    for (const r of index.data?.rows ?? []) {
      byId.set(r.id, r.n);
      byN.set(r.n, r.id);
    }
    return { n: (id: number) => byId.get(id) ?? id, idOf: (n: number) => byN.get(n), ready: !!index.data };
  }, [index.data]);
}

export function HauntPanel({
  sourceId,
  actor,
  mode,
  disabledReason,
  initialTarget,
}: {
  sourceId: number;
  actor: Address | null;
  mode: "possessor" | "holder";
  disabledReason?: string | null;
  initialTarget?: number;
}) {
  const names = useNames();
  const now = useNow(250);
  const last = useLastHaunt(sourceId);
  const received = useMarks(sourceId);
  const [tab, setTab] = useState<Tab>(initialTarget ? "back" : "random");
  const [target, setTarget] = useState<number | null>(initialTarget ?? null);
  const [numberInput, setNumberInput] = useState("");
  const [mark, setMark] = useState(0);
  const tx = useTx();
  const targetStatus = useStatus(target ?? 1);

  const pickSeq = useRef(0);
  const [landed, setLanded] = useState<string | null>(null);
  async function pickRandom(exclude: number[] = []) {
    const seq = ++pickSeq.current;
    const res = await fetch(`/api/random-open?exclude=${[sourceId, ...exclude].join(",")}`);
    if (res.ok && seq === pickSeq.current) setTarget((await res.json()).id);
  }
  useEffect(() => {
    const seq = pickSeq;
    if (tab === "random" && target === null) pickRandom();
    return () => {
      seq.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const cooldownLeft = Math.max(0, (last.data ?? 0) + HAUNT_COOLDOWN - now);

  const [checked, setChecked] = useState<{ key: string; r: DybboErrorName | null } | null>(null);
  const checkKey = `${actor}:${target}:${mark}:${tx.state.step}`;
  useEffect(() => {
    let live = true;
    if (!actor || target === null) return;
    dybbo
      .canHaunt(actor, sourceId, target, mark)
      .then((r) => live && setChecked({ key: checkKey, r: r === "Cooldown" ? null : r }))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [actor, sourceId, target, mark, checkKey]);
  const precheck = actor && target !== null && checked?.key === checkKey ? checked.r : null;

  const backSources = [...new Set((received.data ?? []).map((m) => m.sourceId))];
  const tn = target !== null ? names.n(target) : null;
  const blocked = !!disabledReason || !actor || target === null || !!precheck || cooldownLeft > 0;

  function haunt() {
    if (!actor || target === null) return;
    const t = target;
    const m = mark;
    setLanded(null);
    tx.run(
      () => dybbo.haunt(actor, sourceId, t, m, true),
      () => dybbo.haunt(actor, sourceId, t, m),
      () => {
        setLanded(`${MARKS[m].name} landed on #${names.n(t)}.`);
        // The same target can't be marked again today, so line up the next one.
        if (tab === "random") pickRandom([t]);
      },
    );
  }

  return (
    <section className="card haunt" aria-labelledby={`haunt-${sourceId}`}>
      <div className="card__head">
        <h2 id={`haunt-${sourceId}`}>{mode === "holder" ? `Haunt with #${names.n(sourceId)}` : "Haunt"}</h2>
        <span className="card__meta num">
          {mode === "holder" ? "Holder mode, no lease needed" : cooldownLeft > 0 ? `Next haunt in ${Math.ceil(cooldownLeft)} s` : "Ready to haunt"}
        </span>
      </div>

      <div className="segmented haunt__tabs" role="group" aria-label="Choose a target">
        <button aria-pressed={tab === "random"} onClick={() => (setTab("random"), pickRandom())}>Random open Chog</button>
        <button aria-pressed={tab === "number"} onClick={() => setTab("number")}>By number</button>
        <button aria-pressed={tab === "back"} onClick={() => setTab("back")}>Haunted you</button>
      </div>

      {tab === "number" && (
        <form
          className="haunt__find"
          onSubmit={(e) => {
            e.preventDefault();
            const id = names.idOf(Number(numberInput.replace(/\D/g, "")));
            setTarget(id ?? null);
          }}
        >
          <label className="sr-only" htmlFor={`find-${sourceId}`}>Chog number</label>
          <input id={`find-${sourceId}`} className="field num" inputMode="numeric" placeholder="#311" value={numberInput} onChange={(e) => setNumberInput(e.target.value)} />
          <button className="btn btn--secondary">Find</button>
        </form>
      )}
      {tab === "back" && (
        <div className="haunt__back">
          {backSources.length === 0 ? (
            <p className="muted">Nobody has haunted #{names.n(sourceId)} in the last 24 hours.</p>
          ) : (
            backSources.map((sid) => (
              <button key={sid} className="btn btn--secondary" aria-pressed={target === sid} onClick={() => setTarget(sid)}>
                #{names.n(sid)}
              </button>
            ))
          )}
        </div>
      )}

      <div className="haunt__target">
        {target !== null ? (
          <>
            <ChogArt id={target} name={`CHOG #${tn}`} w={96} className="haunt__art" />
            <div className="row__main">
              <div className="haunt__tname num">#{tn}</div>
              <StatusPill s={targetStatus.data} now={now} />
            </div>
            {tab === "random" && (
              <button className="btn btn--text" onClick={() => pickRandom()}>Pick another</button>
            )}
          </>
        ) : (
          <p className="muted">{tab === "number" ? "Type a Chog's number, then Find." : "Choose a target."}</p>
        )}
      </div>

      <div className="haunt__marks" role="radiogroup" aria-label="Mark">
        {MARKS.map((m) => (
          <button key={m.id} role="radio" aria-checked={mark === m.id} className="markpick" onClick={() => setMark(m.id)}>
            <MarkGlyph id={m.id} size={28} />
            <span>{m.name}</span>
          </button>
        ))}
      </div>

      {(disabledReason || precheck) && <p className="haunt__why">{disabledReason ?? ERROR_TEXT[precheck!]}</p>}

      <button className="btn btn--primary btn--lg btn--block" disabled={blocked || tx.busy} onClick={haunt}>
        {busyLabel(tx.state, cooldownLeft > 0 && !disabledReason ? `Wait ${Math.ceil(cooldownLeft)} s` : `Haunt #${tn ?? "…"} with ${MARKS[mark].name}`)}
      </button>
      <TxNote s={tx.state} done={landed ?? undefined} />
    </section>
  );
}
