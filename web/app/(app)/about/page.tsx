import type { Metadata } from "next";
import Link from "next/link";
import { DEFAULT_PRICE, HAUNT_COOLDOWN, MARKS_PER_TOKEN, MAX_MINUTES, MAX_PRICE, MIN_MINUTES, MIN_PRICE } from "@/lib/config";
import { price } from "@/lib/format";
import "./about.css";

export const metadata: Metadata = { title: "About" };

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Fees and escrow",
    body: (
      <>
        <p>
          A lease costs the Chog&rsquo;s price per minute times the minutes, {MIN_MINUTES} to {MAX_MINUTES}. The default price is {price(DEFAULT_PRICE)} MON a minute. The whole fee goes into
          that Chog&rsquo;s escrow. Dybbo takes nothing.
        </p>
        <p>Whoever holds the Chog when they press Claim takes the escrow. If a Chog is sold with fees unclaimed, the buyer can claim them.</p>
      </>
    ),
  },
  { title: "No refunds", body: <p>Leases last {MAX_MINUTES} minutes at most and the terms are shown before you pay, so nothing is refunded when a lease ends or the Chog is sold mid-lease.</p> },
  {
    title: "Prices reset on sale",
    body: <p>A holder&rsquo;s price and opt-out belong to that holder. When the Chog changes hands, the buyer starts on the defaults until they set their own, from {price(MIN_PRICE)} to {price(MAX_PRICE)} MON a minute.</p>,
  },
  {
    title: "Closed by default",
    body: (
      <p>
        Chogs held by contracts, such as vaults, marketplaces and Safes, start closed. Otherwise someone could borrow one for a single transaction and drain its escrow. Smart-account
        wallets using EIP-7702 delegation are still one person&rsquo;s wallet, so they start open like any other. A contract holder can open its
        Chogs under Edit terms.
      </p>
    ),
  },
  {
    title: "Marks",
    body: (
      <p>
        A possessor, or a holder acting with their own Chog, can leave Boo, Slime or Hex on any open Chog: one every {HAUNT_COOLDOWN} seconds, one per target per day. A Chog shows its{" "}
        {MARKS_PER_TOKEN} most recent marks for 24 hours. Marks are Dybbo data shown beside the art. They are never part of the NFT, and its image and metadata never change.
      </p>
    ),
  },
  {
    title: "What Dybbo never does",
    body: (
      <ul className="nevers">
        <li>Hold, receive or move a Chog.</li>
        <li>Ask for an NFT approval. Any approval prompt on a page that looks like Dybbo is a scam.</li>
        <li>Pause, upgrade or sweep. The contract has no admin.</li>
        <li>Edit Chog art. It is shown as-is, with permission.</li>
      </ul>
    ),
  },
  {
    title: "Who made this",
    body: <p>Dybbo is an unofficial community project built by one builder for Chogathon 2026. It is not made by the Chog team. Chog art © ChogLabs, shown with permission.</p>,
  },
  {
    title: "The name",
    body: (
      <p>
        From dybbuk, a wandering spirit in Jewish folklore that takes over a living body for a while and leaves when it is driven out. Here, you enter a Chog you don&rsquo;t own, act
        through it, and leave when the lease ends or the Chog is sold.
      </p>
    ),
  },
];

export default function AboutPage() {
  return (
    <>
      <div className="title-row">
        <div>
          <h1>About Dybbo</h1>
          <p className="sub">The rules, in plain words.</p>
        </div>
        <div className="title-row__actions">
          <Link className="btn btn--secondary" href="/chogs">Browse the Chogs</Link>
        </div>
      </div>
      <div className="about">
        {SECTIONS.map((s) => (
          <section key={s.title} className="card about__card">
            <h2 className="card__title">{s.title}</h2>
            <div className="about__body">{s.body}</div>
          </section>
        ))}
      </div>
    </>
  );
}
