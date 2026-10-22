# Dybbo demo: storyboard

Target length 1:45 at 1920×1080, 30 fps. Voice: Gemini TTS, voice **Charon**. Music: an original score written in code for this edit. UI: real screens of Dybbo, captured from the live contract running on a Monad mainnet fork (the same deployed contract and state, with a test wallet).

## What we take from the reference

Studied for technique only (its content and branding are not used):

| Technique in the reference | How Dybbo uses it |
|---|---|
| Opens on a human-scale problem with real numbers before naming the product | Opens on the Chog collection itself (1,969 real Chog artworks) and the fact that most people can only watch |
| Kinetic type on a quiet field: one line, large, fading up 10–15 px | Same, in Dybbo's two colours and Chillax |
| One big number as a beat ("$84,000") | 25,994 NFTs lost to one forgotten approval; "Approved for all: false" |
| Product shown as a floating window on a clean field, no browser chrome | Real Dybbo screens as floating windows on deep green |
| Slow push-ins and short 1.5 s holds on the widget that matters | Push-ins on the fee lines, the timer, the revert, the mark |
| A drawn cursor on smooth curved paths, slight overshoot, ring on click | Same, with the UI changing state on the click |
| Music thins out for the key comparison, hits on the end card | Music drops to a pulse for "Now, try to take it", resolves on the logo |
| Sparse, functional SFX tied to UI events | Soft clicks, one low thud for each refusal, a light chime for confirmations |
| A tight feature montage before the end card | Holder claim and the three on-chain checks |
| End card: one line and the URL | "Possess any Chog." with dybbo.vercel.app |

Not taken: the live-action actor (we have no footage and won't fake any), the stamp and VHS-glitch transitions, the corporate tone.

## Shots

Timings are planned to the voiceover. They are final once each line's measured length is known.

| # | Time | Shown | Interaction and cursor | Camera | Transition in | Voiceover | SFX | Music |
|---|---|---|---|---|---|---|---|---|
| 1 | 0:00–0:07 | A wall of real Chog Genesis art, slightly dimmed, on deep green. "1,969" counts up in slime, then "Chog Genesis" fades up under it | None | Very slow push-in (100% → 106%) | Fade from black, 0.5 s | "There are nineteen hundred and sixty-nine Chog Genesis. Fewer than a thousand people own one." | None | Soft pad and sub pulse start, sparse |
| 2 | 0:07–0:10 | Most tiles dim to 25%; the owned ones stay lit. Line: "Everyone else watches." | None | Push continues | Opacity only | "Everyone else watches." | None | Pad holds |
| 3 | 0:10–0:16 | Deep green field. "Lending one meant signing this:" then `setApprovalForAll(operator, true)` types on; "every NFT you own" underlines | None | Static | Hard cut | "Lending one used to mean signing an approval that lets a contract move every NFT you own." | Light key ticks as the call types | Mallets enter, quiet |
| 4 | 0:16–0:24 | "25,994" counts up large, "NFTs, from 3,033 wallets" under it, source line "One forgotten approval, 2026" | None | Slow push-in | Cross-dissolve 0.3 s | "In one sweep this year, a single forgotten approval cost three thousand wallets nearly twenty-six thousand NFTs." | Low thud as the count lands | Builds slightly |
| 5 | 0:24–0:27 | Field clears; "Dybbo needs none of that." | None | Static | Fade through deep green | "Dybbo needs none of that." | Soft air whoosh into shot 6 | Short pause, then the beat opens on the cut |
| 6 | 0:27–0:31 | Logo reveal: the D fills, the wisp is cut out of it, the wordmark slides in; "Possess any Chog." under it | None | Static | Cut on the beat | "Possess any Chog, for a few minutes." | Soft pop when the wisp opens | Full groove: mallets, sub, light hats |
| 7 | 0:31–0:36 | Home page as a floating window, then Browse: the subline "1,968 open at 0.01 MON a minute" | Cursor rests, then drifts to the subline | Push-in on the subline | Window slides up 40 px and fades in; cut to Browse | (music only, 1 s) then L7 begins | Click on cut | Groove |
| 8 | 0:36–0:47 | Token page for CHOG #1462: lease card, Fee to #1462's escrow 0.01 MON, gas, total | Cursor curves to the fee lines and pauses; then to **Possess for 1 min**; click ring | Push-in on the lease card, then on the fee rows | Cut | "Pick one. The fee goes straight into that Chog's escrow, for whoever holds it. No approval. No custody. The Chog never leaves its wallet." | Click; light chime on confirm | Groove |
| 9 | 0:47–0:59 | Session: Possessing #1462, timer running; Haunt panel. Then the target Chog's page with the mark | Cursor: **By number**, types the target, **Find**, **Boo**, **Haunt** → "Confirmed · Boo landed on …". Cut to target page | Push-in on the timer, then the haunt panel, then the mark row | Cut; cut | "While the timer runs, you control it. Leave a mark on another Chog. It stays on that Chog's page for a day, signed by the one you possessed." | Key ticks for typing, clicks, chime on confirm | Groove, slightly brighter |
| 10 | 0:59–1:10 | Session: Try to take it panel. Revert pill "Reverted: ERC721InsufficientApproval"; "Approved for all: false" | Cursor travels slowly to **Try to take it**, holds a beat, clicks | Push-in on the panel; hold on the revert | Cut | "Now, try to take it." (beat) "Chog Genesis refuses. Dybbo was never approved, so neither are you." | Low thud on the revert | Drops to the sub pulse only, then back in |
| 11 | 1:10–1:17 | Timer runs to 0:00 (speed ramp), lease card switches to Ended; **Try one more haunt** → "Reverted: LeaseExpired" | Cursor to **Try one more haunt**, click | Push-in on the timer, then on the revert | Cut | "And when the minute is up, control ends, in that very block." | Tick at 0:00; low thud on the revert | Groove returns |
| 12 | 1:17–1:26 | My Chogs as #1462's holder: Waiting in escrow, then **Claim all** → "Claimed to your wallet" | Cursor to **Claim all**, click | Push-in on the escrow figure | Cut | "The holder never signed up. They just find the fee waiting, and claim it." | Click; chime | Groove |
| 13 | 1:26–1:35 | The claim page: **Run the three checks** → three Pass pills in turn | Cursor click; no movement while results land | Push-in on the checks | Cut | "Every rule is checked on Monad, every time. Anyone can run the checks." | Three soft ticks, one per Pass | Building to the end |
| 14 | 1:35–1:45 | End card: logo lockup, "Possess any Chog.", dybbo.vercel.app, "Built on Monad for Chogathon 2026" | None | Static | Fade through deep green | "Dybbo. Possess any Chog." | None | Final chord, decays to silence |

## Rules for the edit

- The product is the main character. No stock footage, no invented UI, no fake wallet pop-ups.
- One cursor, moving with intent: curved paths, ease-in-out, a slight settle on arrival, a ring on every click.
- One camera move per shot at most, eased, never past 1.6×.
- Transitions are cuts, short cross-dissolves, or fades through deep green. Nothing else.
- On-screen text only where the voice needs a number or a phrase to land.
- Music sits at about −18 dB under the voice and rises about 4 dB in voice-free gaps.
