# Dybbo

**Possess any Chog Genesis for a few paid minutes on Monad. No approval, no custody. The fee waits in escrow for its holder.**

> A possessor can never move, approve or list the Chog they control, and their control ends in the block the lease expires or the Chog changes hands.

**Live app: https://dybbo.vercel.app**

Built solo for [Chogathon 2026](https://chogathon.chog.xyz/). Unofficial community project; Chog art is shown with permission and never altered.

## Try it without a Chog

1. Open [dybbo.vercel.app](https://dybbo.vercel.app), pick any open Chog (or press **Possess a random Chog**).
2. Possess it for 1 minute: 0.01 MON to its holder, plus about 0.04 MON of gas.
3. Haunt another Chog with Boo, Slime or Hex. The mark shows on that Chog's page for 24 hours, signed "by #…, possessed".
4. Press **Try to take it**. The real Chog Genesis contract refuses: `ERC721InsufficientApproval`.
5. When the timer ends, press **Try one more haunt**: `LeaseExpired`.

A wallet with 0.1 MON covers every step. The full guide is [dybbo.vercel.app/judges](https://dybbo.vercel.app/judges).

## The contract

| | |
|---|---|
| Dybbo, Monad mainnet | [`0x908D8899795072985e35CB86dA3Aff88CE4e72e9`](https://monadscan.com/address/0x908D8899795072985e35CB86dA3Aff88CE4e72e9) |
| Verified source | [Sourcify, exact match](https://repo.sourcify.dev/143/0x908D8899795072985e35CB86dA3Aff88CE4e72e9) |
| Chog Genesis | [`0xc96d31F8626c6D03Fae5dCD3d61e3FB9F4a73763`](https://monadscan.com/address/0xc96d31F8626c6D03Fae5dCD3d61e3FB9F4a73763) |
| Admin, pause, upgrade, protocol fee | None |
| Calls to Chog Genesis | `ownerOf` only (plus the holder's code size) |

**The three reverts a judge can trigger,** each also runnable for free on [dybbo.vercel.app/proof](https://dybbo.vercel.app/proof):

| Try | Result | Proves |
|---|---|---|
| Move the Chog you possess | Chog Genesis reverts `ERC721InsufficientApproval` | A possessor can never move, approve or list it |
| Haunt after the timer | Dybbo reverts `LeaseExpired` | Control ends in the block the lease expires |
| Claim the fee as a non-holder | Dybbo reverts `NotOwner` | The fee belongs to whoever holds the Chog |

A sale mid-lease ends control too (`OwnerChanged`); the fork tests show it against the real Chog Genesis.

## How it works

- **Possess.** Anyone pays `price × minutes` (1 to 10 minutes) for a Chog. The whole fee goes into that token's escrow. Dybbo records the lease; the NFT never moves.
- **Haunt.** While the lease is live, the possessor leaves one of three marks on another open Chog: one every 15 seconds, one per target per day, eight live marks per Chog for 24 hours. Holders can haunt with their own Chog without a lease, so a haunted holder can strike back.
- **Claim.** Whoever holds the Chog when they claim takes its escrow. Unclaimed fees follow the token to a buyer.
- **Every action checks `ownerOf`** in the same call, so a lease is void the moment the Chog changes hands.
- **Default open.** Every Chog in a wallet, including EIP-7702 smart-account wallets, is open at 0.01 MON a minute from the first block. Chogs held by contracts (vaults, pools, Safes) start closed, so nobody can borrow one for a block to drain its escrow. Holders can set their own price or close their Chog.

## Repository

| Folder | What |
|---|---|
| [`contracts/`](contracts/) | Foundry: the contract, 53 unit tests, 3 fork tests against mainnet, gas measured on Monad, deploy script |
| [`web/`](web/) | Next.js app: home, browse, token, session console, holder dashboard, the claim, judge guide |
| [`docs/FRONTEND.md`](docs/FRONTEND.md) | Frontend spec: audience, direction, palette, every page's copy |
| [`prd.md`](prd.md) | Product requirements |

## Run it

```bash
# contracts
cd contracts
forge test                         # 53 unit tests
FOUNDRY_PROFILE=fork forge test    # fork tests against the real Chog Genesis (~10 min)
node script/measure-gas.mjs        # gas measured on Monad mainnet with state overrides

# app
cd web
cp .env.example .env.local         # points at the mainnet contract
npm install
npm run dev
```

Without `NEXT_PUBLIC_DYBBO_ADDRESS` the app runs in preview mode: leases and marks are simulated in the browser under the same rules, while Chogs, owners and art stay real.

## Gas on Monad

Measured on mainnet with state overrides (`contracts/gas/monad-gas.json`): possess 341k, haunt ~272k, claim 155k, setTerms 72k gas on fresh storage. Monad charges the gas limit, so the app sets the limit to the estimate × 1.2.

## Pre-existing work

None. Everything here was built during Chogathon 2026.
