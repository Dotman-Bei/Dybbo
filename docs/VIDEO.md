# Demo video script (under 3:00)

Judges score from this video, and novelty is 30% and the first tie-breaker. So the first 30 seconds show the three reverts and default-on earnings, not the word "rent" (PRD §16.2, §19).

**Setup before recording**

- Browser at 1440×900, zoom 100%, one tab, wallet extension pinned.
- A fresh wallet with about 0.3 MON on Monad mainnet (3 or 4 possessions plus haunts).
- Pick the Chog to possess: #1462 (token 1) if it is open, otherwise any open Chog from /chogs. Keep a second open Chog's number ready as the haunt target.
- Open three tabs in this order: `/chog/1?minutes=1`, `/proof`, and MonadScan on Chog Genesis' Read Contract tab (`isApprovedForAll`).
- Record at 1080p. Narration is optional; the on-screen captions below carry the story.

## 0:00 to 0:30, the demo moment

| Time | Screen | Caption / voice |
|---|---|---|
| 0:00 | Home, hero "Possess any Chog" | "You don't own a Chog. Possess one." |
| 0:03 | `/chog/1`: lease card, 1 minute, fee 0.01 MON, gas, total. Press **Possess for 1 min**, confirm in wallet | "0.01 MON to its holder. No approval asked." |
| 0:08 | Session page: timer running. Haunt panel → **Haunt #… with Boo** → "Confirmed" | "Haunt another Chog. The mark is signed by #1462, possessed." |
| 0:13 | Open the target's page: the mark beside its art | (no caption, let it land) |
| 0:16 | Back in the session: **Try to take it** → `ERC721InsufficientApproval` | "Try to take it. The real Chog Genesis says no." |
| 0:20 | MonadScan Read Contract: `isApprovedForAll(holder, Dybbo)` → false | "Dybbo never had approval." |
| 0:24 | Timer at 0:00 → **Try one more haunt** → `LeaseExpired` | "The lease ends in the block it expires." |
| 0:27 | `/chog/1` escrow card: 0.01 MON waiting; **Try to claim it** → `NotOwner` | "The fee waits for the holder, not for you." |

## 0:30 to 1:05, why this is new

| Time | Screen | Caption / voice |
|---|---|---|
| 0:30 | Split: a wallet `setApprovalForAll` prompt (a screenshot from any marketplace) next to the Bitquery headline on the 25,994-NFT approval sweep | "Lending an NFT today means giving a contract power over every NFT you hold." |
| 0:40 | `/proof`: the claim sentence, contract card (Admin none, Upgrade none, Fee 0%), "Every call to Chog Genesis: ownerOf" | "Dybbo has no such power. Its only call to Chog Genesis is ownerOf." |
| 0:50 | `/proof` → **Run the three checks** → three passes | "Anyone can check it. Free simulations against mainnet." |
| 0:58 | Verified source on Sourcify | "Source verified. No admin, no pause, no upgrade." |

## 1:05 to 1:45, holders earn by default

| Time | Screen | Caption / voice |
|---|---|---|
| 1:05 | `/chogs`: subline "1,968 open at 0.01 MON a minute" | "Every Chog in a wallet is open from the first block. Holders never signed up." |
| 1:15 | `/me?address=<a holder>`: escrow card, marks on their Chogs, **Strike back** | "Holders see what their Chog earned and who haunted it." |
| 1:25 | If a holder joins: **Claim all** → "Claimed to your wallet". Otherwise the escrow card plus the non-holder `NotOwner` revert | "The fee goes to whoever holds the Chog when they claim. It follows the token if it sells." |
| 1:35 | Token page, holder terms: price field, Open/Closed switch | "Holders can set a price or close their Chog at any time." |

## 1:45 to 2:20, why Monad, why Chog

| Time | Screen | Caption / voice |
|---|---|---|
| 1:45 | Session: possess, then haunt twice quickly; show the block numbers | "Every haunt re-checks ownerOf in the same transaction. Monad's 300 ms blocks make that playable." |
| 2:00 | Fork test output: `test_SaleMidLeaseRevertsOwnerChanged` passing | "Sell the Chog mid-lease and control ends in that block." |
| 2:10 | Home, "How a possession runs" bar | "Take the Chog out and nothing is left: it is the body, the payee and the off switch." |

## 2:20 to 2:50, try it

| Time | Screen | Caption / voice |
|---|---|---|
| 2:20 | `/judges`: steps and "0.1 MON covers every test" | "No Chog needed. 0.1 MON covers every test." |
| 2:30 | Home board "Open right now" and the activity it shows | Usage so far: {possessions} possessions, {haunts} haunts (from `stats()`) |
| 2:40 | Home CTA band **Possess** | "Dybbo. Possess any Chog." App URL on screen. |

Keep it under 2:55. Upload as unlisted on YouTube, or as a Google Drive link set to "anyone with the link: viewer".
