# Dybbo — Frontend spec

| | |
|---|---|
| Source | `prd.md` (2026-10-21), sections 1, 6, 7, 10, 11, 14 |
| Skill | `design-taste-frontend` (tasteskill v2) |
| Home direction | **Loud and flat** (`loud-flat-poster`, seed 636788756), `.taste-skill/direction.json` |
| App style | **Pastel consumer** (`pastel-consumer`, seed 686923588), palette and type kept from the home direction, `.taste-skill/app/direction.json` |
| Stack | Next.js (App Router, TypeScript), plain CSS with tokens, viem + wagmi on Monad (chainId 143) |

The home page (`/`) is a **page**: it is read and scrolled, and it follows the page rules. Every other route is an **app screen**: it is worked in, and it follows the app-screen rules. Both share one palette family and one typeface.

---

## 1. Who it is for, and the one action per page

**Primary: the possessor.** A Monad user or a Chogathon judge who does not own a ~$122 Chog. They know wallets and MON; they do not know Dybbo. They want to play with a real Chog now, and they need to believe in one screen that paying a stranger's NFT a few cents cannot go wrong for either side.

**Secondary: the holder.** One of ~982 Chog owners. They never signed up. They arrive from a link or a haunt, want to see what their Chog earned and who marked it, and want to claim, price, close or strike back.

**Also:** judges with five minutes and a checklist; spectators with no wallet.

| Route | Kind | The one action it drives |
|---|---|---|
| `/` | Page | **Possess a random Chog** |
| `/chogs` | App: list | Open a Chog (primary shortcut: possess a random one) |
| `/chog/[id]` | App: detail | **Possess this Chog** (holders: claim) |
| `/possess/[id]` | App: console | **Haunt** a target before the timer ends |
| `/me` | App: wallet | **Claim all** |
| `/me/possessions` | App: list | Resume the active session |
| `/proof` | App: report | Run the three checks |
| `/judges` | App: report | Start the suggested one-minute possession |
| `/about` | App: report | Read the rules (no action; links to `/chogs`) |
| `/404`, error | App | Go to `/chogs` / Retry |

---

## 2. Visual direction

### 2.1 Thesis

**Possession is a short, loud, rule-bound thing.** The home page says it like a street poster for Chogtober: flat orange, black type at full volume, a real Chog cut and tilted over the headline. The app screens are the quiet ticket office behind the poster: white cards, one large radius, pale status tints, and a single orange bar that is always the lease running out.

**The idea (competitor-tested):** *On this page, the lease (one Chog, a number of minutes, a fee that goes to its holder, a timer that ends in one block) becomes the poster's one control and the app's one bar.* Another Chog app cannot sign this: no other entry has a per-minute lease enforced at every action.

**The live thing:** on the home page, a minutes slider sets the real fee for a real open Chog (`0.01 MON × minutes`, paid in full to that Chog's escrow); the giant figure and the "Possess" band below it both follow the slider. Without script it shows 5 minutes and 0.05 MON and the band links to `/chogs`.

### 2.2 Palette

**Two colours: Chogtober orange and near-black.** White surfaces carry the app screens. The Chog art is the only multicolour thing on any page; Dybbo's own chrome never competes with it. (Revised after review: the first build's sky, lime and crimson fields read as a colour riot next to the art.)

**Home page fields** (flat, full strength, hard cuts; sections alternate orange and near-black):

| Role | Value | Use |
|---|---|---|
| orange | `#ff8126` | Hero, try to take it, leave a mark, before you pay, footer menu half |
| orange step | `#ff9a52` | Tiles and FAQ rows on orange |
| near-black | `#161615`, ink `#f2f2f2` | How a possession runs, the board, the slider, the CTA band |
| near-black step | `#242422` | Board rows |
| ink | `#111111` | Text on orange; buttons (ink fill, orange label) |
| orange deep | `#7a3300` | Hover ink on orange only |

Orange on near-black carries the accents: the stage bar's segments, the fee figure, the slider thumb, the CTA word, the open board row.

**App screens** (pastel consumer, colour budget held to the lease):

| Role | Value |
|---|---|
| `--ground` | `#f6f6f4` |
| `--surface` (cards) | `#ffffff` |
| `--raised` (wells) | `#f3f3f1` |
| `--active` (selected nav, selected row) | `#ececea` |
| `--border` / `--rule` / `--control` | `#e8e8e6` / `#f1f1ef` / `#d1d5db` |
| `--text` / `--muted` / `--faint` | `#111111` / `#5f6368` / `#6b6b6b` |
| primary button | `#111111`, label `#ffffff` (one per screen) |
| secondary button | white, 1px `#d1d5db` |
| `--data` (the lease bar) | `#e8650d` |
| `--positive` / `--negative` | pills `#dcfae5`/`#04250e` ("Confirmed") and `#ffedea`/`#831c1e` (reverts) only |
| notice | `#f3f3f1`, border `#e8e8e6`, text `#3d3d3d` |

Status, one hue at three intensities:

| Status | Fill | Ink |
|---|---|---|
| Open | `#ffe9d6` | `#7a3300` |
| Possessed | `#111111` | `#ff8126` |
| Closed | `#ececea` | `#3d3d3d` |

The three marks are flat glyphs with a 2px `#111111` outline, told apart by shape: **Boo** a white sheet, **Slime** a black drip, **Hex** an orange disc with a black spiral. Their chips are neutral `#f1f1ef` with ink text.

No other hue in Dybbo's own chrome (Chog art brings its own), no gradient, no glow, no cream ground.

### 2.3 Type

One family: **Chillax** (Fontshare), weights 400, 500, 600, 700. A second face only on app screens and only for IDs: wallet addresses and transaction hashes in `ui-monospace, "Cascadia Mono", Menlo, monospace` at body size, truncated (`0x3d38…e7e0`).

Home page, five sizes:

| Step | Size | Setting |
|---|---|---|
| Display | `clamp(64px, 12.5vw, 200px)` (phone 17vw) | 700, tracking −0.05em, leading 0.86 |
| Head | `clamp(2rem, 1.3rem + 3.2vw, 4rem)`; section headings up to `6.4vw` where the blueprint asks | 600, −0.03em, leading 1.0 |
| Lead | `clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem)` | 500 |
| Body | `clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem)` | 400, leading 1.5 |
| Small | `clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem)` | 500 |

App screens: 12 / 14 / 16 / 24 / 36. Title 24/600; card titles 16/600; body and cells 14/400 (16 on phones); labels 12/500 grey; the one answer figure per screen 36/600 (the countdown on `/possess`, total escrow on `/me`). Tabular figures on every number; if Chillax's `tnum` does not change digit widths, the countdown uses fixed-width digit cells.

### 2.4 Spacing

4px base: **4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160**.

- Home: outer margins 24px desktop, 16px phone; sections are full-bleed panels that meet edge to edge, with 128–160px of padding top and bottom on desktop, 64–96px on phones. Gaps inside a section never exceed half the section padding.
- App: canvas centred at 1200px max with 24px side padding (16px phone); one gutter of 16px everywhere (cards, grid, rows of controls); card padding 20px; card radius 20, inner 10 / 8 / 5; controls 36px tall (44px on phones), full pill.
- Grid arithmetic (desktop, 1200 content): 12 × 86 + 11 × 16 = 1,208 → content 1,152 inside 24px padding at 1200; two-up split `760 + 16 + 376 = 1,152`.

### 2.5 Motion

Tokens: `--ease-out cubic-bezier(.22,1,.36,1)`, `--ease-expo cubic-bezier(.16,1,.3,1)`, `--ease-in-out cubic-bezier(.76,0,.24,1)`; press 140ms, hover 180ms, UI 240ms, reveal 800ms.

Home page:
1. **Signature: masked headline.** Each line of "Possess / any Chog" rises from behind its baseline, 900ms, second line 110ms later; the sentence and the button fade up together at 420ms. Settled by 1.2s.
2. **Section entrances:** heading, then text, then picture or board, staggered 70ms, rising 24px, once, fired at 88% of the viewport.
3. **Feedback:** every button, link, tile and FAQ tile has press (scale 0.97), hover (colour swap) and a visible focus ring (3px `#111` outline, 3px offset).
4. **One moving picture:** the hero Chog drifts 6% upward as the hero scrolls away (scroll timeline, linear).
5. The CTA band swaps field and word colours instantly on hover/focus.

App screens: no entrances. Motion is feedback only: press, hover, focus, a menu sheet sliding 240ms, a new mark row arriving (fade 240ms), the lease bar shrinking linearly in real time, a revert result appearing.

Everything moves only `transform`, `opacity`, `clip-path`. Under `prefers-reduced-motion: reduce` the finished state shows at once; the lease bar still updates (it is data), without easing.

---

## 3. Pages and sections, in build order

Copy below is final unless marked *sample*. Numbers in copy come from PRD constants (`DEFAULT_PRICE 0.01 MON/min`, 1–10 minutes, `HAUNT_COOLDOWN 15 s`, `MARK_TTL 24 h`, 8 marks per Chog, 1,969 Chogs) and are read from config, never typed twice.

### 3.1 `/` Home (page)

**Navigation** (no bar, 24px margins): wordmark `Dybbo` top-left; `Chogs`, `Proof`, `Judges`, `About` top-right at 15px. Phone: wordmark and `Menu`.

**1. Hero** — orange field, one screen.
- `h1`, two authored lines, first flush left, second flush right: **Possess** / **any Chog**
- A real Chog image (#1462, square art), hard-cropped to a blunt polygon, tilted 4°, overlapping the second line from the bottom right, about 34% of the width.
- Supporting sentence (bottom-left, lead size): **Control a Chog Genesis you don't own for up to ten minutes. No approval, no custody. The fee waits for its holder.**
- Action (bottom-right, square, ink with an orange label): **Possess a random Chog**
- Caption under the image, small: **CHOG #1462 · open at 0.01 MON a minute** (status from data; "closed" or "possessed until 14:05" when true).

**2. How a possession runs** — near-black field. The "stages as one bar" blueprint.
- `h2`: **How a possession runs**
- One bar of four flat orange segments with 6px gaps, widths from true durations with a 12 % floor:

| Width | Duration (in the segment) | Clause (under it) |
|---|---|---|
| 12 % | Under a second | First, you pay and the lease starts in the next block. |
| 52 % | Up to ten minutes | Then you haunt other Chogs, one mark every 15 seconds. |
| 12 % | One block | Then the lease ends. Your next haunt reverts. |
| 24 % | Whenever they like | Last, the holder claims the fee. They never signed up. |

**3. Try to take it** — orange field. "Large marks on tiles" blueprint, four across, two rows.
- Heading tile (near-black, double width): `h2` **Try to take it** and the claim: **A possessor can never move, approve or list the Chog they control.**
- Six tiles, each a short name at 28–32px and one line at body size:
  - **Move it** — Reverts. Nobody approved Dybbo or you.
  - **List it** — Nothing to list with. There is no approval.
  - **Outstay the timer** — Your next haunt reverts with LeaseExpired.
  - **Keep it after a sale** — Control ends in the block the Chog changes hands.
  - **Take its fee** — Reverts with NotOwner. Only the holder can claim.
  - **Ask the builder** — No admin, no pause, no upgrade, no fee.
- Under the board, a plain link: **Run the three checks yourself** → `/proof`

**4. Open right now** — near-black band. "Rows as a board" blueprint (departure board), `data-ui`.
- `h2`: **Open right now**
- Nine rows of real Chogs from the metadata snapshot with live status: name (`CHOG #1462`), Tier, Background, price (`0.01 MON/min`), status block (`Open` orange / `Possessed` light / `Closed` grey). Rows read from `recentActivity()` once the contract has activity; until then, from open Chogs.
- The fourth row is open (orange, 216px): the Chog's image at 168px, its traits in two lines, and **Possess #1462** linking to its page. Clicking another row opens it instead.
- The first and last rows are cut in half by the section edges.

**5. Leave a mark** — orange field.
- Left (7 columns): a public Chog card fragment (`data-ui`), the art as-is, and beside it its live marks list: *sample* — **Boo by #1462, possessed · 2 min ago**, **Slime by #311 · 40 min ago**, **Hex by #1462, possessed · 3 h ago**.
- Right (5 columns): `h2` **Leave a mark**; body: **While you possess a Chog you can haunt any open Chog with one of three marks. A mark sits beside its target's art for 24 hours, signed with the Chog that left it. Holders strike back with their own Chog, no lease needed.**
- The three marks as glyphs at 96px with their names: **Boo**, **Slime**, **Hex**, and the limits in one line: **One mark every 15 seconds. One per target per day. Eight live marks per Chog.**

**6. How long do you want it?** — near-black field, the figure in orange. "Figure set by a slider" blueprint. The live thing.
- `h2` (top-left, 36–44px): **How long do you want it?**
- Control (`data-ui`, 400px): label **Minutes on #1462**, a slider 1–10, preset 5, value shown (`5 min`).
- Figure, bottom-left, `clamp(140px, 19vw, 320px)`, tabular: **0.05** with unit **MON**.
- Working-out, bottom-right on the figure's baseline: **0.01 MON a minute × 5 minutes, paid in full into #1462's escrow. Dybbo keeps nothing.**

**7. Before you pay** — orange field, the open tile near-black. "Accordion of filled tiles": sticky heading left, `<details name="faq">` tiles right.
- `h2`: **Before you pay**
- Tiles:
  1. **Can a possessor steal the Chog?** — No. Dybbo never asks for an approval and has no code that calls approve or transfer on Chog Genesis. A possession is a record inside Dybbo; the NFT never moves.
  2. **Where does my fee go?** — All of it goes into that Chog's escrow. Whoever holds the Chog when they claim takes it. Dybbo charges no fee and has no admin.
  3. **What if the Chog is sold while I hold it?** — Your control ends in the block it changes hands, and the next haunt reverts with OwnerChanged. There are no refunds: leases last ten minutes at most, and the terms are shown before you pay.
  4. **I hold a Chog. Did I agree to this?** — Every Chog in a regular wallet is open at 0.01 MON a minute from the first block, so it earns without a sign-up. You can set your own price or close it at any time from My Chogs.
  5. **Why is this Chog closed?** — Chogs held by contracts, such as vaults, marketplaces, Safes and EIP-7702 wallets, start closed, so nobody can borrow one for a block to drain its escrow. The holder can open it.
  6. **Do marks change my NFT?** — No. Marks are Dybbo data shown beside the art. The image and metadata never change, and every mark is gone after 24 hours.
  7. **What happens to unclaimed fees after a sale?** — They stay with the token, so the buyer can claim them. Prices and opt-outs do not carry over: the buyer starts on the defaults.
  8. **Is this made by the Chog team?** — No. Dybbo is an unofficial community project built for Chogathon 2026. Chog art is shown with permission and never altered.

**8. Possess** — near-black band, orange word, the whole band is one link. "One word is the button".
- Word: **Possess** (24–30vw).
- Sentence top-left: **Start a 5-minute lease on a random open Chog.** (minutes follow the slider)
- Arrow, top-right, 48px.

**9. Footer** — split, one screen. Left half: a second real Chog image cropped very close. Right half, orange field:
- Wordmark `Dybbo`; menu at ~2.6vw: **Chogs**, **My Chogs**, **My possessions**, **The claim**, **Judge guide**, **About**
- Two blocks at 15px: **Built for Chogathon 2026 by one builder. Source on GitHub.** / **Chog Discord · chog.xyz**
- Legal line: **Unofficial community project. Chog art © ChogLabs, shown with permission and never altered. Dybbo never asks for an NFT approval.**

### 3.2 App shell (built with `/chogs`)

Archetype **no sidebar** (top bar over a centred column; the dealt icon rail is replaced, see §6).
- Top bar 56px on the ground: Dybbo mark (a flat orange disc with a black possession notch) + `Dybbo`; links `Chogs`, `My Chogs`, `Possessions`, `Proof`, `Judges`; right: network (`Monad`) and the wallet button (`Connect wallet` / `0x3d38…e7e0 · 12.40 MON`).
- Active link: a neutral grey pill `#ececea`, label unchanged.
- Preview notice (only while no Dybbo address is configured), under the bar, notice colours: **Preview: the Dybbo contract is not on mainnet yet. Leases and marks here are simulated in this browser. Chogs, owners and art are real.**
- Phone: 48px bar with mark, the screen's name and `Menu`; the menu opens a full-screen sheet with the links, the wallet and the network.

### 3.3 `/chogs` Browse

- Question: **Which Chog can I possess right now?**
- `h1` **Chogs**; subline computed: **1,969 Chog Genesis · 1,9xx open at 0.01 MON a minute · 0 possessed**
- Title-row action (primary): **Possess a random Chog**
- Filter row (36px controls): search **Go to #** (number field 1–1969); status segmented **All / Open / Possessed / Closed**; **Tier**, **Background**, **Head**, **Eyes** selects; **Price** select (**Any / Default 0.01 / Custom**). Sort: **Number / Price / Escrow**.
- Count: **Showing 1–60 of 1,969** (recomputed for the filter).
- Grid of tiles: square art (radius 10), `#1462` (16/600), status pill, price `0.01 MON/min`, escrow `0.05 MON` or a grey dash at zero. Possessed tiles show `until 14:05`.
- **Load 60 more** at the end.
- Empty filter: **No Chog matches these filters.** + **Clear filters**.
- Desktop: 6 columns (6 × 178 + 5 × 16 = 1,148 ≈ 1,152). Tablet: 4. Phone: 2 columns; filters collapse to search + a **Filters** button opening a sheet.

### 3.4 `/chog/[id]` Token page

- Question: **Can I possess this Chog now, and what will it cost?**
- `h1` **CHOG #1462**; subline: **Token 1 · Uncommon · held by 0x3d38…e7e0**
- Left column (desktop 560px): the art, square, radius 20; under it **Traits** as a two-column key–value well (all attributes in metadata order).
- Right column:
  - **Lease card** (the answer): status pill; when open **Open at 0.01 MON a minute** (+ **default price** or **set by the holder**); when possessed, the orange lease bar and **Possessed by 0x9a1f…44c2 until 14:05:12**; when closed **Closed by its holder** or **Closed: held by a contract**.
  - Possess controls inside the lease card: **Minutes** stepper (−/+, 1–10), **Fee 0.05 MON**, **Gas about 0.002 MON** (from simulation; dash in preview), **Your balance 12.40 MON**, primary **Possess for 5 min**. Disabled reasons in words: **You hold this Chog. Haunt with it below instead.** / **Possessed until 14:05:12.** / **Closed by its holder.**
  - **Escrow card**: figure **0.05 MON** waiting for the holder; line **Unclaimed fees follow the token. If #1462 is sold, the buyer can claim them.** Holder: **Claim 0.05 MON**. Non-holder: text action **Try to claim it** → simulated revert shown inline: **Reverted: NotOwner. Only the wallet holding #1462 can claim.**
  - **Marks on #1462** (24 h, ≤ 8): rows of mark chip + **by #311, possessed** + relative time; empty: **No marks in the last 24 hours.**
  - **Marks #1462 left**: from activity; empty: **#1462 hasn't haunted anyone today.**
  - Holder only: **Your terms** (price field 0.001–1 MON, **Open / Closed** switch, **Save terms**) and **Haunt with #1462** (target picker as on the session page; **holder mode, no lease needed**).
- Phone: art first at full width, then the lease card, escrow, marks, traits.

### 3.5 `/possess/[id]` Session

- Question: **How long do I have, and what can I hit next?**
- `h1` **Possessing #1462**; subline: **Lease paid 0.05 MON to #1462's escrow · started 14:00:12**
- **Lease card** (largest block): countdown **4:37** (36px), the orange bar the width of the time left over the lease's length, **Ends 14:05:12**; validity line **Valid · holder unchanged since you started (0x3d38…e7e0)**; cooldown **Next haunt in 9 s** / **Ready to haunt**.
- **Haunt panel**: target picker with three tabs **Random open Chog / By number / Haunted you back**; the chosen target shown with its art at 64px and status; mark choice as three chips **Boo / Slime / Hex**; primary **Haunt #311 with Boo**. Rule errors in words before signing: **#311 already has your mark today.** / **Wait 9 s.** / **#311 is closed.**
- **Last result**: **Boo landed on #311 · confirmed in block 115,160,402** or the decoded revert.
- **Try to take it** card: button **Try to take it** → simulates `transferFrom(holder, you, 1462)` on Chog Genesis and shows **Reverted: not owner nor approved. You control #1462 inside Dybbo only.**; two reads: **Approved for all: false** (`isApprovedForAll(0x3d38…, Dybbo)`) and **Approved address: 0x0000…0000**, each with **Read on MonadScan**; text action **Send it for real** with **A reverted transaction still pays gas on Monad (charged on the gas limit).**
- **Your marks this session**: rows target, mark, time.
- **Lease over** state (timer at zero): the bar empty; **Your lease on #1462 ended at 14:05:12.**; **Try one more haunt** → **Reverted: LeaseExpired.**; primary **Possess again**.
- **Owner changed** state: **This Chog changed hands; your lease ended.** (negative pill) and **Possess another Chog**.
- No lease for the connected wallet: redirect to `/chog/[id]`.
- Phone: lease card pinned as a 64px strip at the top while scrolling (countdown + bar), haunt panel first.

### 3.6 `/me` Holder dashboard

- Question: **What have my Chogs earned, and who haunted them?**
- `h1` **My Chogs**; subline: **3 Chogs held by 0x3d38…e7e0 · 2 haunted in the last 24 hours**
- **Escrow card**: **0.21 MON** waiting (36px), **from 21 minutes of possession across 3 Chogs**; primary **Claim all** (`claimMany`), with the per-token split listed in the card.
- **Your Chogs** table: art 48px, `#1462`, status, price (`0.01 default` / `0.05 yours`), escrow (right-aligned), marks 24 h, action **Edit terms**. Phone: two-line rows.
- **Marks on your Chogs**: rows **Hex on #1462 by #311, possessed · 12 min ago** with action **Strike back** (opens `/chog/[yourId]` holder haunt with the source preselected).
- Contract holder notice: **Your wallet has code (a contract or EIP-7702 wallet), so your Chogs start closed. Open them in Edit terms.**
- Not connected: **Connect a wallet to see the Chogs it holds.** Holds none: **This wallet holds no Chog Genesis. You can still possess one.** → `/chogs`.

### 3.7 `/me/possessions`

- Question: **Is any lease still running?**
- `h1` **My possessions**; subline: **1 running · 4 ended**
- **Running**: rows with art, `#1462`, countdown, **Resume**.
- **Ended**: rows with art, minutes, fee, ended time, **Possess again**.
- **Your recent haunts**: target, mark, source, time.
- Empty: **You haven't possessed a Chog yet.** → **Possess a random Chog**.

### 3.8 `/proof` The claim

- Question: **Can I check the claim without trusting the builder?**
- `h1` **The claim**; lead: **A possessor can never move, approve or list the Chog they control, and their control ends in the block the lease expires or the Chog changes hands.**
- **The contract**: address (mono, copy), **Verified source**, **Read contract** (MonadScan links), **Admin: none · Pause: none · Upgrade: none · Protocol fee: 0 %**.
- **Every call Dybbo makes to Chog Genesis**: `ownerOf(tokenId)` and the owner's code size. **Nothing else. No approve, no transfer.**
- **Approval check**: pick a Chog → **Holder 0x3d38…e7e0** → **isApprovedForAll(holder, Dybbo): false** (live) and **getApproved(1462): 0x0000…0000**.
- **The three checks** (pick a Chog, run each as a simulation from any address):
  - **Move it as a possessor** → expected **Reverted: not owner nor approved**
  - **Haunt after the lease** → expected **Reverted: LeaseExpired**
  - **Claim as a non-holder** → expected **Reverted: NotOwner**
  Each row shows **Expected**, **Got**, and a pass mark when they match.
- **Tests that prove it**: the Foundry tests from PRD §8.8 with links into the repo.
- **Dybbo never asks for an approval.** If a page that looks like Dybbo asks you to approve anything, it is not Dybbo.

### 3.9 `/judges` Judge guide

- Question: **How do I test this in five minutes without a Chog?**
- `h1` **Judge guide**; subline: **No Chog needed. A Monad wallet with 0.05 MON covers every test.**
- Primary in the title row: **Possess #1462 for 1 minute** (a suggested open Chog, live).
- **Steps** (`<ol>`, order is real):
  1. **Get a little MON on Monad mainnet** (chainId 143). 0.05 MON covers the tests below.
  2. **Possess the suggested Chog for 1 minute.** Expect: fee 0.01 MON plus gas; the timer starts.
  3. **Haunt any open Chog once.** Expect: the mark shows on its page, labelled "by #1462, possessed".
  4. **Press Try to take it.** Expect: the transfer reverts; approvals read false.
  5. **Wait for the timer, then Try one more haunt.** Expect: Reverted: LeaseExpired.
  6. **On The claim page, run the three checks** and open the contract on MonadScan.
- **What it costs**: fee 0.01 MON per minute; gas per action from measurement (dash until measured).
- **What each revert proves**: three rows mapping revert → line of the claim.
- **Links**: demo video, GitHub repo, contract on MonadScan.

### 3.10 `/about` About

- `h1` **About Dybbo**; subline: **The rules, in plain words.**
- Sections (each a card with a 16/600 heading): **Fees and escrow**, **No refunds**, **Prices reset on sale**, **Closed by default**, **Marks**, **What Dybbo never does**, **Who made this**, **The name**.
- **The name**: **From dybbuk, a wandering spirit in Jewish folklore that takes over a living body for a while and leaves when it is driven out. Here, you enter a Chog you don't own, act through it, and leave when the lease ends or the Chog is sold.**

### 3.11 `/404` and the error boundary

- 404: `h1` **No Chog lives here**; **Chog Genesis runs from #1 to #1,969.**; **Browse the Chogs**.
- Error (inside the block that failed): **Couldn't reach Monad RPC. Last good read 14:02:10.** → **Retry** · **Switch RPC**. Image failure: the tile keeps its frame and shows **#1462** and its Background colour name; traits and status still render (NF-05).

---

## 4. Components

| Component | Desktop | Phone |
|---|---|---|
| Top bar | 56px, links + wallet button | 48px, name + Menu → full-screen sheet |
| Preview notice | One line under the bar | Wraps to two lines, 13px |
| Wallet button | `Connect wallet` → injected wallets; connected shows short address + MON balance; wrong network: `Switch to Monad` | Inside the menu sheet; the bar shows a dot when connected |
| ChogArt | Square, radius 10 (tile) / 20 (detail), Background trait colour as the placeholder ground | Same |
| StatusPill | 22px pale tile + ink (Open / Possessed / Closed) | Same |
| MarkGlyph / MarkChip | Glyph 16–96px; chip = glyph + name on its pale tile | Same |
| LeaseBar | Full card width, 12px, orange, shrinks linearly every 100ms | Becomes the pinned strip on `/possess` |
| Countdown | `m:ss`, 36px, tabular | 28px in the pinned strip |
| MinutesStepper | −/+ buttons 36px, value centred, 1–10 | 44px buttons |
| CostLines | Key–value rows: fee, gas, balance, total | Same |
| TxButton | Idle → Simulating → Confirm in wallet → Pending (proposed) → Confirmed; decoded error inline under the button | Full width |
| RevertResult | Negative pill + decoded error name + one plain sentence | Same |
| AddressChip | Mono, `0x3d38…e7e0`, copy icon, MonadScan link | Same |
| TraitWell | Two columns of key–value rows | One column |
| MarkList | 48px rows: chip, "by #311, possessed", time right | Same |
| ChogGrid | 6 columns, tiles 178px | 2 columns |
| Filters | One row of controls | Search + Filters sheet |
| EmptyState | Keeps the card frame, one sentence, one action | Same |
| Skeleton | Flat grey bars at the real size, no shimmer | Same |
| Home: StageBar | Horizontal flex bar, 22vh | Vertical stack, 70svh |
| Home: Board | 72px rows, 26–30px type, 4px gaps | 64px rows, name + status only |
| Home: SliderFigure | 400px slider, figure 19vw | Full-width slider, 44px thumb, figure 30vw |
| Home: FAQ tiles | Sticky heading left, tiles right | Heading on top, tiles full width |

---

## 5. Avoid

- A centred hero with an eyebrow pill ("Now live on Monad") above it, and any small uppercase label over a heading.
- A row of three icon-topped feature cards ("No custody / No approval / Instant").
- Purple-to-pink gradients, glowing Monad-violet borders, glass panels, blurred blobs, neon on navy.
- Monospace captions, `01 / 02 / 03` step numbers, hairline grids, crosshair ornaments.
- Fake proof: invented user counts, "trusted by" logos, quotes from holders, volume numbers before the contract has any.
- A KPI strip of four tinted cards with sparklines on app screens; "Welcome back" greetings; a dark sidebar.
- Overlaying marks, frames or stickers onto Chog art. Marks sit beside the art.
- The word "rent" as the headline idea. The verb is **possess**.
- A loading spinner over a whole page; shimmer skeletons; a full-screen error banner.
- Status shown by colour alone (every pill carries its word).

---

## 6. Deviations and notes

- **Shell redraw:** the app sheet dealt an unlabelled icon rail. Replaced with the study's "no sidebar" archetype (top bar over a centred column) because Dybbo has public visitors and judges scoring Clarity, and five labelled destinations fit in a top bar.
- **Preview mode:** until `NEXT_PUBLIC_DYBBO_ADDRESS` is set, the frontend runs a browser-side simulation of the contract that follows PRD §7–8 exactly (same rules, same error names), with real Chog ownership read from Monad. The notice in §3.2 says so on every app screen.
- **Sample content** (to replace with live data once deployed): the marks on the home page's card fragment (§3.1.5); gas estimates are shown only from real simulation.

### Changes made during the build

- **Hero picture** sits beside the second headline line instead of overlapping it: at 1440×900 the overlap pushed the sentence and button below the fold, and nothing may cover the headline.
- **Board** shows all nine rows whole. The blueprint's half-cut first and last rows failed the inspector's covered-text check.
- **Display size** is `min(13.5vw, 21svh)` (17vw on phones) so the hero, the fee figure and the CTA word share one step and the hero fits a laptop screen.
- **Stage bar** stacks vertically below 900px; four segments were too narrow for their durations on a tablet.
- **`/me?address=0x…`** shows any holder's Chogs read-only ("Chogs held", no Claim), and `/me` without a wallet offers that lookup. Spectators and judges without a Chog can see the holder side.
- **Chog Genesis reverts** are decoded from OpenZeppelin's ERC-721 errors (`0x177e802f` → `ERC721InsufficientApproval`).
- **Right rails** on `/proof` and `/me` are sticky so the contract facts and the escrow total stay in view.
