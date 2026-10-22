# Dybbo

**Possess any Chog Genesis for a few paid minutes. No approval, no custody. The fee waits in escrow for its holder.**

Live app: https://dybbo.vercel.app · Contract: `0x908D8899795072985e35CB86dA3Aff88CE4e72e9` on Monad mainnet (source verified on [Sourcify](https://repo.sourcify.dev/143/0x908D8899795072985e35CB86dA3Aff88CE4e72e9)) · Code: https://github.com/Dotman-Bei/Dybbo

---

## 1. The problem we found

Dybbo started with a pattern we kept running into while looking at what people build around Chog Genesis. Almost every Chog app is made for holders. Everyone else, which includes most of Monad and most hackathon judges, gets a spectator seat: a "guest" mode, a "practice" mode, a simulated judge column. Watching is free; playing needs a Chog.

That gap is large. Chog Genesis has 1,969 tokens held by roughly 982 owners, while Monad has more than 4.3 million wallets. A Chog costs around $122 at the floor, which is a lot to spend just to try an app once.

The obvious fix is to let holders lend their Chogs. But Chog Genesis has no rental role built in, so every existing way to lend an NFT asks the holder to give a contract power over it. They either send the NFT to an escrow, wrap it, or sign `setApprovalForAll`, which lets a contract move every NFT in the wallet. That power is exactly how NFTs get lost:

- Renters on reNFT could hijack rented tokens during the custody handoff (a confirmed high-severity finding, Code4rena 2024, issue #588).
- In one 2026 sweep, a single forgotten marketplace approval let one wallet take 25,994 NFTs from 3,033 wallets.

So holders sensibly refuse to lend, and the few rental designs that avoid approvals fall back to a server that "checks" the rental, which enforces nothing on chain and only covers Chogs whose holders signed up first.

The question we set out to answer: **can someone without a Chog really control one for a while, without the holder giving up anything?**

## 2. What we built and how it works

Dybbo is a Monad contract and a web app. The name comes from the dybbuk, a spirit in folklore that borrows a living body for a while and leaves when it is driven out. That is the whole product in one image.

### The loop

1. **Possess.** Pick any Chog and pay its price per minute (0.01 MON by default) for 1 to 10 minutes. The full fee goes into that Chog's escrow. The NFT never moves. A possession is only a record inside the Dybbo contract: who possesses which Chog, until when, and who owned it when the lease started.
2. **Haunt.** While the timer runs, you act as that Chog. You leave one of three marks (Boo, Slime or Hex) on another Chog. The mark appears beside the target's art on its public page for 24 hours, signed "by #1462, possessed". The rules keep it from turning into spam: one haunt every 15 seconds, one mark per target per day, eight live marks per Chog. The Chog's own metadata and image never change.
3. **Strike back.** Holders can haunt with their own Chogs at any time, with no lease. A holder whose Chog was haunted can answer from the same page.
4. **Claim.** Whoever holds the Chog at the moment they claim takes its escrow. Holders never sign up. Every Chog in a wallet is open from the first block and earns by default. A holder can set their own price or close their Chog to new possessions.

### Under the hood

The contract's only interaction with Chog Genesis is reading `ownerOf`. It has no code path that could approve or transfer a Chog, and a test scans the deployed bytecode for any approve or transfer selector to prove it.

Every action re-reads `ownerOf` inside the same transaction. A lease is live only while two things are true: the time has not run out, and the Chog is still owned by the wallet that owned it when the lease began. So control ends in the exact block the lease expires (`LeaseExpired`) or the block the Chog changes hands (`OwnerChanged`). No server re-checks anything, and nothing has to be revoked afterwards.

Escrow is keyed to the token, not the person. `claim` pays out only to the token's current `ownerOf`, so the fee follows the Chog. If a holder sells, the buyer can claim what the Chog earned before the sale, and the app shows this on the token's page before anyone buys.

Two edge cases shaped the rules:

- **Chogs held by contracts start closed.** A contract that holds and lends Chogs could let someone borrow one for a single block just to drain its escrow, the trick once used to claim 60,564 APE with five borrowed apes. Wallets with smart-account (EIP-7702) code count as normal wallets, which keeps 1,968 of the 1,969 Chogs open on day one.
- **No refunds and no admin.** Leases are short and the terms are shown before payment. The contract has no owner, no pause, no upgrade and no protocol fee. The builder has no function that can touch escrowed MON.

### Proof you can run yourself

The app does not ask anyone to trust these claims. During a possession, "Try to take it" asks the real Chog Genesis contract to transfer the Chog to the possessor, and it refuses with `ERC721InsufficientApproval`. The app shows the approval reads next to it: approved for all is `false`, and the approved address is empty. When the timer ends, "Try one more haunt" reverts with `LeaseExpired`. The `/proof` page runs all three checks as free simulations against mainnet, and the `/judges` page walks through the whole loop with about 0.1 MON and no Chog.

## 3. What makes it new

Every existing way to lend an NFT gives a contract power to move it: an escrow takes custody, a wrapper takes custody, an approval grants the right to transfer. Dybbo lends control without transferring any power over the NFT. The possessor gets a role inside Dybbo, enforced by Dybbo, and the Chog stays in its holder's wallet the entire time.

Three things follow from that, and together they are what we have not seen elsewhere:

- **Enforcement at every action, on chain.** Ownership is checked inside each transaction, not by a server on a timer. A sale or an expiry takes effect in the next block.
- **Open by default.** Holders do not opt in, list or sign anything. The whole collection is possessable from the first block, and every holder earns without knowing Dybbo exists until they find fees waiting.
- **Fees that belong to the token.** Escrow follows the Chog through sales, so a Chog's earnings are part of the Chog.

This only works because Monad makes per-action checks cheap and fast. Each haunt is its own transaction, with 300 ms blocks, sub-second finality and sub-cent fees. On a slower or more expensive chain, the honest choice would be a server that re-checks ownership now and then, and that is exactly the weakness Dybbo avoids.

## 4. A new way to interact with NFTs

Yes. Today you can interact with an NFT in two ways: own it, or look at it. Dybbo adds a third: **temporarily become it.**

For the length of a lease, the possessor acts as that Chog, and other people see the result. A mark signed "by #1462, possessed" is a public statement made by a Chog that someone else owns, with the owner's consent built in by default and paid for in advance.

This also turns the NFT into an income source without a marketplace listing. A holder does not rent the Chog out; the Chog earns while sitting in the wallet. It also gives other apps something to build on. A live lease is public data on chain (`leaseOf`), so any holder-gated Chog game could let a possessor play "as this Chog" for the lease's duration, instead of offering a spectator mode.

## 5. Why the Chog NFT is essential

Take the Chog out of Dybbo and nothing is left. The NFT plays three roles that no other part of the system can replace:

- **The body.** It is the thing being possessed. Without it there is nothing to control and no identity to act under.
- **The payee.** Escrow is keyed to the token ID and claimable only by its current `ownerOf`. Without the NFT there is no one to pay.
- **The off switch.** A lease is void the moment `ownerOf` changes. Without the NFT there is no event that ends control on a sale.

There is also a reason the Chog fits beyond the mechanics. Chog's own lore describes a curious, mischievous kid who causes chaos. Dybbo lets anyone become that kid for a few minutes and leave a little chaos behind on the collection, which is about as close to playing the character as an NFT allows.

## 6. Will people come back?

Dybbo is built around reasons to return rather than a single visit:

- **Being haunted pulls holders back.** A mark appears on your Chog's public page with the Chog that left it. Answering is free apart from gas, because holders haunt with their own Chogs without a lease. Each strike-back can start another.
- **Marks expire.** Every mark lasts 24 hours, so a Chog that wants to stay visibly haunted, or a holder who wants the last word, has to come back.
- **Fees keep accruing.** Holders earn whenever someone possesses their Chog, so they have a reason to return and claim, and to share what their Chog earned.
- **Leases are short by design.** One to ten minutes is long enough to play and short enough to do again with a different Chog. Possessors can hold several leases at once.
- **Shared moments.** During Chogtober, a community "possession night" leaves the collection marked for the whole next day, which gives people something to look at and respond to.

What we cannot claim yet is proven retention. The contract went live on 2026-10-22, and its on-chain counters (possessions, haunts, distinct possessors, fees paid and claimed) are public through `stats()`. Those counters are how we will measure whether people come back, rather than relying on our own expectations.

---

### At a glance

| | |
|---|---|
| Network | Monad mainnet (chain ID 143) |
| Collection | Chog Genesis, `0xc96d31F8626c6D03Fae5dCD3d61e3FB9F4a73763`, 1,969 tokens |
| Dybbo contract | `0x908D8899795072985e35CB86dA3Aff88CE4e72e9`, verified on Sourcify |
| Lease | 1 to 10 minutes; 0.01 MON a minute by default; holders can set 0.001 to 1 MON or close |
| Haunts | Boo, Slime, Hex; one every 15 s; one per target per day; 8 live marks per Chog; 24 h each |
| Tests | 53 Foundry unit tests and 3 fork tests against the real Chog Genesis |
| Stack | Solidity 0.8.30 and Foundry; Next.js, viem and wagmi |
