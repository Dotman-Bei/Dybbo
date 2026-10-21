import type { Metadata } from "next";
import Link from "next/link";
import { CHOG_ADDRESS, DEFAULT_PRICE, DYBBO_ADDRESS, REPO_URL, VIDEO_URL, explorerAddress } from "@/lib/config";
import { price } from "@/lib/format";
import { SuggestedChog } from "./suggested";
import "./judges.css";

export const metadata: Metadata = { title: "Judge guide" };

const STEPS: [string, string, string][] = [
  ["Get a little MON on Monad mainnet", "Chain ID 143. 0.05 MON covers every test below.", "Your wallet shows Monad and a MON balance."],
  ["Possess the suggested Chog for 1 minute", "Open its page, keep the minutes at 1, press Possess.", `A fee of ${price(DEFAULT_PRICE)} MON plus gas, then the timer starts.`],
  ["Haunt any open Chog once", "In the session, keep the random target, pick Boo, Slime or Hex, press Haunt.", "The mark shows on the target's page, signed “by #…, possessed”."],
  ["Press Try to take it", "In the same session, on the right.", "The transfer reverts, and both approval reads say false or zero."],
  ["Wait for the timer, then Try one more haunt", "The button appears when the lease ends.", "Reverted: LeaseExpired."],
  ["Run the three checks on The claim", "Use the Chog you possessed, then open the contract on MonadScan.", "Three passes, and no admin functions in the source."],
];

const PROVES: [string, string][] = [
  ["The transfer reverts", "A possessor can never move, approve or list the Chog."],
  ["LeaseExpired", "Control ends in the block the lease expires."],
  ["OwnerChanged", "Control ends in the block the Chog changes hands."],
  ["NotOwner on claim", "The fee belongs to whoever holds the Chog, never to the possessor."],
];

export default function JudgesPage() {
  return (
    <>
      <div className="title-row">
        <div>
          <h1>Judge guide</h1>
          <p className="sub">No Chog needed. A Monad wallet with 0.05 MON covers every test, in under five minutes.</p>
        </div>
        <div className="title-row__actions">
          <SuggestedChog />
        </div>
      </div>

      <div className="split judges">
        <section className="card steps-card" aria-labelledby="steps-h">
          <div className="card__head">
            <h2 id="steps-h">Steps</h2>
            <span className="card__meta">About five minutes</span>
          </div>
          <ol className="steps">
            {STEPS.map(([what, how, expect]) => (
              <li key={what} className="step">
                <h3 className="step__what">{what}</h3>
                <p className="step__how">{how}</p>
                <p className="step__expect"><span className="label">Expect</span> {expect}</p>
              </li>
            ))}
          </ol>
          <div className="steps__go">
            <span className="muted">Finished? Run the three checks on any Chog you possessed.</span>
            <Link className="btn btn--secondary" href="/proof">Open The claim</Link>
          </div>
        </section>

        <div className="stack">
          <section className="card" aria-labelledby="cost-h">
            <div className="card__head">
              <h2 id="cost-h">What it costs</h2>
            </div>
            <dl className="well">
              <div className="kv"><dt>Fee per minute</dt><dd className="num">{price(DEFAULT_PRICE)} MON</dd></div>
              <div className="kv"><dt>Fee for the 1-minute test</dt><dd className="num">{price(DEFAULT_PRICE)} MON</dd></div>
              <div className="kv"><dt>Gas per action</dt><dd className="muted">shown before you sign</dd></div>
              <div className="kv"><dt>Goes to</dt><dd>The Chog&rsquo;s holder</dd></div>
            </dl>
          </section>

          <section className="card" aria-labelledby="proves-h">
            <div className="card__head">
              <h2 id="proves-h">What each revert proves</h2>
            </div>
            <ul className="rows">
              {PROVES.map(([r, line]) => (
                <li className="row proves" key={r}>
                  <span className="pill pill--neg">{r}</span>
                  <span className="row__main">{line}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card" aria-labelledby="links-h">
            <div className="card__head">
              <h2 id="links-h">Links</h2>
            </div>
            <ul className="rows">
              <li className="row">
                <span className="row__main">Demo video</span>
                {VIDEO_URL ? <a className="link" href={VIDEO_URL}>Watch, 3 min</a> : <span className="muted">Added at submission</span>}
              </li>
              <li className="row"><span className="row__main">Source and tests</span><a className="link" href={REPO_URL}>GitHub</a></li>
              <li className="row">
                <span className="row__main">Dybbo on MonadScan</span>
                {DYBBO_ADDRESS ? <a className="link" href={explorerAddress(DYBBO_ADDRESS)}>Contract</a> : <span className="muted">After deployment</span>}
              </li>
              <li className="row"><span className="row__main">Chog Genesis on MonadScan</span><a className="link" href={explorerAddress(CHOG_ADDRESS)}>Contract</a></li>
              <li className="row"><span className="row__main">The claim, checked live</span><Link className="link" href="/proof">The claim</Link></li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
