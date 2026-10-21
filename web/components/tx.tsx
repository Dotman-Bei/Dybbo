"use client";
// Every write: check first (simulate, decoded error shown before the wallet opens),
// then sign, then pending until the receipt confirms (F-WL-04, F-WL-05).

import { useState } from "react";
import { DybboError, ERROR_TEXT, type DybboErrorName, type TxResult } from "@/lib/dybbo";
import { explorerTx } from "@/lib/config";

export type TxState =
  | { step: "idle" }
  | { step: "checking" }
  | { step: "signing" }
  | { step: "pending" }
  | { step: "done"; result: TxResult }
  | { step: "error"; name: DybboErrorName | null; message: string };

export function useTx() {
  const [state, setState] = useState<TxState>({ step: "idle" });
  async function run(check: () => Promise<unknown>, send: () => Promise<TxResult>, onDone?: (r: TxResult) => void) {
    setState({ step: "checking" });
    try {
      await check();
      setState({ step: "signing" });
      const p = send();
      setState({ step: "pending" });
      const result = await p;
      // Confirmed on chain: every Dybbo read is now stale, in preview and live mode alike.
      window.dispatchEvent(new Event("dybbo:change"));
      setState({ step: "done", result });
      onDone?.(result);
      return result;
    } catch (e) {
      if (e instanceof DybboError) setState({ step: "error", name: e.errorName, message: ERROR_TEXT[e.errorName] });
      else setState({ step: "error", name: null, message: (e as Error)?.message?.split("\n")[0] || "Something went wrong" });
      return null;
    }
  }
  const busy = state.step === "checking" || state.step === "signing" || state.step === "pending";
  return { state, run, busy, reset: () => setState({ step: "idle" }) };
}

export function busyLabel(s: TxState, idle: string) {
  if (s.step === "checking") return "Checking…";
  if (s.step === "signing") return "Confirm in wallet…";
  if (s.step === "pending") return "Pending…";
  return idle;
}

export function Revert({ name, message, prefix = "Reverted" }: { name: string | null; message: string; prefix?: string }) {
  return (
    <p className="revert" role="status">
      <span className="pill pill--neg">{name ? `${prefix}: ${name}` : "Failed"}</span>
      <span>{message}</span>
    </p>
  );
}

export function TxNote({ s, done }: { s: TxState; done?: string }) {
  if (s.step === "error") return <Revert name={s.name} message={s.message} />;
  if (s.step === "done")
    return (
      <p className="txnote" role="status">
        <span className="pill pill--pos">Confirmed</span>
        <span>
          {done}{" "}
          {s.result.simulated ? (
            <span className="muted">Simulated in this browser.</span>
          ) : s.result.hash ? (
            <a className="link" href={explorerTx(s.result.hash)}>Block {s.result.block?.toLocaleString("en-US")}</a>
          ) : null}
        </span>
      </p>
    );
  if (s.step === "pending") return <p className="txnote muted" role="status">Sent. Waiting for the block…</p>;
  return null;
}
