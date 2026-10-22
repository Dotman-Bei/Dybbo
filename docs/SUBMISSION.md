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

## Demo video

{VIDEO_URL} (script: [VIDEO.md](VIDEO.md))

## App link

https://dybbo.vercel.app

## Tech stack

Solidity 0.8.30 and Foundry (unit, fuzz and fork tests; gas measured on Monad with `eth_estimateGas` state overrides). Next.js 16 (App Router, TypeScript), viem and wagmi on Monad mainnet (chainId 143). Chog metadata snapshotted from `tokenURI` through Multicall3. Chog art cached through IPFS gateways with fallback. Source verified on Sourcify.

## GitHub repo

https://github.com/Dotman-Bei/Dybbo

## Judge access instructions

> Organizers only. Limit 8,000 characters.

No Chog needed. Use any Monad mainnet wallet with about 0.1 MON (chainId 143, RPC https://rpc.monad.xyz).

1. Open https://dybbo.vercel.app/judges and press "Possess #… for 1 minute" (a live open Chog), or open any Chog from Browse.
   - Expect: a fee of 0.01 MON to the holder plus about 0.04 MON of gas, then the session page with a running timer.
2. In the session, keep the random target, pick Boo, Slime or Hex, press Haunt.
   - Expect: "Confirmed" with a block number, and the mark on the target's page signed "by #…, possessed".
3. Press "Try to take it".
   - Expect: the real Chog Genesis reverts `ERC721InsufficientApproval`, and both approval reads say false or zero. It runs as a free simulation; "Send it for real" sends the transaction (a revert still pays gas on Monad).
4. Wait for the timer, then press "Try one more haunt".
   - Expect: `LeaseExpired`.
5. Open https://dybbo.vercel.app/proof, enter the Chog you possessed, and press "Run the three checks".
   - Expect: three passes. Then open the verified source.

What each revert proves:

- `ERC721InsufficientApproval`: a possessor can never move, approve or list the Chog.
- `LeaseExpired`: control ends in the block the lease expires.
- `OwnerChanged`: control ends when the Chog changes hands. A holder must sell to see it live, so it is shown in the fork test `test_SaleMidLeaseRevertsOwnerChanged`.
- `NotOwner` on claim: the fee belongs to whoever holds the Chog.

Without a wallet, every page is readable, and /me?address=0x… shows any holder's Chogs, escrow and marks read-only.

## Go-to-market

> Optional. Limit 8,000 characters.

- **Holders are paid by default.** Every Chog already earns; a holder only needs to open /me and claim. That gives each holder a reason to share their Chog's earnings and marks on X.
- **Possession nights during Chogtober.** Ask the Chog team to feature a night where the community possesses and haunts. Marks last 24 hours, so a night leaves the collection visibly haunted the next day.
- **Strike-backs bring people back.** A haunted holder sees who marked their Chog and can haunt back with it for free (gas only). That brings returning holders, not only one-off renters.
- **Other Chog apps can build on it.** A live lease is a public on-chain fact (`leaseOf`). Other Chog games could let a possessor play "as this Chog" for the lease's duration, so holder-gated games stop needing spectator modes. An SDK is out of scope for the hackathon.

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
