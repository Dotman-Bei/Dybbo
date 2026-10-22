# Chogathon 2026 submission

Fields of the submission form (PRD §2.5), ready to paste. One value is still to fill:

- `{VIDEO_URL}`: the unlisted YouTube or Google Drive link to the demo video

Usage numbers under "What's next" are read from the contract's `stats()` just before submitting (command at the end).

---

## Project name

Dybbo

## Description

> Paste from here to the end of this section. Limit 8,000 characters.

**Possess any Chog Genesis for a few paid minutes. No approval, no custody. The fee waits in escrow for its holder.**

*A possessor can never move, approve or list the Chog they control, and their control ends in the block the lease expires or the Chog changes hands.*

**What it does**

Most Chog apps are for holders. A judge or a Monad user without a ~$122 Chog gets a spectator or "guest" mode. Dybbo lets anyone take control of any Chog Genesis for 1 to 10 minutes:

- **Possess.** Pay the Chog's price per minute (0.01 MON by default). The whole fee goes into that token's escrow. The NFT never moves: a possession is a record inside the Dybbo contract.
- **Haunt.** While the lease is live, act as that Chog: leave Boo, Slime or Hex on another Chog. The mark sits beside the target's art for 24 hours, signed "by #1462, possessed". One every 15 seconds, one per target per day, eight live marks per Chog.
- **Strike back.** Holders haunt with their own Chog, no lease needed, so a haunted holder has a reason to come back.
- **Claim.** Whoever holds the Chog when they claim takes its escrow. Holders never sign up: every Chog in a wallet is open from the first block and earns by default. They can set their own price or close it.

**What is new**

Lending an NFT today means `setApprovalForAll`, an escrow, or a wrapper. Each gives a contract power to move the NFT. That power is how renters hijacked reNFT rentals (Code4rena 2024, issue #588), and how one forgotten approval let a sweep take 25,994 NFTs from 3,033 wallets in 2026. The one rental-like Chogathon entry we found relies on holder-signed hires checked by a server, so nothing is enforced on chain and only opted-in Chogs are available.

Dybbo takes a different path:

- **No custody and no approval, ever.** The contract's only call to Chog Genesis is `ownerOf`. A test scans its bytecode for any approve or transfer selector and finds none.
- **Enforced at every action.** Each haunt re-reads `ownerOf` in the same call. A lease ends in the block it expires (`LeaseExpired`) or the block the Chog changes hands (`OwnerChanged`). No server re-checks anything.
- **Open by default.** All 1,968 Chogs in wallets, including EIP-7702 smart-account wallets, are possessable on day one, and every holder earns without signing up. The one Chog held by a contract starts closed, so nobody can borrow a Chog for a block to drain its escrow (the trick used to claim 60,564 APE with borrowed apes).
- **Unclaimed fees follow the token.** A buyer can claim what the Chog earned before the sale.

**Why Chog matters**

Take the NFT out and nothing is left. The Chog is:

- **the body** being possessed,
- **the payee**, since the escrow is keyed to the token and claimable only by its current `ownerOf`,
- **the off switch**, since a lease is void the moment `ownerOf` changes.

It is also Chog's lore made playable. Anyone can become the curious, mischievous kid who causes chaos.

**Why Monad**

Every haunt is its own transaction with `ownerOf` read inside it, so a sale or an expiry takes effect on the next block. That needs Monad's 300 ms blocks, 600 ms finality and sub-cent fees. On a slower chain, or on a server, ownership would be re-checked on a timer.

**Test it without a Chog**

Open https://dybbo.vercel.app/judges. A wallet with 0.1 MON covers every step: possess for 1 minute, haunt once, press "Try to take it" (the real Chog Genesis reverts `ERC721InsufficientApproval`), then haunt again after the timer (`LeaseExpired`). The /proof page runs the three checks as free simulations against mainnet.

**Contract**

- Dybbo on Monad mainnet: `0x908D8899795072985e35CB86dA3Aff88CE4e72e9`
- Source verified on Sourcify (exact match): https://repo.sourcify.dev/143/0x908D8899795072985e35CB86dA3Aff88CE4e72e9
- No admin, no pause, no upgrade, no protocol fee.
- 53 Foundry unit tests and 3 fork tests against the real Chog Genesis on a Monad fork.
- Gas was measured on Monad itself with state overrides.

**Pre-existing work:** none.

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

Usage is read from the contract (`stats()`) on {DATE}:

| | |
|---|---|
| Possessions | {POSSESSIONS} |
| Distinct possessors | {POSSESSORS} |
| Distinct Chogs possessed | {TOKENS} |
| Haunts | {HAUNTS} |
| MON paid into escrow | {PAID} |
| MON claimed by holders | {CLAIMED} |

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
