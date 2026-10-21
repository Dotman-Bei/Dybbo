# Dybbo — Product Requirements Document

| Field | Value |
|---|---|
| Product | Dybbo |
| Name origin | From *dybbuk*, a wandering spirit in Jewish folklore that takes over a living body for a while and leaves when it is driven out. The product does the same: a visitor enters a Chog they do not own, acts through it, and leaves when the lease ends or the Chog is sold. Working title during research: "Possession". Trademark, domain and handle availability: `UNVERIFIED`. |
| Mechanism word | Lease |
| Vocabulary | The product is **Dybbo**; the action stays **possess** / **possessor** / **possessed** in the contract and copy (e.g. "by #1462, possessed"). |
| Event | Chogathon 2026 (the Chogtober 2026 hackathon), https://chogathon.chog.xyz/ |
| Builder | Solo, registered (Phase 0 answer) |
| Submission deadline | **2026-10-23 15:00 UTC (16:00 Africa/Lagos)** |
| Document date | 2026-10-21 |
| Source research | `idea-research/chogathon-2026/` files 00 to 07, `FINAL_IDEA.md`, `evidence/mip8-gas-probe.md` |
| Visual design | Out of scope for this document. All visual and interaction design lives in `frontend.md`. This PRD defines what each page must show and do, not how it looks. |

Status labels used in this document:
- `VERIFIED`: checked live or in source during research, with a link.
- `UNVERIFIED`: could not be confirmed.
- `INFERRED`: reasoned from evidence, not stated anywhere.
- `ASSUMED`: a default chosen because no answer exists yet.
- `DECISION`: a product choice made in this PRD. Section 22 lists every decision that refines `FINAL_IDEA.md`.

---

## 1. Summary

Dybbo lets a Monad user or Chogathon judge who does not own a ~$122 Chog take control of any Chog Genesis NFT for a few paid minutes, with no approval and no custody. The fee is escrowed to that token and can be claimed only by whoever holds the token at claim time. A Monad contract checks `ownerOf` on every action, so control ends in the block the lease expires or the Chog changes hands.

While possessing a Chog, the possessor "haunts" other Chogs by leaving one of three preset marks that show on the target's public card for 24 hours, labelled with the source Chog. Holders can also haunt with their own Chogs, which gives haunted holders a way to strike back and a reason to return.

### The claim

> "With Dybbo, a possessor can never move, approve or list the Chog they control, and their control ends in the block the lease expires or the Chog changes hands."

### Demo moment (under 30 seconds)

- **Before:** lending a Chog today means signing `setApprovalForAll` or handing the Chog to an escrow. On screen: the wallet prompt that gives a contract power over every Chog in the wallet, next to the 2026 sweep where forgotten approvals cost 3,033 wallets 25,994 NFTs (https://bitquery.io/investigations/nft-approval-exploit-two-sweeps).
- **After:** a visitor with no Chog possesses #1462 for 0.05 MON with zero approvals. "Try to take it" reverts. When the timer ends, the next haunt reverts. The possessor's claim reverts while #1462's escrow shows 0.05 MON waiting for its holder.

---

## 2. Event context

### 2.1 Timeline (`VERIFIED`, read from the site's own schedule code at https://chogathon.chog.xyz/)

| Milestone | UTC | Lagos (UTC+1) |
|---|---|---|
| Signup phase reference | 2026-10-06 15:00 | 16:00 |
| Run starts | 2026-10-09 15:00 | 16:00 |
| Registrations closed | 2026-10-11 13:00 | 14:00 |
| **Submissions close** | **2026-10-23 15:00** | **16:00** |
| Judging | 7 days after close | — |

The page prints these dates only after its script runs; a plain fetch shows blanks. At the time of writing (2026-10-21 09:44 UTC) about 53 hours remain.

### 2.2 Rules that bind this product

- **The Chog NFT must be essential.** This is a pass/fail gate judges apply before scoring. The event's own test: take the NFT out, does it still work? (https://chogathon.chog.xyz/#challenge, judges' panel in the same HTML)
- Solo or team; vibecoding allowed; any category.
- One project per team; edits allowed from My Projects until the deadline (dashboard "How it works").
- Pre-existing work must be disclosed. Dybbo has none.
- No tracks and no sponsor bounties. One leaderboard.

### 2.3 Judging (`VERIFIED`, https://chogathon.chog.xyz/#judging)

| Criterion | Weight | What judges ask (paraphrased) | How Dybbo answers it |
|---|---|---|---|
| Novelty | 30% | Is this a new way to use or interact with NFTs? | Possess someone else's Chog by the minute, enforced on chain at every action, with no custody and no approval; the holder is paid without signing up. The only rental-like entry among ~65 public entries is opt-in and server-checked (https://github.com/Ganrak/chog-contracts). Private entries `UNVERIFIED`. |
| Fun | 20% | Is it enjoyable or exciting? | Short possessions during Chogtober; haunting other Chogs with marks that show for 24 hours; holders striking back with their own Chogs. |
| Retention | 20% | Will people come back? | Holders return to claim what their Chog earned and to see who haunted it; possessors return for new sessions; earnings keep accruing to every token. |
| Clarity | 15% | Is it easy to understand and use? | One action (Possess), one timer, three reverts that explain the safety model. |
| Execution | 15% | Does it work, is it well executed? | One small contract on Monad mainnet with verified source; dependencies checked live. |
| $CHOG | Bonus | Optional; meaningful use earns bonus | Optional fee currency, pending the team's answer (section 20). Not claimed as essential. |

Scoring mechanics (judges' panel HTML): each criterion scored 1 to 5, weighted to 100 (30/20/20/15/15). **Tie-breakers: novelty first, then retention.** Judges review the description, demo video and links after submissions close.

Event type: `polish` (85% of weight is experience; judges score from a 3-minute video). Novelty is still the largest single criterion and the first tie-breaker.

### 2.4 Prizes (`VERIFIED`, https://chogathon.chog.xyz/#prizes)

| Place | $15K pool | $10K pool |
|---|---|---|
| 1st | $4,500 | $2,450 |
| 2nd | $2,500 | $1,700 |
| 3rd | $1,500 | $1,000 |
| 4th | $1,250 | $750 |
| 5th | $750 | $600 |
| 6th | $500 | $400 |
| 7th | $400 | $350 |
| 8th | $300 | $300 |
| 9th | $250 | $250 |
| 10th | $200 | $150 |
| 11th–30th | $100 each | $100 each |
| 31st–50th | $50 each | $50 each |

The pool may drop to $10K if submissions miss a quality bar. The rows add to $15,150 and $10,950, not the stated totals; final allocation `UNVERIFIED`. Community "hearts" exist in the public gallery; whether they affect scores is `UNVERIFIED`.

### 2.5 Submission requirements (`VERIFIED`, submission form at https://chogathon.chog.xyz/)

| Item | Requirement | Dybbo deliverable |
|---|---|---|
| Project name | Required | "Dybbo" |
| Banner image | Optional | See `frontend.md` |
| Description | Required, ≤ 8,000 characters: what it does, what is new, why Chog matters | Section 16.1 outline |
| Demo video | **Required, ≤ 3 minutes**, YouTube unlisted or Google Drive (anyone with link, viewer) | Section 16.2 |
| App link | Field present; deliverables ask for a working demo with simple testing instructions | Production URL |
| Tech stack | Field present | Section 12 |
| GitHub repo | Organizers-only field | Public repo |
| Contact email | Required | Builder's email |
| Judge access instructions | Optional, ≤ 8,000 characters, organizers only | Section 16.3 |
| Go-to-market plan | Optional, ≤ 8,000 characters | Section 16.4 |
| Usage and feedback | Asked for under "What's next" | Section 17 metrics |
| Pre-existing work | Must be disclosed | None |

---

## 3. Problem

### 3.1 The people and the moments

**Non-holder (primary user).** A Monad user or a Chogathon judge without a ~$122 Chog (floor per https://opensea.io/collection/chog-genesis) opens a holder-gated Chog game and gets a spectator, guest or "simulated judge" mode instead of the real loop.
- Evidence: https://github.com/JimmyOgb/ChogSignal (a separate "Simulated Judge" column), https://github.com/victorhez/ChogChaosLeague (watching is free, playing needs a Chog), https://github.com/neromtoobad/chogstack (Arcade and Practice modes for non-holders), https://github.com/Mhiah/chogmate (guest with a resident Chog). Pains P-01, P-02.
- Scale: ~982 unique Chog owners (https://opensea.io/collection/chog-genesis) against 4.3M+ Monad wallets (https://monad.xyz/blog/monad-ecosystem-highlights-september-2026).
- Whether judges hold Chogs: `UNVERIFIED`. The builder does not.
- Loss: the real experience.

**Holder (secondary user).** A holder who wants to let someone else play their Chog has only custody or blanket-approval routes, because Chog Genesis has no rental role (`supportsInterface(0xad092b5c)` returned false over https://rpc.monad.xyz on 2026-10-20). Pains P-03, P-26.
- Those routes are how NFTs get lost: reNFT renters could hijack rented tokens during the custody handoff (High, confirmed: https://github.com/code-423n4/2024-01-renft-findings/issues/588, also #587, #160), and a forgotten marketplace approval let one wallet take 25,994 NFTs from 3,033 addresses in one 2026 sweep (median loss 2, worst 1,203; https://bitquery.io/investigations/nft-approval-exploit-two-sweeps). Pains P-04, P-10.
- Loss: either the income from an idle Chog, or the Chog itself.

### 3.2 Why the obvious fix fails

A smart builder's first version is a rental market: list a Chog, a renter pays, and the app grants use by escrowing the Chog, asking for `setApprovalForAll`, wrapping it in an ERC-4907 wrapper (https://eips.ethereum.org/EIPS/eip-4907), or accepting a holder-signed "hire" that its server checks, as https://github.com/Ganrak/chog-contracts does.

1. **Every on-chain route needs custody or a blanket approval.** Without a rental role on the Chog contract, escrow, wrappers and approvals all give a contract power to move the Chog, which is what the reNFT finding and the 2026 approval sweep exploited. Holders will not hand a ~$122 NFT to a hackathon contract (`INFERRED`).
2. **A server-checked hire enforces nothing and starts empty.** The server decides the scope and the end; a Chog sold mid-hire keeps working for the old renter until the server re-checks. Because holders must opt in first, few Chogs are rentable on launch day (`INFERRED`), so a judge without a Chog may still have nothing to play.

---

## 4. Goals and non-goals

### 4.1 Goals

| # | Goal | Measured by |
|---|---|---|
| G1 | Pass the NFT essentiality gate without argument | The product has no meaning with the Chog removed (section 5.2) |
| G2 | A judge without a Chog completes a possession and a haunt | Judge path works with only a Monad wallet and a little MON |
| G3 | The claim is checkable by a judge without trusting the builder | Three reverts and one approval read, all on MonadScan or in-app |
| G4 | Every holder earns from day one without signing up | All 1,969 Chogs held by EOAs are possessable at the default price from the first block |
| G5 | Show the demo moment in under 30 seconds | Video timing |
| G6 | Collect real usage to report under "What's next" | On-chain counters (section 17) |

### 4.2 Non-goals

- Taking custody of any Chog, or requesting any NFT approval.
- Free-text messages, AI personalities, trait-to-stat combat, leaderboards, seasons.
- $CHOG staking, wagers or prize pools.
- An SDK for other Chog apps; delegate.cash vault support; full history indexing; mobile apps; a testnet mirror as the submitted product (testnet is used for development only, section 12.1).
- Any visual design specification (see `frontend.md`).

---

## 5. Why each part is essential

### 5.1 Host primitive: Monad (`VERIFIED`)

Monad's 300 ms blocks, 600 ms full finality and ~$0.0005 transactions let every haunt be its own transaction with `ownerOf` read inside it, so a sale or expiry takes effect on the next block.
- On Ethereum L1, each action waits ~12 s and costs far more.
- On a server, ownership is re-checked on a timer and the server decides what a renter may do.
- Limit, stated openly: a fast L2 could host the same design if Chog lived there. Chog Genesis lives only on Monad.

Sources: https://docs.monad.xyz/introduction/monad-for-developers , https://docs.monad.xyz/developer-essentials/gas-on-monad

### 5.2 "Sponsor" primitive: the Chog Genesis NFT

The Chog NFT is:
- **the body** being possessed,
- **the payee**: escrow keyed by token ID, claimable only by its current `ownerOf`,
- **the off switch**: a lease is void the moment `ownerOf` changes.

Delete test: with no NFT there is no body to possess, no holder to pay and nothing that ends on a sale. **PASS.**

Port test: (a) per-action owner checks at sub-second, sub-cent cost are load-bearing; (b) the loop is Chog's lore made playable: anyone can become the curious, mischievous kid who causes chaos (https://www.chog.xyz). Borderline: a judge could see the rental market as reskinnable to another mascot. **PASS.**

### 5.3 $CHOG (optional, not essential)

$CHOG can be the fee currency if the team prefers it (section 20). MON works the same, so $CHOG is not claimed as essential. Design limit: thin liquidity (~$92K main pool) means fee flows must stay small (K7).

---

## 6. Users

| User | Holds a Chog | What they want | Entry point |
|---|---|---|---|
| Possessor (non-holder) | No | Play with a real Chog for a few minutes | `/`, `/chogs`, `/chog/[id]` |
| Holder | Yes | Earn from an idle Chog without risk; see and answer haunts; opt out or price their Chog | `/me` |
| Haunted holder | Yes | See who marked their Chog and strike back | `/chog/[id]`, `/me` |
| Judge | `UNVERIFIED` (assume no) | Test the product and the claim in minutes | `/judges`, `/proof` |
| Chog team | Yes | See a new NFT meta that sends demand to the collection | `/`, `/proof` |
| Spectator | No wallet | Watch possessions and marks | `/`, `/chog/[id]` |

### 6.1 The builder's relationship to real Chogs

- The builder does **not** hold a Chog and never needs one. Neither the builder nor the Dybbo contract ever holds, receives, moves or gets approval over a real Chog.
- Dybbo only **reads** public Chog data: `ownerOf`, `tokensOfOwner`, `tokenURI`, metadata and images, the same data any explorer or marketplace reads.
- A "possession" is a record inside the Dybbo contract ("this wallet controls #1462 inside Dybbo until 14:05"). The NFT itself never changes.
- Fees go to each Chog's escrow for its current holder. There is no protocol fee, so the builder earns nothing from fees.
- In the demo the builder plays as a possessor, paying fees from their own wallet.
- Holder actions (claim, set terms, holder-mode haunt, sale during a lease) are tested on a local mainnet fork by impersonating real holder addresses (section 12.1). Nothing moves on the real chain and no real holder is affected.
- A real claim or strike-back on camera needs a real holder acting from their own wallet (section 20).

---

## 7. Functional requirements

### 7.1 Lease (possess)

| ID | Requirement |
|---|---|
| F-LS-01 | Anyone can call `possess(tokenId, minutes)` on any Chog Genesis token (IDs 1 to 1,969) that is open and not under an active lease. |
| F-LS-02 | Duration is whole minutes, `MIN_MINUTES = 1` to `MAX_MINUTES = 10` (`DECISION`). |
| F-LS-03 | Payment must equal `pricePerMinute(tokenId) × minutes` exactly, in MON. Any other amount reverts. |
| F-LS-04 | On success the contract records `lease = {possessor, until = block.timestamp + minutes × 60, ownerAtStart = ownerOf(tokenId)}` and credits the full fee to `escrow[tokenId]`. |
| F-LS-05 | Only one active lease per token. A lease is active when `block.timestamp < until` AND `ownerOf(tokenId) == ownerAtStart`. |
| F-LS-06 | A new lease may start when the previous one has expired or is void because the owner changed. |
| F-LS-07 | The current holder cannot possess their own Chog (pointless self-payment); they use holder mode (7.3). |
| F-LS-08 | A possessor may hold active leases on several different Chogs at once. |
| F-LS-09 | No refund on expiry or on a sale mid-lease (`DECISION`; leases are at most 10 minutes and terms are shown before payment). |
| F-LS-10 | Possessing never calls `approve`, `setApprovalForAll`, `transferFrom` or `safeTransferFrom` on Chog Genesis. The contract has no code path to do so. |

### 7.2 Haunt (actions by a possessor)

| ID | Requirement |
|---|---|
| F-HT-01 | `haunt(sourceId, targetId, markId)` by the possessor of `sourceId` requires an active lease (F-LS-05) on `sourceId`, checked in the same call. |
| F-HT-02 | Three preset marks, `markId` 0, 1, 2. Names and art are defined in `frontend.md`; the contract only stores the ID. No free text. |
| F-HT-03 | `sourceId != targetId`. |
| F-HT-04 | The target must be open (not opted out). Closed Chogs can be neither possessed nor haunted (`DECISION`). |
| F-HT-05 | Cooldown: one haunt per acting source token every `HAUNT_COOLDOWN = 15` seconds (`DECISION`; ≈ 20 haunts in a 5-minute lease, matching the research estimate). |
| F-HT-06 | A source token can mark the same target at most once per 24 hours (`DECISION`; limits spam on one victim). |
| F-HT-07 | Each target stores its most recent `MARKS_PER_TOKEN = 8` marks in a ring buffer: `{sourceId, actor, markId, timestamp, byPossessor}`. |
| F-HT-08 | Marks are "live" for 24 hours from `timestamp`; reads filter out older marks. Marks are never shown as part of the NFT itself; the Chog's metadata and image never change. |
| F-HT-09 | A mark made under a lease is labelled "by #<sourceId>, possessed"; a mark made in holder mode is labelled "by #<sourceId>". |
| F-HT-10 | After the lease expires, or once `ownerOf(sourceId)` differs from `ownerAtStart`, `haunt` reverts. |

### 7.3 Holder mode

| ID | Requirement |
|---|---|
| F-HM-01 | The current holder can call `haunt` with their own Chog without a lease (`DECISION`; gives haunted holders a way to strike back). |
| F-HM-02 | Holder-mode haunts follow the same cooldown, once-per-target-per-day rule and target rules as possessor haunts. |
| F-HM-03 | While a Chog is under an active lease, only the possessor can act with it; holder mode is blocked until the lease ends. |

### 7.4 Escrow and claims

| ID | Requirement |
|---|---|
| F-ES-01 | `escrow[tokenId]` accumulates every fee paid for that token. |
| F-ES-02 | `claim(tokenId)` pays the full escrow to `msg.sender` only if `msg.sender == ownerOf(tokenId)`; otherwise it reverts. |
| F-ES-03 | `claimMany(uint256[] tokenIds)` claims several tokens in one call; every token must be owned by the caller or the call reverts. |
| F-ES-04 | Unclaimed escrow follows the token: after a sale, the new holder can claim it. This is shown before purchase on the token's page and stated in the README. |
| F-ES-05 | Pull payments only, with a reentrancy guard. The builder has no function to move escrowed funds. |

### 7.5 Holder terms

| ID | Requirement |
|---|---|
| F-TM-01 | `setTerms(tokenId, pricePerMinute, closed)` callable only by `ownerOf(tokenId)`. |
| F-TM-02 | Price bounds: `MIN_PRICE = 0.001 MON` to `MAX_PRICE = 1 MON` per minute (`DECISION`). |
| F-TM-03 | Terms belong to the holder who set them: terms are stored with `setBy`, and if `setBy != ownerOf(tokenId)` the defaults apply (`DECISION`; a buyer does not inherit the seller's price or opt-out). |
| F-TM-04 | Closing takes effect for new leases and new haunts on that token. An active lease runs out normally (≤ 10 minutes) (`DECISION`). |
| F-TM-05 | Default terms: open, `DEFAULT_PRICE = 0.01 MON per minute` (matches the demo: 0.05 MON for 5 minutes, 0.01 MON for 1 minute). |

### 7.6 Default-open rule

| ID | Requirement |
|---|---|
| F-DO-01 | A Chog whose `ownerOf` is an account without code (EOA) is open by default with no sign-up. |
| F-DO-02 | A Chog whose `ownerOf` has code (vaults, pools, marketplace escrows, Safes) is **closed by default** and can be opened by that holder through `setTerms` (`DECISION`). Reason: a contract that holds Chogs and lends them out could let someone borrow a Chog for one transaction to harvest its escrow, the same pattern used to claim 60,564 APE with five borrowed apes (https://www.theblock.co/post/138410/someone-borrowed-5-bored-apes-to-claim-1-1-million-of-ape-tokens; pain P-12). |
| F-DO-03 | Known side effect: EIP-7702-delegated EOAs have code and fall under F-DO-02. They can open with `setTerms`. Stated in the FAQ. |

### 7.7 Activity and counters

| ID | Requirement |
|---|---|
| F-AC-01 | A global on-chain ring buffer of the last `RECENT = 64` actions (possess, haunt, claim) so the home feed needs no indexer (the public RPC caps `eth_getLogs` at 100 blocks, K4). |
| F-AC-02 | Counters: total possessions, total haunts, total MON paid into escrow, total MON claimed, number of distinct possessors, number of distinct tokens ever possessed. |
| F-AC-03 | Events for every state change (section 8.5) so live clients can subscribe over WebSocket. |

### 7.8 "Try to take it" (the claim, shown in-app)

| ID | Requirement |
|---|---|
| F-TT-01 | During a lease, the possessor can press "Try to take it". The app simulates `transferFrom(ownerOf, possessor, tokenId)` on Chog Genesis from the possessor's address with `eth_call` and shows the revert. |
| F-TT-02 | The app also offers to send the transaction for real, warning that a reverted transaction still pays gas on Monad (gas is charged on the gas limit). |
| F-TT-03 | The app reads and shows `isApprovedForAll(ownerOf, DybboAddress)` = `false` and `getApproved(tokenId)` ≠ Dybbo, with links to MonadScan's Read tab. |
| F-TT-04 | After the lease ends, the session view lets the user attempt one more haunt and shows the revert (`LeaseExpired`). |
| F-TT-05 | On any token page, a non-holder can attempt `claim` (simulated) and see the `NotOwner` revert. |

### 7.9 Wallet and transactions

| ID | Requirement |
|---|---|
| F-WL-01 | Connect any injected or WalletConnect wallet on Monad mainnet (chainId 143). Prompt to add or switch the network if needed. |
| F-WL-02 | Spectators can browse every page without a wallet. |
| F-WL-03 | Every write sets an explicit gas limit (estimate plus a small margin), because Monad charges the full gas limit, not gas used. |
| F-WL-04 | Every write is simulated first; a predicted revert is shown with its decoded custom error before the wallet opens. |
| F-WL-05 | Pending state is shown as soon as the transaction appears in a proposed block, then confirmed on finalization. Monad's `latest` tag is speculative (P-20); UI state that depends on success (timer start, mark shown) is confirmed from the receipt. |
| F-WL-06 | Show the user's MON balance and the total cost (fee plus gas estimate) before every write. |

### 7.10 Metadata and images

| ID | Requirement |
|---|---|
| F-MD-01 | Token metadata comes from `tokenURI(tokenId)`, never from `<tokenId>.json`. Token 1 resolves to `…/1462.json` (K1). |
| F-MD-02 | A build-time snapshot reads `tokenURI` for all 1,969 tokens (batched through Multicall3 at `0xcA11bde05977b3631167028862bE2a173976CA11`) and stores name, image URI and all attributes as static JSON. |
| F-MD-03 | The snapshot is refreshed if `tokenURI` changes (the contract has `setBaseURI`, so metadata can change). |
| F-MD-04 | Images are served through the app's own cache route with gateway fallback. Pinata's gateway worked from a browser; ipfs.io, dweb.link and w3s.link failed (K5). |
| F-MD-05 | Traits shown on token pages: all attributes present in the metadata (13 categories on OpenSea: Accessory, Aura, Background, Base, Body, Eyes, Form, Head, Mouth, Naked, Side, Skin, Tier). |
| F-MD-06 | **Chog art is allowed.** Dybbo shows each Chog's own image (from its metadata) on every page that shows a Chog: browse, token page, session, holder dashboard, feed and marks. Permission confirmed by the builder on 2026-10-21. The image is shown as-is; Dybbo never edits, overlays into, or re-mints the NFT's art. Marks are shown beside the image as Dybbo data, not as part of the NFT. |

---

## 8. Smart contract specification

### 8.1 Deployment

| Item | Value |
|---|---|
| Network | Monad mainnet, chainId 143 (Chog Genesis exists only there) |
| Chog Genesis | `0xc96d31F8626c6D03Fae5dCD3d61e3FB9F4a73763` (immutable constructor argument) |
| Source verification | Required on MonadScan (explorer API: `https://api.etherscan.io/v2/api?chainid=143`, per viem's chain definition) |
| Admin | None. No owner, no pause, no upgrade proxy, no fee sweep (`DECISION`). All constants fixed at deploy. |
| Protocol fee | None. 100% of each fee goes to the token's escrow (`DECISION`). |
| Max contract size | 128 KB on Monad (not a constraint for this contract) |

### 8.2 Constants

| Name | Value | Note |
|---|---|---|
| `MIN_MINUTES` | 1 | |
| `MAX_MINUTES` | 10 | |
| `DEFAULT_PRICE` | 0.01 MON per minute | |
| `MIN_PRICE` / `MAX_PRICE` | 0.001 / 1 MON per minute | |
| `HAUNT_COOLDOWN` | 15 s | Timestamps tick in whole seconds (section 9) |
| `TARGET_REPEAT_WINDOW` | 24 h | Same source → same target |
| `MARK_TTL` | 24 h | |
| `MARKS_PER_TOKEN` | 8 | Ring buffer |
| `RECENT` | 64 | Global ring buffer |
| `MARK_COUNT` | 3 | `markId` ∈ {0, 1, 2} |

### 8.3 Storage (sketch)

```
struct Lease   { address possessor; uint40 until; address ownerAtStart; }
struct Terms   { uint96 pricePerMinute; bool closed; address setBy; bool set; }
struct Mark    { uint16 sourceId; address actor; uint8 markId; uint40 at; bool byPossessor; }

mapping(uint256 => Lease)  lease;           // by tokenId
mapping(uint256 => Terms)  terms;
mapping(uint256 => uint256) escrow;          // wei
mapping(uint256 => uint40) lastHauntAt;      // by source tokenId
mapping(uint256 => mapping(uint256 => uint40)) lastPairAt;  // source => target
mapping(uint256 => Mark[8]) marks; mapping(uint256 => uint8) markHead;
Activity[64] recent; uint8 recentHead;
counters: totalDybbos, totalHaunts, totalPaid, totalClaimed, distinctPossessors, distinctTokens
mapping(address => bool) seenPossessor; mapping(uint256 => bool) seenToken;
```

Packing note: per-token state that is read together should sit in the same struct so it shares a 128-slot storage page (MIP-8, section 9). Not required for correctness.

### 8.4 External functions

| Function | Who | Checks | Effect |
|---|---|---|---|
| `possess(uint256 id, uint8 minutes) payable` | anyone except `ownerOf(id)` | id in range; open (F-DO, F-TM); no active lease; minutes in range; `msg.value == price × minutes` | Writes lease; `escrow[id] += msg.value`; counters; activity; `Possessed` event |
| `haunt(uint256 sourceId, uint256 targetId, uint8 markId)` | active possessor of `sourceId`, or `ownerOf(sourceId)` when no active lease | lease active and `ownerOf(sourceId) == ownerAtStart` (possessor path) or caller is owner and no active lease (holder path); `sourceId != targetId`; target open; cooldown; once per target per 24 h; `markId < 3` | Writes mark to target ring buffer; counters; activity; `Haunted` event |
| `claim(uint256 id)` | `ownerOf(id)` | caller is owner; escrow > 0 | Zero escrow, then send MON; `Claimed` event |
| `claimMany(uint256[] ids)` | owner of every id | same as `claim` for each | Same, batched |
| `setTerms(uint256 id, uint96 pricePerMinute, bool closed)` | `ownerOf(id)` | price in bounds | Writes terms with `setBy = msg.sender`; `TermsSet` event |

### 8.5 Views

| View | Returns |
|---|---|
| `leaseOf(id)` | possessor, until, ownerAtStart, `active` (computed with live `ownerOf`) |
| `termsOf(id)` | effective price, effective `closed`, whether defaults apply, whether the holder is a contract |
| `escrowOf(id)` | wei |
| `marksOf(id)` | live marks (≤ 8, within 24 h) |
| `recentActivity()` | last 64 actions |
| `stats()` | all counters |
| `canHaunt(caller, sourceId, targetId)` | bool plus reason code, for UI pre-checks |
| `statusBatch(uint256 from, uint256 to)` | lease active, effective price, closed, escrow for a range of IDs (for the browse page; the Chog contract has no Enumerable extension) |

### 8.6 Events

`Possessed(id, possessor, ownerAtStart, until, fee)`, `Haunted(sourceId, targetId, actor, markId, byPossessor)`, `Claimed(id, to, amount)`, `TermsSet(id, holder, pricePerMinute, closed)`.

### 8.7 Custom errors (decoded and shown by the UI)

`TokenOutOfRange`, `Closed`, `LeaseActive`, `LeaseExpired`, `OwnerChanged`, `SelfDybbo`, `WrongPayment`, `DurationOutOfRange`, `PriceOutOfRange`, `NotOwner`, `NotController`, `SameToken`, `Cooldown`, `TargetRepeat`, `BadMark`, `NothingToClaim`.

### 8.8 Required tests (Foundry)

Each test maps to a line of the claim or a rule above.

| Test | Proves |
|---|---|
| No call path to approve or transfer | Bytecode/ABI contains no external call to Chog Genesis other than `ownerOf` (and `code.length` read on the owner) |
| Possessor `transferFrom` on Chog Genesis reverts | "never move" |
| `isApprovedForAll(holder, Dybbo) == false` after any flow | "never approve or list" |
| Haunt at `until` reverts with `LeaseExpired` | "ends in the block the lease expires" |
| Transfer the Chog mid-lease, next haunt reverts with `OwnerChanged` | "ends in the block the Chog changes hands" |
| `claim` by non-owner reverts; by owner pays exactly escrow | payee rule |
| Escrow follows token after sale | F-ES-04 |
| Wrong payment, closed token, active lease, self-possession all revert | F-LS rules |
| Terms reset for a buyer | F-TM-03 |
| Contract-held Chog closed by default; opens after `setTerms` | F-DO-02 |
| Cooldown and once-per-target-per-day | F-HT-05, F-HT-06 |
| Reentrancy on `claim` | F-ES-05 |
| Fork test against mainnet Chog Genesis | `ownerOf` integration with the real contract (fork at latest; full nodes do not serve arbitrary historical state) |

---

## 9. Verified chain and collection facts the build depends on

### 9.1 Chog Genesis (`VERIFIED`, live reads on 2026-10-20 over https://rpc.monad.xyz unless noted)

| Fact | Value |
|---|---|
| Name / symbol | "Chog Genesis" / "CHOG" |
| Supply | 1,969 (`totalSupply`), IDs 1 to 1,969 |
| Standards | ERC-721 and ERC-2981 (royalties) supported; **not** Enumerable; **no** ERC-4907 (`0xad092b5c` false); no ERC-5192; no transfer hooks |
| Deployed | ~2026-09-03 (MonadScan showed creation 47 days before 2026-10-20); creator `0x79bbEc62F13BF1756e2F29F465240814EC1876F4`; 3,901 transactions at the time |
| Source | Not shown as verified on MonadScan; ABI listed. Bytecode checked instead. |
| Selectors in bytecode | `ownerOf` `0x6352211e`, `balanceOf` `0x70a08231`, `tokensOfOwner` `0x8462151c`, `tokenURI` `0xc87b56dd`, `totalSupply` `0x18160ddd`, `isApprovedForAll` `0xe985e9c5` |
| Live calls | `ownerOf(1)` → `0x3d38fee3e1a4c43d8fcf715aa6c9ff025074e7e0`; `tokensOfOwner` of that address → `[1]` |
| Other ABI items | staged mint (`STAGE_CHEST`, `STAGE_GTD`, `STAGE_FCFS`, `STAGE_PUBLIC`, `STAGE_TEAM`), `reveal`, `setBaseURI`, `metadataId(uint256)`, `startingIndex`, `provenanceHash`, role-based admin |
| Metadata | `tokenURI(1)` = `ipfs://bafybeid4ybujnscdipkno7ps5utqelp5ry5ryreqhay3zhgk3a6x4jruqu/1462.json`; name "CHOG #1462"; 12 attributes in that file (Background, Base, Skin, Side, Body, Mouth, Eyes, Head, Accessory, Form, Tier, Naked); image `ipfs://bafybeihau2egcccbdxymeckmmbrqytbfor5gkt3en6d5fsbueymdbq7g6e/1462.webp` |
| Trait sample (48 tokens) | Form: Chog 47, Skull 1. Base: Origin 46, Radioactive 1, Skull 1. Tier: Common 30, Uncommon 16, Epic 1, Rare 1. Side: Right 31, Left 17. Full counts `UNVERIFIED`. |
| Market (https://opensea.io/collection/chog-genesis) | ~982 unique owners (49.9%), 269 listed (13.7%), floor ~$122, top offer ~$107, total volume ~$403K, 24h volume ~$583, 5% creator fee, creator ChogLabs |
| Transfer cost seen | ~0.005 to 0.014 MON per approval or transfer transaction on MonadScan |

### 9.2 $CHOG (`VERIFIED`, https://www.chog.xyz and DexScreener API on 2026-10-20)

| Fact | Value |
|---|---|
| Address | `0x350035555E10d9AfAF1566AaebfCeD5BA6C27777` |
| Launched | 2025-11-25 on nad.fun |
| Main pool | CHOG/MON on nad.fun, ~$92K liquidity, ~$15K 24h volume, price ~$0.00145, FDV ~$1.45M (https://dexscreener.com/monad/0x116e7d070f1888b81e1e0324f56d6746b2d7d8f1) |
| All pools | 13 pools, ~$95K total liquidity |

### 9.3 Monad (`VERIFIED`)

| Fact | Value | Source |
|---|---|---|
| Block time | 300 ms (MIP-12, mainnet 2026-07-23) | https://docs.monad.xyz/introduction/monad-for-developers , https://docs.monad.xyz/developer-essentials/changelog/releases |
| Finality | 300 ms speculative, 600 ms full | same |
| Gas limits | block 150M, per transaction 30M | releases (v0.15.0) |
| Fees | charged on **gas limit**; minimum base fee 100 MON-gwei; a 200k-gas swap ≈ 0.02 MON (~$0.0005) | https://docs.monad.xyz/developer-essentials/gas-on-monad |
| `eth_maxPriorityFeePerGas` | hardcoded 2 gwei (temporary) | https://docs.monad.xyz/reference/rpc-differences |
| Block timestamps | whole seconds; ~3 blocks share one value (blocks 115,154,012 to 115,154,020) | live read |
| Cold account access | 10,100 gas (Ethereum 2,600) | https://docs.monad.xyz/developer-essentials/opcode-pricing |
| Storage pages (MIP-8, mainnet 2026-09-02) | 128 slots per page; cold page read 8,100, warm 100; SSTORE = base 100 + page load 8,000 + first page write 2,800 + state growth 17,000 | same; `PageTracker::access_page()` in https://github.com/category-labs/monad/blob/main/category/execution/ethereum/state3/page_tracker.hpp |
| `eth_getLogs` range | 100 blocks on rpc.monad.xyz (QuickNode) and rpc-mainnet.monadinfra.com; 1,000 blocks / 10,000 logs on rpc1.monad.xyz (Alchemy); 1,000 on rpc3 (Ankr). Live probe returned error -32614 above 100. | https://docs.monad.xyz/reference/rpc-differences |
| `eth_call` gas cap | 200M on rpc, rpc1, monadinfra; 1B on Ankr | same |
| Block tags | `latest` = proposed (speculative), `safe` = voted, `finalized` = finalized | same |
| WebSocket | `newHeads` and `logs` fire on proposed blocks; `monadNewHeads` / `monadLogs` add commit-state updates | same |
| Mempool | no global mempool; nonce-gap and insufficient-balance transactions may be accepted | same; https://docs.monad.xyz/developer-essentials/differences |
| History | full nodes do not serve arbitrary historical state | same |
| viem | `monad` chain id 143 exists, but its `blockTime` is still 400 — override to 300 | https://github.com/wevm/viem/blob/main/src/chains/definitions/monad.ts |

### 9.4 Shared contracts on Monad mainnet (`VERIFIED` by `eth_getCode`)

| Contract | Address | Status | Use in Dybbo |
|---|---|---|---|
| Multicall3 | `0xcA11bde05977b3631167028862bE2a173976CA11` | deployed | metadata snapshot, batched reads |
| delegate.cash v1 | `0x00000000000076A84feF008CDAbe6409d2FE638B` | deployed; has `checkDelegateForToken` | out of scope |
| Delegate Registry v2 | `0x00000000000000447e69651d841bD8D104Bed493` | **not deployed** | — |
| ERC-6551 registry / Tokenbound v3 | `0x000000006551c19487814612e58FE06813775758` / `0x41C8f39463A868d3A88af00cd0fe7102F30E44eC` | deployed | not used |
| Seaport 1.5 / 1.6, Permit2 | canonical addresses | deployed | not used |

### 9.5 Gas probe (`VERIFIED`, `evidence/mip8-gas-probe.md`)

Hand-assembled EVM loops run with `eth_call` state overrides at block 115,153,872:

| Program (1,969 iterations) | Gas |
|---|---|
| empty loop | 116,208 |
| read contiguous slots | 458,834 |
| read one slot per page | 16,082,834 |
| read-modify-write contiguous | 702,498 |
| read-modify-write one per page | 21,794,898 |

Relevance to Dybbo: confirms the page-pricing model used for storage layout; not on the critical path. Per-action gas for Dybbo has not been measured yet; measure after the contract compiles and set UI gas limits from those numbers (F-WL-03).

---

## 10. Pages and routes

Visual design for every page: `frontend.md`. Below: purpose, data, actions and states only.

### 10.1 Pages

| Route | Page | Purpose | Data shown | Actions | Wallet |
|---|---|---|---|---|---|
| `/` | Home | Explain Dybbo in one sentence and get a visitor possessing fast | The one-sentence pitch; the claim; "Possess a random open Chog"; live feed from `recentActivity()` plus WebSocket `logs`; stats from `stats()` (possessions, haunts, MON paid to holders) | Possess random; go to browse; go to `/proof`; go to `/judges` | Not needed to view |
| `/chogs` | Browse | Find a Chog to possess or look up | All 1,969 Chogs from the metadata snapshot with live status from `statusBatch` (open, possessed until, closed, price, escrow) | Filter by status, price, traits; search by token ID; open a token | Not needed |
| `/chog/[id]` | Token page | Everything about one Chog | Image and traits; holder address (from `ownerOf`); lease status and countdown; effective price and whether defaults apply; escrow claimable and the note that unclaimed escrow follows the token; live marks received (≤ 8, 24 h) with source and label; marks this Chog gave recently (from activity) | Possess (choose 1–10 minutes, see total cost); if holder: claim, set terms, haunt with it (holder mode); if non-holder: "Try to claim" (simulated revert) | Needed for actions |
| `/possess/[id]` | Session | The active possession console | Countdown to `until`; lease validity (live `ownerOf` vs `ownerAtStart`); cooldown remaining; haunt target picker (random open Chog, search by ID, recent haunters); last result; "Try to take it" panel with `isApprovedForAll` and `getApproved` reads | Haunt; Try to take it (simulate, optionally send); after expiry, "Try one more haunt" (shows `LeaseExpired`); possess again | Required; redirects to `/chog/[id]` if no active lease for the connected wallet |
| `/me` | Holder dashboard | Earnings and control for holders | Chogs held (`tokensOfOwner`); per-token escrow and total; per-token terms; marks received in the last 24 h; whether each Chog is closed by default (contract holder) | Claim all (`claimMany`); set price or close per token; open a token | Required |
| `/me/possessions` | My possessions | A possessor's active and past leases | Active leases with countdowns (from `leaseOf` for tokens seen in this wallet's `Possessed` events or local session state); recent haunts by this wallet | Resume session; possess again | Required |
| `/proof` | The claim | Let anyone check the claim without trusting the builder | The claim sentence; Dybbo address with MonadScan links (verified source, Read tab); live `isApprovedForAll(<chosen holder>, Dybbo)`; the list of external calls the contract makes (only `ownerOf` and owner code check); links to the tests in the repo | Pick any token and run the three revert checks as simulations: transfer by a possessor, haunt after expiry, claim by a non-owner | Optional (simulations work from any address) |
| `/judges` | Judge guide | Step-by-step testing without a Chog | What to do in under 5 minutes; cost (≈ 0.01 MON fee for 1 minute plus gas); how to get MON on Monad; what each revert proves; where the video and repo are | Links into `/chog/[id]` with a suggested open token, `/proof` | Not needed to read |
| `/about` | About and FAQ | Rules and edge cases in plain words | How fees, escrow and claims work; no refunds; terms reset on sale; contract holders closed by default (and EIP-7702 note); marks are not part of the NFT; marks expire after 24 h; unofficial community project, not by the Chog team; Chog art shown with permission and never altered; Dybbo and its builder never hold or move any Chog; contract has no admin | — | Not needed |
| `/404` | Not found | Unknown route or token ID out of 1–1,969 | Message and link to `/chogs` | — | — |
| Error boundary | Error | RPC or gateway failure | What failed (RPC, IPFS) and retry | Retry; switch RPC | — |

### 10.2 API routes (server)

| Route | Purpose |
|---|---|
| `GET /api/chog/[id]` | Metadata from the snapshot (name, traits, image URI); 404 outside 1–1,969 |
| `GET /api/image/[id]` | Cached image proxy with IPFS gateway fallback (Pinata first) |
| `GET /api/status?from=&to=` | Cached `statusBatch` for the browse page (short cache, a few seconds) |
| `GET /api/stats` | Cached `stats()` and `recentActivity()` |
| `GET /api/random-open` | A random token ID that is open and not leased |
| `GET /api/health` | RPC reachability, latest block, snapshot version |

No server route writes to the chain or holds keys. Every write is signed in the user's wallet.

### 10.3 Static assets

- `metadata-snapshot.json`: all 1,969 tokens, built by script (F-MD-02).
- Contract ABI and address per environment.

---

## 11. User flows

### 11.1 Possessor (no Chog)

1. Open `/` → "Possess a random open Chog", or browse `/chogs` and open `/chog/[id]`.
2. Choose minutes (1–10). See fee, gas estimate and MON balance.
3. Connect wallet if needed; switch to Monad.
4. Simulate; sign `possess`. Land on `/possess/[id]` once the receipt confirms.
5. Haunt targets until the timer ends (cooldown 15 s; once per target per day).
6. Optionally "Try to take it" → revert shown, approval reads shown.
7. Timer ends → "Try one more haunt" → `LeaseExpired` shown → offer to possess again.

### 11.2 Holder

1. Open `/me` (or arrive from a link on X).
2. See every Chog held, escrow per token and in total, marks received.
3. Claim all in one transaction.
4. Optionally set a price or close a Chog.
5. Strike back: open a mark's source Chog and haunt it in holder mode from `/chog/[id]`.

### 11.3 Judge

1. Read `/judges` (or the judge instructions in the submission).
2. Possess any open Chog for 1 minute (~0.01 MON plus gas).
3. Haunt once.
4. Press "Try to take it" → revert.
5. Wait for expiry → one more haunt → revert.
6. On `/proof`, run the claim checks and open MonadScan.

### 11.4 Sale during a lease

1. The holder sells #id while a lease is active.
2. The possessor's next haunt reverts with `OwnerChanged`; the session view shows "This Chog changed hands; your lease ended."
3. The buyer sees the unclaimed escrow on `/me` and can claim it; default terms apply to the buyer.

---

## 12. Technical approach

| Layer | Choice | Notes |
|---|---|---|
| Contract | Solidity, Foundry (build, test, fork test, deploy, verify) | Builder is comfortable with Solidity and Foundry (Phase 0) |
| Frontend | TypeScript, Next.js (React) | Builder is comfortable (Phase 0); design in `frontend.md` |
| Chain client | viem / wagmi with the `monad` chain, `blockTime` overridden to 300 | |
| RPC | `https://rpc.monad.xyz` primary; `https://rpc1.monad.xyz` fallback (larger `eth_getLogs` range); WebSocket `wss://rpc.monad.xyz` / `wss://rpc1.monad.xyz` for live `logs` | No API keys required |
| Reads | Contract views (`leaseOf`, `termsOf`, `escrowOf`, `marksOf`, `recentActivity`, `stats`, `statusBatch`) and Multicall3; never long log scans | 100-block `eth_getLogs` cap |
| Metadata | Build-time snapshot through Multicall3; image cache route | IPFS gateways unreliable from browsers |
| Hosting | Any Node host for Next.js with server routes | `ASSUMED` |
| Networks | Local mainnet fork and optional testnet for development; mainnet for submission | Section 12.1 |
| Python/AI | Not used | |

Every write path: simulate → explicit gas limit → sign → show proposed → confirm on receipt / finality.

### 12.1 Environments

The submitted product runs on **Monad mainnet** (`DECISION`). Chog Genesis exists only there; a contract on testnet cannot call `ownerOf` on the real collection, and a mock Chog would weaken the NFT gate, the claim ("ends the moment the Chog is sold") and the holder earnings. Testnet is for development only.

| Environment | Chain | Chog contract | Used for | Funds |
|---|---|---|---|---|
| Local fork | Foundry `anvil --fork-url https://rpc.monad.xyz` (chainId 143) | Real Chog Genesis at `0xc96d…3763`, forked state | Main development and testing. Contract tests, fork tests, frontend against a local node. Impersonate real holders (`vm.prank` / `anvil_impersonateAccount`) to test claims, terms, holder-mode haunts and a sale mid-lease. | None (local) |
| Monad testnet | chainId 10143 | `MockChog` (same IDs 1–1,969, free mint to any tester) | Optional: try the deployed frontend against a live network | Testnet MON from a faucet |
| Monad mainnet | chainId 143 | Real Chog Genesis | Final deploy, verified source, demo video, judges | Real MON |

Notes:
- Fork from the latest block. Monad full nodes do not serve arbitrary historical state, so pinning an old fork block may fail.
- The frontend picks the environment from configuration (chain ID, RPC URLs, Dybbo address, Chog address). The mainnet build must never point at `MockChog`.
- Mainnet cost estimate (`ASSUMED`, at the 100 MON-gwei minimum base fee, gas charged on the limit): about 0.5 MON to deploy and a few MON for a full round of demo transactions. Fund the builder wallet with 10 to 20 MON. At about $0.02 per MON (implied by https://docs.monad.xyz/developer-essentials/gas-on-monad and a ~5,500 MON floor for a ~$122 Chog on OpenSea) this is under $1.

---

## 13. Non-functional requirements

| ID | Requirement |
|---|---|
| NF-01 | A possession or haunt is reflected in the UI within about one second of the receipt (300 ms blocks, 600 ms finality). |
| NF-02 | No action requires a Chog to be approved, escrowed or wrapped, ever. |
| NF-03 | The site works read-only with no wallet. |
| NF-04 | If the primary RPC fails, reads fall back to the second RPC automatically. |
| NF-05 | If all IPFS gateways fail, token pages still show traits and status from the snapshot. |
| NF-06 | Gas limits set per function from measured values plus margin, so users do not overpay (fees are charged on the limit). |
| NF-07 | All amounts shown in MON with exact wei used on chain. |
| NF-08 | Contract source verified on MonadScan before submission. |
| NF-09 | No keys, credentials or wallet secrets in the public repo. Anything private goes only in the organizers-only judge field. |

---

## 14. Security and abuse

| Risk | Mitigation |
|---|---|
| Contract can move Chogs | No code path; tests; `/proof` page; verified source |
| Flash-borrowed Chog harvests escrow (ApeCoin pattern, P-12) | Contract holders closed by default (F-DO-02) |
| Spam haunting one Chog | 15 s cooldown per source; once per target per 24 h; ring buffer of 8; marks expire after 24 h; holders can close |
| Harassment through text | No free text; three preset marks only |
| Reentrancy on claim | Checks-effects-interactions plus guard; pull payments |
| Speculative state shown as final (P-20) | Confirm from receipts; label proposed state |
| Phishing look-alikes (Monad launch phishing wave, P-11, https://coinedition.com/monad-mainnet-launch-prompts-scam-warning-from-co-founder/) | Never ask for approvals; state "Dybbo never asks for an approval" on `/about` and `/proof`, so any approval prompt is a red flag |
| Builder rug | No admin, no sweep, no upgrade |
| Wrong traits from `<id>.json` assumption (K1) | `tokenURI` only |
| Reverted transactions still cost gas | Simulate first; "Try to take it" defaults to simulation |

---

## 15. Scope

### In

- The Dybbo contract on Monad mainnet with verified source: `possess`, `haunt` (three preset marks), `setTerms` (price or opt-out), `claim`, `claimMany`, and read functions.
- Default terms that make every EOA-held Chog possessable from the first block.
- Holder mode (haunt with your own Chog).
- The pages in section 10.1 and API routes in 10.2.
- The three reverts as in-app checks, plus Foundry tests that prove the claim.
- Judge access instructions that need no Chog.

### Out

- Anything that takes custody of a Chog or asks for an approval.
- Free-text messages, AI personalities, trait-to-stat combat, leaderboards, seasons.
- $CHOG staking, wagers or prize pools ($CHOG as fee currency only if the team asks; section 20).
- An SDK for other Chog apps, delegate.cash vault support, history indexing, mobile apps, a testnet mirror as the submitted product (testnet for development only).
- Visual design (in `frontend.md`).

---

## 16. Submission package

### 16.1 Description outline (≤ 8,000 characters)

1. One sentence and the claim.
2. What it does: possess any Chog for minutes; haunt; holders earn without signing up.
3. What is new: on-chain, per-action enforcement with no custody or approval; default-on earnings for all holders; contrast with rental markets and server-checked hires (section 3.2).
4. Why Chog matters: body, payee, off switch (section 5.2). "Take the NFT out" answer.
5. Why Monad: 300 ms blocks, 600 ms finality, ~$0.0005 actions.
6. How to test without a Chog (pointer to judge instructions).
7. Contract address, verified source, tests.
8. Pre-existing work: none.
9. Usage so far (section 17 numbers) and what's next.

### 16.2 Demo video (≤ 3 minutes)

First 30 seconds:
- 0–5 s: "You don't own a Chog. Possess one." Pick Chog #1462, pay 0.05 MON, the five-minute timer starts.
- 5–15 s: haunt two other Chogs; the marks appear on their public cards, labelled "by #1462, possessed".
- 15–25 s: "Try to take it": the transfer call reverts. MonadScan shows `isApprovedForAll(holder, Dybbo) = false`.
- 25–30 s: the timer hits zero and the next haunt reverts. #1462 shows 0.05 MON claimable by its holder; a claim from the possessor's wallet reverts.

Remaining time: the "Before" contrast (approval prompt and the 2026 sweep), a holder claiming earnings and haunting back (needs a holder; section 20), the `/proof` page, and usage numbers.

### 16.3 Judge access instructions (organizers-only field)

- No Chog needed. A Monad wallet with ~0.05 MON covers several tests.
- Steps from section 11.3, with the expected revert for each.
- Optional (`DECISION` pending): a small pre-funded test wallet for judges, placed only in this private field.

### 16.4 Go-to-market (optional field)

- Holders are paid by default, so every holder has a reason to share their Chog's earnings and marks.
- Ask the Chog team to feature possession nights during Chogtober.
- Other Chog apps could later accept a possession lease as "playing as this Chog" (SDK out of scope now).

### 16.5 README, first screen

- One sentence and the claim.
- "Try it without a Chog": open the link, pick any Chog, possess it for one minute for 0.01 MON.
- Contract address with verified source, and the three reverts a judge can trigger.

---

## 17. Metrics (reported under "What's next")

All read from `stats()` on chain, so they are checkable:
- Total possessions; distinct possessors; distinct Chogs possessed.
- Total haunts; share made in holder mode (strike-backs).
- MON paid into escrow; MON claimed by holders; number of holders who claimed.
- Repeat possessors (from events, sampled within the RPC range limits).

---

## 18. Prior art and the gap

| Project | What it does | Gap |
|---|---|---|
| https://github.com/Ganrak/chog-contracts | Holders list a Chog for hire by signature; hunters use it; holder gets 30% of bounties | Opt-in; server-checked; nothing enforced on chain |
| https://github.com/techbone/grudge | On-chain prank war on Monad mainnet between holders; $CHOG costs for scrubs and truces | Non-holders only get an off-chain studio |
| https://github.com/blessedunit/chog-pet | Anyone can babysit any Chog | Server-side (Cloudflare Workers, D1); no payments to holders |
| https://github.com/cipoklean/chog-mischief | Signed, gasless prank war | Holders only; no chain enforcement |
| https://eips.ethereum.org/EIPS/eip-4907 | Rental "user" role | Needs the NFT contract to implement it; Chog Genesis does not |
| https://www.renft.io/ ; https://github.com/code-423n4/2024-01-renft-findings/issues/588 | Rentals via a rental safe | Custody; renters could hijack tokens |
| https://docs.delegate.xyz/ | Broad delegation for proving ownership | No paid, expiring, scoped game actions; v2 not on Monad |
| https://github.com/StellarDevHub/soroban-playground/issues/1841 | Collateral-free usage rights | A proposal, other chain |

**The gap:** Dybbo is the only design found that enforces a paid, expiring, narrowly scoped control right on chain at every action, without custody or approval, ends it automatically on a sale, and pays the token's current holder even if they never opted in.

---

## 19. Risks and kill criteria

| Condition | Response |
|---|---|
| The Chog team objects to every Chog being possessable by default | Narrow to opt-in listing (weaker cold start and novelty) or switch to the runner-up |
| ~~The team does not allow Chog art in this kind of interaction~~ | **Resolved 2026-10-21:** Chog art is allowed (builder confirmation). No longer a kill criterion. |
| A ten-minute playtest with three people shows haunting is not fun | Narrow the action set or switch to the runner-up |
| Mainnet deployment is blocked (no MON, RPC limits break the demo) | A testnet mirror would weaken the NFT gate; prefer switching |
| Another entry ships on-chain possession with per-action owner checks before 2026-10-23 | Re-angle or switch |
| Judges read it as "just rentals" (novelty is 30% and the first tie-breaker) | Lead the video with the three reverts and default-on earnings, not the word "rent" |
| No holder available to show a real claim | Show the non-holder claim revert and escrow balance; the holder claim is shown later if a holder joins |

Design choices stated openly: unclaimed escrow follows the token to a buyer; marks expire after 24 hours; the holder keeps full control and can opt out at any time (for new leases).

---

## 20. Open questions and items needing the user

| Item | Why it matters | Where |
|---|---|---|
| Send the sponsor validation message (below) | Default-on possession and fee currency | Chog Discord https://discord.gg/chog |
| Mainnet vs testnet expectation | **Decided:** mainnet for submission, testnet and local fork for development (section 12.1). Still worth confirming the event accepts mainnet-only entries that judges pay a small fee to use. | Discord |
| Default price per minute | MON is about $0.02, so the default 0.01 MON per minute is about $0.0003 a minute and a 5-minute lease pays the holder about $0.001. Holder earnings will look like nothing. Choose a higher default (on the order of 1 to 5 MON per minute), raise `MAX_PRICE`, and show USD next to MON. Until decided, constants in section 8.2 stand. | Builder |
| Do judges hold Chogs? | Shapes `/judges` and the video | Discord |
| $CHOG bonus size, and MON vs $CHOG for fees | If $CHOG: fee paid by ERC-20 `transferFrom` with an exact-amount $CHOG approval (an ERC-20 approval, never an NFT approval) | Discord |
| Do community hearts affect scores? | Effort on sharing | Discord |
| Judges' names and recent posts | Sharpen the pitch | @ChogNFT on X (needs login), Discord |
| Recent posts from @ChogNFT, @1stBenjaNAD, @Toadster69 | Team priorities | X |
| MON for deployment and demo | Builder holds no Chog; needs a small MON balance | Builder |
| A Chog holder willing to claim and strike back on camera | Holder half of the video | Discord or friends |
| ~~Chog art usage permission~~ | **Resolved 2026-10-21:** allowed (F-MD-06) | — |
| Pre-funded judge wallet: yes or no | Lowers friction; small loss risk | Builder |

### Sponsor validation message (status: `PENDING USER`)

> gchog! For Chogathon I'm building Dybbo: anyone without a Chog can possess any Chog Genesis for a few minutes, paid to that Chog's holder, with no approvals and no custody. The contract checks `ownerOf` on every action and the lease ends the moment the Chog is sold. Would the team be happy with every Chog being possessable by default (holders can opt out or set their own price), and would you rather the fee be paid in MON or $CHOG?

---

## 21. Runner-up and alternatives considered

### Runner-up: The Failed Experiment (score 26)

The whole Chog Genesis collection becomes one on-chain organism, and an outbreak spreads Chog to Chog by traits (Radioactive base and Skull form as patient zero), with all 1,969 Chogs updated in one transaction (~0.70M gas measured on mainnet; ~21.8M if state is scattered across pages). Anyone can replay every tick from chain data.
- Why the obvious fix fails: a server plus a posted Merkle root proves publication, not computation; the naive on-chain version costs ~21.8M gas per pass.
- Why it lost: lower specificity and a more abstract demo moment (replaying a forged board); tighter build (~28 to 32 h); holder actions in the demo need a Chog.
- Validation message (`PENDING USER`): asks whether Radioactive and Skull Chogs may start as patient zero and whether a $CHOG-funded cure fits the team's guidelines.
- Kill criteria: holders read "infected" as damage to their NFT; trait data cannot be loaded reliably; holder actions cannot be shown without a Chog.

### Third: Mascot on Duty (score 22)

Anyone can make any Chog "Monad's mascot right now" by paying rent per second to that Chog's holder; the crown can change every block. Lost on specificity and novelty (Harberger patterns, Wildcards, EIP-5320; nightly and weekly crowns in game-of-chogs and chog-league). Kill criteria: no bidders during judging; team objects to the "mascot" name; read as an old Harberger pattern.

### All candidates (Phase 4 to 6)

| ID | Name | Outcome | Reason |
|---|---|---|---|
| C-01 | Dybbo (researched as "Possession") | **Winner, 30** | — |
| C-02 | Leash | Dropped | Fails port test; category; form-submit demo (grant check folded into C-01) |
| C-03 | Ghosts | Dropped | Fails port test; needs sales during judging |
| C-04 | The Failed Experiment | Runner-up, 26 | — |
| C-05 | Chog Tape | Dropped | Fails delete test; category; crowded by chog-league |
| C-06 | Hot Chog | Dropped | Fails port and delete tests |
| C-07 | Crews | Dropped | Fails port test; needs crews during judging |
| C-08 | Roots | Dropped | Fails port test; form-submit demo |
| C-09 | Exit Desk | Dropped | Category (marketplace); needs liquidity |
| C-10 | Chog World Order | Kept, 19 | Needs voters and other apps during judging; crowded by chog-yearbook, chogcourt |
| C-11 | Pay the Chog | Dropped | Fails port test; form-submit demo (escrow folded into C-01) |
| C-12 | Mascot on Duty | Third, 22 | — |
| C-13 | The Chog Wave | Eliminated | Feasibility 0: landing a transaction in an exact block from a public RPC was not verified (`UNVERIFIED`) |

### Scorecard (event type `polish`: criteria 1 and 4 doubled)

| # | Criterion | C-01 | C-04 | C-10 | C-12 | C-13 |
|---|---|---|---|---|---|---|
| 1 | Specificity (×2) | 3 | 2 | 1 | 1 | 1 |
| 2 | Host essential | 2 | 3 | 2 | 2 | 3 |
| 3 | Sponsor essential | 3 | 3 | 3 | 3 | 3 |
| 4 | Demo moment (×2) | 3 | 2 | 2 | 2 | 2 |
| 5 | Feasibility | 3 | 2 | 2 | 3 | 0 |
| 6 | Defensible claim | 3 | 3 | 3 | 3 | 3 |
| 7 | Novelty | 2 | 2 | 1 | 1 | 3 |
| 8 | Judging fit | 2 | 3 | 1 | 2 | 2 |
| 9 | After-life | 3 | 2 | 1 | 2 | 1 |
| | Weighted total | **30** | **26** | **19** | **22** | eliminated |

---

## 22. Decisions in this PRD that refine FINAL_IDEA.md

| Decision | FINAL_IDEA.md said | This PRD | Why |
|---|---|---|---|
| Network | Not specified (testnet `ASSUMED` allowed) | Mainnet for submission; local fork and testnet for development | Chog Genesis exists only on mainnet |
| Chog art | Permission unknown (kill criterion) | Allowed; shown as-is on every page with a Chog | Builder confirmation, 2026-10-21 |
| Default-open scope | Every Chog starts possessable | Every **EOA-held** Chog starts possessable; contract-held Chogs closed until their holder opens them | Blocks flash-borrow escrow harvesting (P-12) |
| Holder mode | Haunted holders "can possess back" | Holders haunt with their own Chog without a lease | A holder cannot possess their own Chog; strike-back needs a direct path |
| Closed Chogs | Holders can opt out | Opted-out Chogs can be neither possessed nor haunted | Respect holders who opt out |
| Refunds | Not specified | No refunds on expiry or sale | Leases ≤ 10 minutes; simpler, safer contract |
| Terms on sale | Not specified | Reset to defaults for the buyer | Terms belong to the holder who set them |
| Duration and price | 5 minutes at 0.05 MON; 1 minute at 0.01 MON | 1–10 minutes; default 0.01 MON per minute; bounds 0.001–1 MON | Matches the demo numbers |
| Rate limits | ~20 actions per 5-minute session | 15 s cooldown; once per target per 24 h | Same session size; limits spam |
| Admin | Not specified | No admin, pause, upgrade or fee | Strengthens the claim; nothing for the builder to rug |
| Activity feed | Not specified | On-chain ring buffer of 64 actions | Avoids an indexer under the 100-block log cap |

---

## 23. Research trail (complete)

### 23.1 Constraints (Phase 0)

- Solo, registered; 30+ hours available; comfortable with TypeScript + React/Next.js, Solidity (Foundry/Hardhat), browser games, Python backend + AI APIs.
- Does not hold a Chog Genesis NFT.
- Testnet allowed: `ASSUMED` (event silent). Reading mainnet state is free, so real ownership can be read either way. Superseded for Dybbo by the mainnet decision in section 12.1.
- Chog art: allowed (builder confirmation, 2026-10-21).
- Builder edge (skill defaults): Web3 builder and active trader; creates educational content about trading platforms on X; strongest knowledge in trading, trading tools, onchain markets, agent payments, privacy payments.

### 23.2 Host and recent shipments (Phase 1)

- Host: Chog, "Mascot of Monad"; lore: a curious, mischievous kid who causes chaos, building the "Chog World Order"; "born from a failed AI experiment" (https://www.chog.xyz , https://app.zerion.io/tokens/CHOG-8519695d-960d-4c07-a735-ff7d3cad6ad9).
- Team (display names, no roles): Yot, Mamio, Benja, Toad, PingPingPingPing, Novee, Tonashiro, Bigchog, Rogue, Tabsu, Venty, Cookie (https://www.chog.xyz/team). Founders reported as @1stBenjaNAD and @Toadster69 (https://leakme.beehiiv.com/p/monad-mainnet-countdown-memes-community-and-defi-ready-to-go-live).
- Judges: not announced; `INFERRED` to be the Chog team (admin page asks judges to verify team membership through X and use a judge code).
- Chog tools: PFP Maker, Meme Maker, Snapshoter (holder snapshots, CSV/JSON), Messenger (subject, address, message, "send a chog message through NFT"), Chog Swap; Portal (Discord-linked wallet submission for the Genesis mint) (https://www.chog.xyz , https://www.chog.xyz/snapshoter , https://www.chog.xyz/messenger , https://portal.chog.xyz/).
- Partner logos on chog.xyz: OpenSea, Kuru, Monorail, nad.fun, Jumper, DexScreener (not hackathon sponsors).
- Monad shipments: MIP-12 300 ms blocks (2026-07-23), MONAD_TEN / MIP-8 page storage (2026-09-02), v0.16.2 RPC fixes (2026-09-10), Monad API Hub (pay-per-request USDC, no keys), Monad Private Settlement design announced 2026-10-06 (not live, no SDK) (https://docs.monad.xyz/developer-essentials/changelog/releases , https://monad.xyz/blog/monad-ecosystem-highlights-september-2026 , https://monad.xyz/blog/monad-private-settlement).
- Monad stats as of 2026-09-30: 4.3M+ wallets, 860.1M+ transactions, 170+ apps, ~200 validators.
- Earlier editions: none found. Proxy winners (Monad Rebel in Paradise AI Hackathon, Application Innovation track, March 2026): AgentVerse, Campfire, Web3 Quant Trading Challenge Game (https://www.kucoin.com/news/flash/monad-ai-hackathon-concludes-with-11-winning-projects-and-major-llm-partnerships).
- Host goal: grow Chog into an IP and inspire a new NFT meta (stated); give the seven-week-old collection a reason to be held and used (`INFERRED`).

### 23.3 Known gaps carried as pain (Phase 2)

- K1 Token ID ≠ metadata file after the reveal shuffle (token 1 → `1462.json`).
- K2 No rentals (no ERC-4907) and no transfer hooks.
- K3 Testnet contracts cannot see mainnet ownership; several entries use mock Chogs (https://github.com/aminuayomide/chog-state).
- K4 Public RPC caps `eth_getLogs` at 100 blocks (~30 s of chain time).
- K5 Several public IPFS gateways failed from the browser; Pinata worked.
- K6 No official builder doc; at least one entry used demo traits while waiting for confirmation (https://github.com/victorhez/ChogChaosLeague).
- K7 Thin $CHOG liquidity (~$92K main pool).
- K8 No published $CHOG usage guidelines.

### 23.4 Overlap zones (Phase 2)

Z1 owner-checked live actions (Dybbo's zone); Z2 the whole collection as one on-chain board; Z3 value that lives in the token (ERC-6551); Z4 narrow, short-lived use rights for non-holders (Dybbo's zone).

### 23.5 Pain bank (Phase 3, all 26)

| ID | Pain | Source |
|---|---|---|
| P-01 | Judge without a Chog gets a simulated or spectator mode | https://github.com/JimmyOgb/ChogSignal , https://github.com/victorhez/ChogChaosLeague |
| P-02 | Non-holder gets arcade, practice or guest modes only | https://github.com/neromtoobad/chogstack , https://github.com/Mhiah/chogmate , OpenSea, Monad stats |
| P-03 | Holder cannot lend an idle Chog without handing it over | RPC `supportsInterface` read |
| P-04 | Lender loses the rented NFT through a receive hook | https://github.com/code-423n4/2024-01-renft-findings/issues/588 |
| P-05 | Indexer builders hit the 100-block log cap | https://github.com/category-labs/monad-bft/issues/2172 , RPC docs |
| P-06 | Testnet builds use mock Chogs | https://github.com/aminuayomide/chog-state |
| P-07 | Wrong traits from `<id>.json` | RPC read |
| P-08 | Builders wait for contract and metadata confirmation | https://github.com/victorhez/ChogChaosLeague |
| P-09 | Fake leaderboard scores force server re-simulation | https://github.com/0xSheriff/chog-swarm |
| P-10 | Old marketplace approval swept (25,994 NFTs, 3,033 addresses) | https://bitquery.io/investigations/nft-approval-exploit-two-sweeps |
| P-11 | New Monad users phished after fake-transfer lures | https://coinedition.com/monad-mainnet-launch-prompts-scam-warning-from-co-founder/ |
| P-12 | Airdrop claimed with flash-borrowed NFTs | https://www.theblock.co/post/138410/someone-borrowed-5-bored-apes-to-claim-1-1-million-of-ape-tokens |
| P-13 | Unbacked bridged-token mint ($76M) | https://www.coindesk.com/business/2026/05/19/echo-protocol-suffers-usd76-million-exploit-in-ebtc-minting-attack-on-monad |
| P-14 | Urgent seller loses ~12% to the bid spread | https://opensea.io/collection/chog-genesis |
| P-15 | Web3 game players leave (2–5% Day-30 retention) | https://blockeden.xyz/blog/2026/05/02/web3-gaming-collapse-q1-2026-eight-shutdowns-token-retention/ |
| P-16 | Slippage in the thin $CHOG pool | DexScreener |
| P-17 | Launchpad buyers lose to first-block snipers (pump.fun analog) | https://bitquery.io/investigations/pump-fun-snipers-bundles , https://learn.backpack.exchange/articles/what-is-nad-fun-monad |
| P-18 | Vault holders lose perks when apps check only the connected wallet | https://docs.delegate.xyz/ |
| P-19 | Stale listings filled at old prices | cited at https://docs.delegate.xyz/ |
| P-20 | Speculative `latest` shows an action that later does not finalize | https://docs.monad.xyz/reference/rpc-differences |
| P-21 | Followers copy traders whose calls were posted after the move | `BUILDER-OBSERVED` |
| P-22 | Real callers cannot prove timing | `BUILDER-OBSERVED` |
| P-23 | Platform win rates cannot be checked | `BUILDER-OBSERVED` |
| P-24 | AI trading agent with a hot key drains the wallet | `BUILDER-OBSERVED` |
| P-25 | Tippers expose their main wallet | `BUILDER-OBSERVED` |
| P-26 | Lending through `setApprovalForAll` gives up the right to refuse transfers | `BUILDER-OBSERVED` |

Pains Dybbo addresses directly: P-01, P-02, P-03, P-04, P-10, P-26; mitigated in design: P-11, P-12, P-20; feasibility notes: P-05, P-07, P-08.

### 23.6 The Chogathon field (Phase 5, ~65 public entries on 2026-10-20)

- Trait-to-stats games: chog-swarm, knock-candy-siege, playhouse, chog-engine, chogbound, Chog-Fight-club, chog-arena, Chogwar, chog-clash, chogrumble, chog-raid, chog-heist, chog_hideout, grand-theft-chog, chogsweeper, Chog-Dash, PlumpyTower, chogstack.
- Per-token life, memory or AI: chog-brain, chogtown/chogmate, chog-souls, chogchronicle, possess ("the NFT is the save file", not related to this idea), chog-state, chog-survivor, chog-pet, chog-buddy, Soul, chog-legacy, chog-1969.
- Social and money: grudge, chog-mischief, game-of-chogs, chog-league, chog-yearbook, chogcourt, chog-debt, chog-bank, chog-contracts, ChogSignal, chogchemy.

---

## 24. Sources

Event and host
- https://chogathon.chog.xyz/
- https://chogathon.chog.xyz/dashboard
- https://raw.githubusercontent.com/Harshyadav442277/Chogathon/main/RULES.md
- https://www.chog.xyz
- https://www.chog.xyz/team
- https://www.chog.xyz/snapshoter
- https://www.chog.xyz/messenger
- https://portal.chog.xyz/
- https://discord.gg/chog
- https://leakme.beehiiv.com/p/monad-mainnet-countdown-memes-community-and-defi-ready-to-go-live
- https://app.zerion.io/tokens/CHOG-8519695d-960d-4c07-a735-ff7d3cad6ad9
- https://x.com/guto_hidalgo/status/1974486561254219945

Collection, token and chain data
- https://monadscan.com/address/0xc96d31F8626c6D03Fae5dCD3d61e3FB9F4a73763
- https://opensea.io/collection/chog-genesis
- https://dexscreener.com/monad/0x116e7d070f1888b81e1e0324f56d6746b2d7d8f1
- https://rpc.monad.xyz (live reads on 2026-10-20)
- https://gateway.pinata.cloud/ipfs/bafybeid4ybujnscdipkno7ps5utqelp5ry5ryreqhay3zhgk3a6x4jruqu/1462.json

Monad docs and source
- https://docs.monad.xyz/introduction/monad-for-developers
- https://docs.monad.xyz/developer-essentials/gas-on-monad
- https://docs.monad.xyz/developer-essentials/opcode-pricing
- https://docs.monad.xyz/developer-essentials/differences
- https://docs.monad.xyz/reference/rpc-differences
- https://docs.monad.xyz/developer-essentials/changelog/releases
- https://monad.xyz/blog/monad-ecosystem-highlights-september-2026
- https://monad.xyz/blog/monad-private-settlement
- https://grafa.com/en/news/crypto/monad-upgrade-makes-grouped-data-98-cheaper
- https://github.com/category-labs/monad/blob/main/category/execution/ethereum/state3/page_tracker.hpp
- https://github.com/category-labs/monad-bft/issues/2172
- https://github.com/wevm/viem/blob/main/src/chains/definitions/monad.ts

Pains and incidents
- https://github.com/code-423n4/2024-01-renft-findings/issues/588
- https://bitquery.io/investigations/nft-approval-exploit-two-sweeps
- https://coinedition.com/monad-mainnet-launch-prompts-scam-warning-from-co-founder/
- https://www.theblock.co/post/138410/someone-borrowed-5-bored-apes-to-claim-1-1-million-of-ape-tokens
- https://www.coindesk.com/business/2026/05/19/echo-protocol-suffers-usd76-million-exploit-in-ebtc-minting-attack-on-monad
- https://blockeden.xyz/blog/2026/05/02/web3-gaming-collapse-q1-2026-eight-shutdowns-token-retention/
- https://bitquery.io/investigations/pump-fun-snipers-bundles
- https://learn.backpack.exchange/articles/what-is-nad-fun-monad
- https://docs.delegate.xyz/
- https://github.com/delegatecash/delegation-registry

Prior art
- https://github.com/Ganrak/chog-contracts
- https://github.com/techbone/grudge
- https://github.com/blessedunit/chog-pet
- https://github.com/cipoklean/chog-mischief
- https://github.com/JimmyOgb/ChogSignal
- https://github.com/victorhez/ChogChaosLeague
- https://github.com/neromtoobad/chogstack
- https://github.com/Mhiah/chogmate
- https://github.com/aminuayomide/chog-state
- https://github.com/0xSheriff/chog-swarm
- https://github.com/Guzman0/chog-league
- https://github.com/GunroarCannon/chog-yearbook
- https://github.com/GunroarCannon/game-of-chogs
- https://github.com/sopskistar/chogcourt
- https://github.com/NathanOyewole/possess
- https://github.com/hackid02/chog-frequencies
- https://github.com/filmyheal1/chogforge
- https://eips.ethereum.org/EIPS/eip-4907
- https://www.renft.io/
- https://github.com/StellarDevHub/soroban-playground/issues/1841
- https://devpost.com/software/token-of-infection
- https://www.infected.dev/
- https://github.com/noplan-inc/lifegame-nft
- https://opensea.io/collection/life-nft
- https://techannouncer.com/wildcards-purports-to-save-endangered-species-with-technical-first-for-ethereum/
- https://ethereum-magicians.org/t/eip-5320-harberger-taxes-nft/10084
- https://outland.art/artists/simon-de-la-rouviere
- https://arxiv.org/pdf/1907.00042
- https://www.kucoin.com/news/flash/monad-ai-hackathon-concludes-with-11-winning-projects-and-major-llm-partnerships

Local evidence
- `evidence/mip8-gas-probe.md`, `evidence/mip8_gas_probe_asm.py`, `evidence/mip8_gas_probe_bytecode.json`

---

## 25. Git commit rules

Git commits are a required part of the development process. During the build, commit changes continuously instead of waiting until the entire project is finished.

### 25.1 Commit frequency

For a normal build, aim for **50+ meaningful commits** across the development process. Do not create meaningless commits to reach the number: every commit is a real, completed development step.

Commit whenever a logical unit of work is complete, such as:

- Creating a new page
- Creating or modifying a component
- Adding a feature
- Implementing an API endpoint
- Adding database functionality
- Adding authentication logic
- Adding validation
- Adding error handling
- Connecting frontend to backend
- Adding a utility or helper
- Adding a configuration
- Refactoring a specific section
- Fixing a bug
- Improving an existing feature
- Adding tests
- Fixing failing tests
- Improving responsiveness
- Fixing accessibility issues
- Updating documentation
- Completing a route
- Completing a major UI section
- Integrating an external service

### 25.2 Commit process

After completing each logical development unit:

1. Check the current changes.
2. Verify that the changes work.
3. Stage only the relevant files.
4. Create a descriptive commit.
5. Continue building from the committed state.

Use conventional commit messages where appropriate:

- `feat: add dashboard`
- `feat: add wallet connection`
- `feat: implement transaction history`
- `fix: resolve wallet connection error`
- `refactor: simplify auth middleware`
- `test: add dashboard tests`
- `style: improve mobile layout`
- `docs: update setup instructions`

### 25.3 Rules

- Do not wait until the end of the project to commit everything.
- Do not make one giant commit containing the entire project.
- Do not create fake changes solely to increase the commit count.
- Do not repeatedly modify and commit the same thing without a meaningful reason.
- Keep commits small, focused and logically separated.
- Before moving to the next major feature, make sure the previous feature has been committed.
- If a task contains several independent steps, commit each completed step separately.
- If a bug is found and fixed during development, commit the fix separately.
- If a meaningful refactor is made, commit it separately.

### 25.4 Target

For a substantial project, aim for **50+ meaningful commits by the time the build is complete**, distributed naturally throughout development. The history should show the progression from initial setup → individual features → integrations → fixes → testing → polish → final state.

At the end of the build, run `git log` and verify that the history accurately reflects the development process.
