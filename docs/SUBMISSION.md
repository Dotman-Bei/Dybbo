# Chogathon 2026 submission

Fields of the submission form (PRD §2.5), ready to paste. One value is still to fill:

- `{VIDEO_URL}`: the unlisted YouTube or Google Drive link to the demo video

Usage numbers under "What's next" were read from the contract's `stats()`; re-run the command at the end just before submitting and update them.

---

## Project name

Dybbo

## Description

> Paste from here to the end of this section. Limit 8,000 characters (this text: 6,252).

Dybbo: possess any Chog for a few minutes

There are 1,969 Chog Genesis and about 982 people who own one. Monad has more than 4.3 million wallets. The difference is the audience almost every Chog app leaves out. Open a holder-gated Chog game without a Chog and you get a guest mode, a practice mode, a "simulated judge" column. You watch. Someone else plays.

The obvious fix is to let holders lend. But Chog Genesis has no rental role, so lending means sending the NFT to an escrow, wrapping it, or signing setApprovalForAll, which hands a contract the power to move every NFT in the wallet. That power is where NFTs go missing. reNFT renters could hijack rented tokens during the handoff (Code4rena 2024, issue #588). In one 2026 sweep, a single forgotten approval let one wallet take 25,994 NFTs from 3,033 wallets. Holders are right to say no.

So we asked a narrower question. Can someone without a Chog really control one for a while, without the holder giving up anything at all?

WHAT DYBBO DOES

The name comes from the dybbuk, the spirit in folklore that borrows a living body and leaves when it is driven out.

Pick any Chog, pay its price per minute (0.01 MON by default) for 1 to 10 minutes, and you act as it. The whole fee drops into that Chog's escrow. The NFT never moves. A possession is only a record inside the Dybbo contract: who, which Chog, until when, and who owned it when the lease began.

While the timer runs, you haunt. Leave Boo, Slime or Hex on another Chog and the mark sits beside its art on its public page for a day, signed "by #1462, possessed". One haunt every 15 seconds, one per target per day, eight live marks per Chog. The Chog's metadata and image never change.

Holders don't need a lease to haunt with their own Chogs, so a haunted holder can strike back. Holders never sign up either: every Chog in a wallet is open from the first block and earns by default. Whoever holds the Chog when they claim takes its escrow. They can set their own price or close their Chog.

HOW IT HOLDS

The contract touches Chog Genesis in exactly one way: it reads ownerOf. There is no code path to approve or transfer, and a test scans the deployed bytecode for any approve or transfer selector and finds none.

Each haunt re-reads ownerOf inside the same transaction. A lease is live only while the clock hasn't run out and the Chog still belongs to whoever owned it when the lease began. Control ends in the block the lease expires (LeaseExpired) or the block the Chog changes hands (OwnerChanged). No server checks anything later, and nothing needs revoking.

Escrow is keyed to the token, not to a person, and pays only the current ownerOf. Sell your Chog and the buyer can claim what it earned before the sale. The token page says so before anyone buys.

Two edge cases shaped the rules. Chogs held by contracts start closed, because a lending vault could let someone borrow a Chog for one block just to drain its escrow, the trick that once claimed 60,564 APE with five borrowed apes. Smart-account (EIP-7702) wallets count as normal wallets, which keeps 1,968 of the 1,969 Chogs open on day one. And there is no admin: no owner, no pause, no upgrade, no protocol fee, no function that can touch escrowed MON.

DON'T TRUST US, RUN IT

During a possession, press "Try to take it". The app asks the real Chog Genesis contract to move the Chog to you, and it refuses: ERC721InsufficientApproval. Beside the refusal sit the approval reads: approved for all is false, the approved address is empty. Wait out the timer and "Try one more haunt" reverts with LeaseExpired. The /proof page runs all three checks as free simulations against mainnet.

WHAT'S NEW

Every way to lend an NFT today gives a contract power to move it. Dybbo lends control without handing over any power. The possessor gets a role inside Dybbo, enforced by Dybbo, and the Chog never leaves its holder's wallet. Ownership is checked on chain at every action, not by a server on a timer. The collection is open by default, so nobody has to list anything. Fees belong to the token and follow it through sales.

It needs Monad to work. Every haunt is its own transaction with ownerOf read inside it, and with 300 ms blocks and sub-cent fees, a sale or an expiry takes effect on the very next block. On a slower, pricier chain, the practical design is a server that re-checks ownership now and then, which is the exact weakness Dybbo exists to avoid.

A THIRD WAY TO HOLD AN NFT

You can own an NFT or look at one. Dybbo adds a third option: be one, briefly. A mark signed "by #1462, possessed" is a public act by a Chog someone else owns, paid for in advance, with the holder's consent built in by default. A Chog earns while it sits in a wallet, with no listing. And because a live lease is public on chain (leaseOf), any holder-gated Chog game could let a possessor play "as this Chog" instead of benching them in spectator mode.

WHY IT HAS TO BE CHOG

Pull the NFT out and nothing is left. The Chog is the body being possessed. It is the payee, since escrow is keyed to its token ID and only its current owner can claim. It is the off switch, since the lease dies the moment ownerOf changes. And Chog's own lore is a curious, mischievous kid who causes chaos. Dybbo hands that role to anyone for a few minutes.

WHY PEOPLE COME BACK

Getting haunted is a reason to return. The mark names the Chog that left it, and answering costs only gas. Marks expire after 24 hours, so staying haunted, or having the last word, means coming back. Fees keep piling up for holders until they claim. Leases are short enough to do again with another Chog, and a possessor can run several at once. During Chogtober, one possession night leaves the collection visibly haunted the next day.

We won't call retention proven. The contract went live on 2026-10-22, and its counters (possessions, haunts, distinct possessors, fees paid and claimed) are public through stats(). That is how we'll know.

TRY IT

No Chog needed. https://dybbo.vercel.app/judges walks through the full loop with about 0.1 MON.

Contract: 0x908D8899795072985e35CB86dA3Aff88CE4e72e9 on Monad mainnet, source verified on Sourcify. 53 Foundry unit tests, plus 3 fork tests against the real Chog Genesis.

## Short versions of the description

For places that ask for less. Same facts as the full description above.

### About 600 words

```text
Dybbo: possess any Chog for a few minutes

About 982 people own the 1,969 Chog Genesis. Monad has more than 4.3 million wallets. Everyone in between gets a guest mode in holder-gated Chog apps: they watch, someone else plays.

Lending looks like the fix, but Chog Genesis has no rental role. It means an escrow, a wrapper, or setApprovalForAll, all of which give a contract power to move the NFT. That power is how NFTs get lost: in one 2026 sweep, a single forgotten approval cost 3,033 wallets 25,994 NFTs. So we asked: can someone without a Chog control one for a while, while the holder gives up nothing?

WHAT IT DOES

Dybbo, named after the dybbuk (a folklore spirit that borrows a body), lets anyone possess any Chog for 1 to 10 minutes at its price per minute (0.01 MON by default). The full fee goes into that Chog's escrow. The NFT never moves; a possession is only a record in the Dybbo contract.

While the timer runs, you haunt: leave Boo, Slime or Hex on another Chog, shown beside its art for 24 hours and signed "by #1462, possessed". One haunt every 15 seconds, one per target per day, eight live marks per Chog. Holders haunt with their own Chogs without a lease, so the haunted can strike back. Holders never sign up: every Chog in a wallet is open from the first block, and whoever holds it when they claim takes its escrow.

HOW IT HOLDS

The contract touches Chog Genesis only to read ownerOf. It has no code path to approve or transfer, and a test scans its bytecode to prove it. Every haunt re-reads ownerOf in the same transaction, so control ends in the block the lease expires (LeaseExpired) or the Chog changes hands (OwnerChanged). Escrow is keyed to the token and pays only its current owner, so fees follow the Chog through a sale. Chogs held by contracts start closed, so nobody can borrow one for a block to drain its escrow. That still leaves 1,968 of 1,969 Chogs open. No owner, no pause, no upgrade, no protocol fee.

You don't have to trust us. "Try to take it" asks the real Chog Genesis to move the Chog to the possessor, and it reverts with ERC721InsufficientApproval. After the timer, a haunt reverts with LeaseExpired. The /proof page runs the checks free against mainnet.

WHAT'S NEW

Every lending method today hands a contract power over the NFT. Dybbo lends control without handing over any power, checks ownership on chain at every action instead of on a server timer, opens the whole collection by default, and ties fees to the token. It needs Monad: 300 ms blocks and sub-cent fees make a per-action owner check practical.

You could own an NFT or look at one; now you can briefly be one. A live lease is public (leaseOf), so other Chog games could let possessors play as a Chog instead of spectating.

WHY CHOG

Remove the NFT and nothing is left. The Chog is the body possessed, the payee (escrow keyed to its ID), and the off switch (a lease dies when ownerOf changes). Chog's lore is a mischievous kid who causes chaos; Dybbo lets anyone play that role.

WHY PEOPLE RETURN

Being haunted invites a strike-back that costs only gas. Marks expire in 24 hours, so staying visible means coming back. Holder fees keep accruing until claimed. Retention isn't proven yet; the live contract's public stats() counters will show it.

Try it with no Chog and about 0.1 MON: https://dybbo.vercel.app/judges. Contract 0x908D8899795072985e35CB86dA3Aff88CE4e72e9 on Monad mainnet, verified on Sourcify.
```

### About 300 words (no headings)

```text
About 982 people own the 1,969 Chog Genesis, while Monad has more than 4.3 million wallets. Everyone else gets a guest mode in holder-gated Chog apps. Lending could fix that, but Chog Genesis has no rental role, so lending means an escrow, a wrapper or setApprovalForAll, each giving a contract power to move the NFT. That power is how NFTs get lost: one forgotten approval cost 3,033 wallets 25,994 NFTs in a single 2026 sweep.

Dybbo, named after the dybbuk, a folklore spirit that borrows a body, lets anyone possess any Chog for 1 to 10 minutes at 0.01 MON a minute by default. The whole fee goes into that Chog's escrow, and the NFT never moves. While the timer runs, you haunt other Chogs with Boo, Slime or Hex, a mark shown beside their art for 24 hours and signed "by #1462, possessed". Holders haunt back with their own Chogs, never sign up, and whoever holds a Chog when they claim takes its escrow.

The contract only reads ownerOf from Chog Genesis and has no code path to approve or transfer. Every haunt re-checks ownership in the same transaction, so control ends in the block the lease expires or the Chog changes hands. No owner, no pause, no upgrade, no protocol fee. In the app, "Try to take it" asks the real Chog Genesis to move the Chog, and it refuses with ERC721InsufficientApproval.

That is what's new: control without handing over power, enforced at every action on Monad, where 300 ms blocks and sub-cent fees make it practical. Remove the Chog and nothing is left; it is the body, the payee and the off switch. Marks expire, haunts invite strike-backs and fees keep accruing, which gives people reasons to return.

Try it with no Chog: https://dybbo.vercel.app/judges
```

## Demo video

{VIDEO_URL} (script: [VIDEO.md](VIDEO.md))

## App link

https://dybbo.vercel.app

## Tech stack

Solidity 0.8.30 and Foundry (unit, fuzz and fork tests; gas measured on Monad with `eth_estimateGas` state overrides). Next.js 16 (App Router, TypeScript), viem and wagmi on Monad mainnet (chainId 143). Chog metadata snapshotted from `tokenURI` through Multicall3. Chog art cached through IPFS gateways with fallback. Source verified on Sourcify.

## GitHub repo

https://github.com/Dotman-Bei/Dybbo

## Judge access instructions

> Organizers only. Limit 8,000 characters (this text: 2,231). Plain text, ready to paste.

```text
No login, no invite and no Chog needed. Dybbo runs on Monad mainnet. You only need a Monad wallet (MetaMask, Rabby or similar) with about 0.1 MON. Network: Monad, chain ID 143, RPC https://rpc.monad.xyz. The app offers to add or switch the network for you.

THE FULL LOOP (about 3 minutes)

1. Open https://dybbo.vercel.app/judges, connect your wallet, and press "Possess #... for 1 minute" (a live open Chog). You can also pick any Chog from Browse.
   Expect: a fee of 0.01 MON paid into that Chog's escrow, plus about 0.04 MON of gas. You land on the session page with a running timer.

2. In the session, keep the random target, pick Boo, Slime or Hex, and press Haunt.
   Expect: "Confirmed" with a block number. Open the target's page and the mark is there, signed "by #..., possessed".

3. Press "Try to take it".
   Expect: the real Chog Genesis contract refuses with ERC721InsufficientApproval, and both approval reads show false or empty. This runs as a free simulation. "Send it for real" sends the transaction if you want it on MonadScan (a reverted transaction still pays gas on Monad).

4. Wait for the timer to end, then press "Try one more haunt".
   Expect: LeaseExpired.

5. Open https://dybbo.vercel.app/proof, enter the Chog you possessed, and press "Run the three checks".
   Expect: three passes, with a link to the verified source.

WHAT EACH RESULT PROVES

- ERC721InsufficientApproval: a possessor can never move, approve or list the Chog.
- LeaseExpired: control ends in the block the lease expires.
- NotOwner (press "Try to claim it" on any Chog you don't hold): the fee belongs only to whoever holds the Chog.
- OwnerChanged: control ends the moment the Chog changes hands. Seeing it live needs a holder to sell mid-lease, so it is covered by the fork test test_SaleMidLeaseRevertsOwnerChanged in the repo.

WITHOUT A WALLET

Every page is readable without connecting. https://dybbo.vercel.app/me?address=0x... shows any holder's Chogs, escrow and marks, read-only.

LINKS

App: https://dybbo.vercel.app
Contract: 0x908D8899795072985e35CB86dA3Aff88CE4e72e9 (source verified on Sourcify: https://repo.sourcify.dev/143/0x908D8899795072985e35CB86dA3Aff88CE4e72e9)
Code: https://github.com/Dotman-Bei/Dybbo
```

## Go-to-market

> Optional. Limit 8,000 characters.

- **Holders are paid by default.** Every Chog already earns; a holder only needs to open /me and claim. That gives each holder a reason to share their Chog's earnings and marks on X.
- **Possession nights during Chogtober.** Ask the Chog team to feature a night where the community possesses and haunts. Marks last 24 hours, so a night leaves the collection visibly haunted the next day.
- **Strike-backs bring people back.** A haunted holder sees who marked their Chog and can haunt back with it for free (gas only). That brings returning holders, not only one-off renters.
- **Other Chog apps can build on it.** A live lease is a public on-chain fact (`leaseOf`). Other Chog games could let a possessor play "as this Chog" for the lease's duration, so holder-gated games stop needing spectator modes. An SDK is out of scope for the hackathon.

## Plan

> Optional. Shows collapsed on the project page. Limit 8,000 characters (this text: 3,130). Plain text, ready to paste.

```text
WHO USES IT

Possessors. Monad users who don't own a Chog. About 982 people hold the 1,969 Chog Genesis, while Monad has more than 4.3 million wallets. A Chog costs around $122, so Dybbo lets them act as one without buying it. They pay 0.01 MON a minute by default for one to ten minutes.

Holders. Every holder is already a user, whether they know it or not. All 1,968 Chogs in wallets are open from the first block, so a holder's first contact with Dybbo is finding fees waiting for their Chog. They can claim, set their own price, or close their Chog, all from /me.

Haunted holders. When a mark lands on your Chog, its page shows which Chog left it. Holders haunt with their own Chogs for free (gas only), so being haunted turns into a reason to play.

Judges and spectators. Everything is readable without a wallet, and /me?address=0x... shows any holder's Chogs, escrow and marks.

HOW IT GROWS

1. Holders get paid without signing up. Each holder is one claim away from seeing their Chog earn. Earnings and marks are easy to share on X, and each share points other holders back to their own escrow.

2. Haunts spread through the collection. Every haunt lands on someone else's Chog, and that holder can answer. Marks last 24 hours, so a busy night leaves the collection visibly haunted the next day and gives people a reason to return.

3. Possession nights during Chogtober. We will ask the Chog team to feature community nights where people possess and haunt together. No setup is needed, since the whole collection is already open.

4. Other Chog apps can build on it. A live lease is public on chain (leaseOf). Any holder-gated Chog game can let a possessor play "as this Chog" for the lease's length, instead of a spectator mode. That makes every Chog app a way into Dybbo, and Dybbo a way into every Chog app.

WHERE WE ARE

The contract went live on Monad mainnet on 2026-10-22. Its counters are public through stats(). At the time of writing: 1 possession, 2 haunts, 1 possessor, 1 Chog possessed, 0.05 MON paid into escrow, 0 MON claimed. These are our own test runs, and we are reporting them as they are.

WHAT WE MEASURE

Distinct possessors, possessions per possessor (do people come back), haunts per lease, strike-backs (holders answering a haunt), share of fees claimed by holders, and distinct Chogs ever possessed. All of it is on chain, so anyone can check our numbers.

NEXT

- Notifications when your Chog is haunted, so strike-backs happen while it still matters.
- A strike-back shortcut in the activity feed.
- $CHOG as an optional fee currency, if the Chog team wants it. MON stays the default, since $CHOG liquidity is thin.
- A small SDK so other Chog apps can read and honour a live lease in a few lines.

HOW IT SUSTAINS ITSELF

Dybbo takes no fee. Every MON goes to holders, which is the point: holders earn by default, so nobody has a reason to opt out. The deployed contract has no owner, no pause and no upgrade, so its rules cannot change under anyone. If Dybbo outgrows a hackathon, any fee would come through a new contract that holders choose to use, never through a change to this one.
```

## What's next and usage

Usage is read from the contract (`stats()`) on 2026-10-22, after the first mainnet run:

| | |
|---|---|
| Possessions | 1 |
| Distinct possessors | 1 |
| Distinct Chogs possessed | 1 |
| Haunts | 2 |
| MON paid into escrow | 0.05 MON |
| MON claimed by holders | 0 MON (waiting for #1462's holder) |

Next:

- A holder strike-back flow in the feed.
- Notifications when your Chog is haunted.
- $CHOG as an optional fee currency, if the Chog team wants it.
- A small SDK so other Chog apps can honour a live lease.

---

Read the usage numbers:

```bash
cast call --rpc-url https://rpc.monad.xyz 0x908D8899795072985e35CB86dA3Aff88CE4e72e9 \
  "stats()(uint256,uint256,uint256,uint256,uint256,uint256)"
# possessions, haunts, paid (wei), claimed (wei), distinct possessors, distinct tokens
```
