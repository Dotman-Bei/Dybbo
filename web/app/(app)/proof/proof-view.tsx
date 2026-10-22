"use client";

import { useState } from "react";
import type { Address } from "viem";
import { useNames } from "@/components/haunt-panel";
import { approvals, ownerOf, simulateTake } from "@/lib/chain";
import { CHOG_ADDRESS, DYBBO_ADDRESS, PREVIEW, REPO_URL, SOURCE_URL, VERIFIED, explorerCode, explorerRead } from "@/lib/config";
import { dybbo, type DybboErrorName } from "@/lib/dybbo";
import { shortAddr } from "@/lib/format";
import { useActor } from "@/lib/hooks";

const ZERO = "0x0000000000000000000000000000000000000000" as Address;
const STRANGER = "0x000000000000000000000000000000000000dEaD" as Address;
const lc = (a?: string | null) => (a ?? "").toLowerCase();

type Check = { expected: string; got: string | null; pass: boolean | null; note?: string };

// Each test and the file it lives in, under contracts/test/.
const TESTS = [
  ["test_NoCallPathToApproveOrTransfer", "Proof.t.sol", "The contract's bytecode holds no approve or transfer selector, only ownerOf"],
  ["test_PossessorTransferFromReverts", "Proof.t.sol", "A possessor's transferFrom on Chog Genesis reverts"],
  ["test_NoApprovalAfterAnyFlow", "Proof.t.sol", "isApprovedForAll(holder, Dybbo) stays false after every flow"],
  ["test_HauntAtUntilRevertsLeaseExpired", "Haunt.t.sol", "A haunt in the second the lease ends reverts with LeaseExpired"],
  ["test_SaleMidLeaseRevertsOwnerChanged", "Haunt.t.sol", "After a transfer mid-lease, the next haunt reverts with OwnerChanged"],
  ["test_ClaimByNonOwnerReverts", "Claim.t.sol", "Neither the possessor nor a stranger can claim the escrow"],
  ["test_EscrowFollowsTokenAfterSale", "Claim.t.sol", "Unclaimed escrow goes to the buyer"],
  ["test_ContractHolderClosedByDefault", "Lease.t.sol", "A Chog held by a contract starts closed and opens after setTerms"],
  ["test_ForkAgainstMainnetChog", "Fork.t.sol", "The whole story against the real Chog Genesis on a Monad fork"],
] as const;
const HAS_REPO = /github\.com\/[^/]+\/[^/]+/.test(REPO_URL);
const testUrl = (file: string) => `${REPO_URL.replace(/\/$/, "")}/blob/main/contracts/test/${file}`;

export function ProofView() {
  const names = useNames();
  const { actor } = useActor();
  const [num, setNum] = useState("1462");
  const [id, setId] = useState<number | null>(null);
  const [holder, setHolder] = useState<Address | null>(null);
  const [reads, setReads] = useState<{ approvedForAll: boolean; approved: Address } | null>(null);
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [busy, setBusy] = useState(false);
  const operator = (DYBBO_ADDRESS || ZERO) as Address;

  async function run(e?: React.FormEvent) {
    e?.preventDefault();
    const tid = names.idOf(Number(num.replace(/\D/g, "")));
    if (!tid) return;
    setBusy(true);
    setId(tid);
    setChecks(null);
    try {
      const h = await ownerOf(tid);
      setHolder(h);
      setReads(await approvals(h, operator, tid));
      const from = actor && lc(actor) !== lc(h) ? actor : STRANGER;

      const take = await simulateTake(from, h, tid);
      const c1: Check = { expected: "Reverts", got: take.reverted ? `Reverted: ${take.reason}` : "Did not revert", pass: take.reverted };

      let c2: Check;
      const lease = await dybbo.leaseOf(tid);
      if (lease && !lease.active) {
        try {
          await dybbo.haunt(lease.possessor, tid, tid === 1 ? 2 : 1, 0, true);
          c2 = { expected: "Reverted: LeaseExpired", got: "Did not revert", pass: false };
        } catch (err) {
          const name = (err as { errorName?: DybboErrorName }).errorName ?? "Error";
          c2 = { expected: "Reverted: LeaseExpired", got: `Reverted: ${name}`, pass: name === "LeaseExpired" || name === "OwnerChanged" };
        }
      } else {
        c2 = {
          expected: "Reverted: LeaseExpired",
          got: null,
          pass: null,
          note: lease?.active ? `#${names.n(tid)} is possessed right now. Run this again after its lease ends.` : `#${names.n(tid)} has no ended lease yet. Pick a Chog that has been possessed.`,
        };
      }

      let c3: Check;
      try {
        await dybbo.claim(from, [tid], true);
        c3 = { expected: "Reverted: NotOwner", got: "Did not revert", pass: false };
      } catch (err) {
        const name = (err as { errorName?: DybboErrorName }).errorName ?? "Error";
        c3 = { expected: "Reverted: NotOwner", got: `Reverted: ${name}`, pass: name === "NotOwner" };
      }
      setChecks([c1, c2, c3]);
    } finally {
      setBusy(false);
    }
  }

  const rows = [
    ["Move it as a possessor", "transferFrom(holder, you, id) on Chog Genesis"],
    ["Haunt after the lease", "haunt(id, target, mark) from the last possessor"],
    ["Claim as a non-holder", "claim(id) from a wallet that doesn't hold it"],
  ];

  return (
    <>
      <div className="title-row">
        <div>
          <h1>The claim</h1>
          <p className="sub">Check it yourself. Every read and simulation on this page runs against Monad, not against our server.</p>
        </div>
      </div>

      <p className="claim">
        A possessor can never move, approve or list the Chog they control, and their control ends in the block the lease expires or the Chog changes hands.
      </p>

      <div className="split proof">
        <div className="stack">
          <section className="card" aria-labelledby="checks-h">
            <div className="card__head">
              <h2 id="checks-h">The three checks</h2>
              <span className="card__meta">Simulated, so they cost nothing</span>
            </div>
            <form className="proof__pick" onSubmit={run}>
              <label htmlFor="proof-num" className="label">Chog number</label>
              <div className="proof__pickrow">
                <input id="proof-num" className="field num" inputMode="numeric" value={num} onChange={(e) => setNum(e.target.value)} />
                <button className="btn btn--primary" disabled={busy || !names.ready}>{busy ? "Running…" : "Run the three checks"}</button>
              </div>
            </form>
            <ol className="checks">
              {rows.map(([title, call], i) => {
                const c = checks?.[i];
                return (
                  <li key={title} className="check">
                    <div className="check__head">
                      <h3 className="check__title">{title}</h3>
                      {c ? (
                        c.pass === null ? <span className="pill pill--closed">Not yet</span> : c.pass ? <span className="pill pill--pos">Pass</span> : <span className="pill pill--neg">Fail</span>
                      ) : (
                        <span className="pill pill--closed">{busy ? "Running" : "Not run"}</span>
                      )}
                    </div>
                    <p className="row__sub mono">{call}</p>
                    <dl className="check__grid">
                      <div><dt className="label">Expected</dt><dd>{i === 0 ? "Reverts" : i === 1 ? "Reverted: LeaseExpired" : "Reverted: NotOwner"}</dd></div>
                      <div><dt className="label">Got</dt><dd>{c?.got ?? (c?.note ? <span className="muted">{c.note}</span> : <span className="muted">—</span>)}</dd></div>
                    </dl>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="card" aria-labelledby="tests-h">
            <div className="card__head">
              <h2 id="tests-h">Tests that prove it</h2>
              <span className="card__meta">51 unit tests, 3 fork tests</span>
            </div>
            <ul className="rows">
              {TESTS.map(([name, file, what]) => (
                <li className="row" key={name}>
                  <div className="row__main">
                    <div className="mono test__name">{name}</div>
                    <div className="row__sub">{what}</div>
                  </div>
                  {HAS_REPO ? (
                    <a className="link row__end mono test__file" href={testUrl(file)}>{file}</a>
                  ) : (
                    <span className="row__end mono test__file muted">{file}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="stack">
          <section className="card" aria-labelledby="contract-h">
            <div className="card__head">
              <h2 id="contract-h">The contract</h2>
              {PREVIEW ? <span className="pill pill--closed">Not deployed yet</span> : <span className="pill pill--pos">{VERIFIED ? "Verified" : "Deployed"}</span>}
            </div>
            <dl className="well">
              <div className="kv"><dt>Dybbo</dt><dd className="mono">{DYBBO_ADDRESS ? shortAddr(DYBBO_ADDRESS) : "—"}</dd></div>
              <div className="kv"><dt>Chog Genesis</dt><dd className="mono">{shortAddr(CHOG_ADDRESS)}</dd></div>
              <div className="kv"><dt>Admin</dt><dd>None</dd></div>
              <div className="kv"><dt>Pause</dt><dd>None</dd></div>
              <div className="kv"><dt>Upgrade</dt><dd>None</dd></div>
              <div className="kv"><dt>Protocol fee</dt><dd className="num">0%</dd></div>
            </dl>
            <p className="proof__links">
              {DYBBO_ADDRESS ? (
                <>
                  <a className="link" href={VERIFIED && SOURCE_URL ? SOURCE_URL : explorerCode(DYBBO_ADDRESS)}>{VERIFIED ? "Verified source" : "Code on MonadScan"}</a>
                  <a className="link" href={explorerRead(DYBBO_ADDRESS)}>Read contract</a>
                </>
              ) : (
                <span className="muted">Links to the verified source appear here once it is deployed.</span>
              )}
            </p>
          </section>

          <section className="card" aria-labelledby="calls-h">
            <div className="card__head">
              <h2 id="calls-h">Every call to Chog Genesis</h2>
            </div>
            <ul className="rows">
              <li className="row"><span className="mono">ownerOf(tokenId)</span><span className="row__end muted">read</span></li>
              <li className="row"><span className="mono">owner.code.length</span><span className="row__end muted">read</span></li>
            </ul>
            <p className="body16 proof__none">Nothing else. No approve, no transfer.</p>
          </section>

          <section className="card" aria-labelledby="appr-h">
            <div className="card__head">
              <h2 id="appr-h">Approvals</h2>
              <span className="card__meta">{id ? `#${names.n(id)}` : "Run the checks to read"}</span>
            </div>
            <dl className="well">
              <div className="kv"><dt>Holder</dt><dd className="mono">{holder ? shortAddr(holder) : "—"}</dd></div>
              <div className="kv"><dt>isApprovedForAll(holder, Dybbo)</dt><dd>{reads ? String(reads.approvedForAll) : "—"}</dd></div>
              <div className="kv"><dt>getApproved(id)</dt><dd className="mono">{reads ? shortAddr(reads.approved) : "—"}</dd></div>
            </dl>
            <p className="row__sub">
              {PREVIEW && "Until Dybbo is deployed, the operator read is against the zero address. "}
              <a className="link" href={explorerRead(CHOG_ADDRESS)}>Read Chog Genesis on MonadScan</a>
            </p>
          </section>

          <p className="notice">
            Dybbo never asks for an approval. If a page that looks like Dybbo asks you to approve anything, it is not Dybbo.
          </p>
        </div>
      </div>
    </>
  );
}
