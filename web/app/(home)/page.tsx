import Link from "next/link";
import { ChogArt } from "@/components/chog-art";
import { Board, CtaBand, FeeFigure, HeroStatus, MinutesControl, RevealObserver, type BoardRow } from "@/components/home/islands";
import { DybboMark, MarkGlyph } from "@/components/marks";
import { getChog, trait } from "@/lib/chogs";
import { HAUNT_COOLDOWN, MARKS, MARKS_PER_TOKEN } from "@/lib/config";
import "./home.css";

// Token IDs shown on the page. Token 1 is CHOG #1462, the Chog in the demo.
const HERO = 1;
const BOARD = [214, 388, 690, 1, 530, 455, 121, 597, 88];
const HAUNTED = 610;
const FOOTER = 377;

function row(id: number): BoardRow {
  const c = getChog(id)!;
  return {
    id,
    n: c.metaId,
    tier: trait(c, "Tier") ?? "—",
    background: trait(c, "Background") ?? "—",
    head: trait(c, "Head") ?? "—",
    eyes: trait(c, "Eyes") ?? "—",
  };
}

export default function Home() {
  const hero = getChog(HERO)!;
  const haunted = getChog(HAUNTED)!;
  const footer = getChog(FOOTER)!;
  const sample = [BOARD[0], BOARD[2]].map((id) => getChog(id)!.metaId);

  return (
    <main className="home">
      <RevealObserver />

      <section className="hero" aria-labelledby="hero-title">
        <nav className="nav" aria-label="Main">
          <Link href="/" className="nav__mark">
            <DybboMark size={26} />
            Dybbo
          </Link>
          <ul className="nav__links">
            <li><Link href="/chogs">Chogs</Link></li>
            <li><Link href="/proof">Proof</Link></li>
            <li><Link href="/judges">Judges</Link></li>
            <li><Link href="/about">About</Link></li>
          </ul>
          <Link href="/chogs" className="nav__menu">Menu</Link>
        </nav>

        <h1 id="hero-title" className="hero__title lines">
          <span className="line l1"><span data-line style={{ "--i": 0 } as React.CSSProperties}>Possess</span></span>
          <span className="line l2"><span data-line style={{ "--i": 1 } as React.CSSProperties}>any Chog</span></span>
        </h1>

        <figure className="hero__picture" data-load style={{ "--d": "300ms" } as React.CSSProperties}>
          <div className="hero__cut">
            <ChogArt id={HERO} name={hero.name} w={640} priority sizes="(max-width: 700px) 56vw, 30vw" />
          </div>
          <HeroStatus id={HERO} n={hero.metaId} />
        </figure>

        <div className="hero__foot">
          <p className="hero__lead" data-load style={{ "--d": "420ms" } as React.CSSProperties}>
            Control a Chog Genesis you don&rsquo;t own for up to ten minutes. No approval, no custody. The fee waits for its holder.
          </p>
          <a className="button" href="/api/random-open?go=1&minutes=5" data-load style={{ "--d": "480ms" } as React.CSSProperties}>
            Possess a random Chog
          </a>
        </div>
      </section>

      <section className="runs" aria-labelledby="runs-title">
        <h2 id="runs-title" className="head" data-reveal>How a possession runs</h2>
        <ol className="stages" data-ui data-reveal style={{ "--d": "70ms" } as React.CSSProperties}>
          <li className="stage" style={{ flexGrow: 12 }}>
            <span className="stage__time">Under a second</span>
            <p className="stage__clause">First, you pay and the lease starts in the next block.</p>
          </li>
          <li className="stage" style={{ flexGrow: 52 }}>
            <span className="stage__time">Up to ten minutes</span>
            <p className="stage__clause">Then you haunt other Chogs, one mark every {HAUNT_COOLDOWN} seconds.</p>
          </li>
          <li className="stage" style={{ flexGrow: 12 }}>
            <span className="stage__time">One block</span>
            <p className="stage__clause">Then the lease ends. Your next haunt reverts.</p>
          </li>
          <li className="stage" style={{ flexGrow: 24 }}>
            <span className="stage__time">Whenever they like</span>
            <p className="stage__clause">Last, the holder claims the fee. They never signed up.</p>
          </li>
        </ol>
      </section>

      <section className="take" aria-labelledby="take-title">
        <div className="tiles" data-reveal>
          <div className="tile tile--head">
            <h2 id="take-title" className="head">Try to take it</h2>
            <p className="tile__claim">A possessor can never move, approve or list the Chog they control.</p>
          </div>
          <div className="tile"><h3 className="tile__name">Move it</h3><p>Reverts. Nobody approved Dybbo or you.</p></div>
          <div className="tile"><h3 className="tile__name">List it</h3><p>Nothing to list with. There is no approval.</p></div>
          <div className="tile"><h3 className="tile__name">Outstay the timer</h3><p>Your next haunt reverts with LeaseExpired.</p></div>
          <div className="tile"><h3 className="tile__name">Keep it after a sale</h3><p>Control ends in the block the Chog changes hands.</p></div>
          <div className="tile"><h3 className="tile__name">Take its fee</h3><p>Reverts with NotOwner. Only the holder can claim.</p></div>
          <div className="tile"><h3 className="tile__name">Ask the builder</h3><p>No admin, no pause, no upgrade, no fee.</p></div>
        </div>
        <Link href="/proof" className="take__link">Run the three checks yourself</Link>
      </section>

      <section className="open" aria-labelledby="open-title">
        <h2 id="open-title" className="head" data-reveal>Open right now</h2>
        <div data-reveal style={{ "--d": "70ms" } as React.CSSProperties}>
          <Board rows={BOARD.map(row)} />
        </div>
      </section>

      <section className="marks" aria-labelledby="marks-title">
        <figure className="hcard" data-ui data-reveal>
          <ChogArt id={HAUNTED} name={haunted.name} w={640} className="hcard__art" sizes="(max-width: 700px) 90vw, 30vw" />
          <figcaption className="hcard__side">
            <span className="hcard__title num">CHOG #{haunted.metaId}</span>
            <span className="hcard__sub">Marks in the last 24 hours</span>
            <ul className="hcard__marks">
              <li><span className="chip"><MarkGlyph id={0} size={22} />Boo</span><span>by #{hero.metaId}, possessed</span><span className="hcard__time">2 min ago</span></li>
              <li><span className="chip"><MarkGlyph id={1} size={22} />Slime</span><span>by #{sample[0]}</span><span className="hcard__time">40 min ago</span></li>
              <li><span className="chip"><MarkGlyph id={2} size={22} />Hex</span><span>by #{sample[1]}, possessed</span><span className="hcard__time">3 h ago</span></li>
            </ul>
          </figcaption>
        </figure>
        <div className="marks__copy">
          <h2 id="marks-title" className="head">Leave a mark</h2>
          <p className="marks__body" data-reveal style={{ "--d": "70ms" } as React.CSSProperties}>
            While you possess a Chog you can haunt any open Chog with one of three marks. A mark sits beside its target&rsquo;s art for 24 hours, signed with the Chog that left it. Holders strike back with their own Chog, no lease needed.
          </p>
          <ul className="glyphs" data-reveal style={{ "--d": "140ms" } as React.CSSProperties}>
            {MARKS.map((m) => (
              <li key={m.id}>
                <MarkGlyph id={m.id} size={96} />
                <span className="glyphs__name">{m.name}</span>
              </li>
            ))}
          </ul>
          <p className="marks__limits">
            One mark every {HAUNT_COOLDOWN} seconds. One per target per day. {MARKS_PER_TOKEN === 8 ? "Eight" : MARKS_PER_TOKEN} live marks per Chog.
          </p>
        </div>
      </section>

      <section className="howlong" aria-labelledby="howlong-title">
        <div className="howlong__top">
          <h2 id="howlong-title" className="howlong__q">How long do you want it?</h2>
          <MinutesControl id={HERO} n={hero.metaId} />
        </div>
        <div className="howlong__bottom">
          <FeeFigure id={HERO} n={hero.metaId} />
        </div>
      </section>

      <section className="faq" aria-labelledby="faq-title">
        <h2 id="faq-title" className="head faq__title">Before you pay</h2>
        <div className="faq__list" data-reveal>
          {FAQ.map(([q, a]) => (
            <details key={q} name="faq" className="qa">
              <summary>
                <span>{q}</span>
                <span className="qa__sign" aria-hidden="true"><i /><i /></span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <CtaBand />

      <footer className="foot">
        <div className="foot__picture">
          <ChogArt id={FOOTER} name={footer.name} w={1000} sizes="50vw" />
        </div>
        <div className="foot__side">
          <Link href="/" className="foot__mark"><DybboMark size={24} />Dybbo</Link>
          <ul className="foot__menu">
            <li><Link href="/chogs">Chogs</Link></li>
            <li><Link href="/me">My Chogs</Link></li>
            <li><Link href="/me/possessions">My possessions</Link></li>
            <li><Link href="/proof">The claim</Link></li>
            <li><Link href="/judges">Judge guide</Link></li>
            <li><Link href="/about">About</Link></li>
          </ul>
          <div className="foot__blocks">
            <p>Built for Chogathon 2026 by one builder. <a href={process.env.NEXT_PUBLIC_REPO_URL || "https://github.com/"}>Source on GitHub</a>.</p>
            <p><a href="https://discord.gg/chog">Chog Discord</a> · <a href="https://www.chog.xyz">chog.xyz</a></p>
          </div>
          <p className="foot__legal">
            Unofficial community project. Chog art © ChogLabs, shown with permission and never altered. Dybbo never asks for an NFT approval.
          </p>
        </div>
      </footer>
    </main>
  );
}

const FAQ: [string, string][] = [
  ["Can a possessor steal the Chog?", "No. Dybbo never asks for an approval and has no code that calls approve or transfer on Chog Genesis. A possession is a record inside Dybbo; the NFT never moves."],
  ["Where does my fee go?", "All of it goes into that Chog’s escrow. Whoever holds the Chog when they claim takes it. Dybbo charges no fee and has no admin."],
  ["What if the Chog is sold while I hold it?", "Your control ends in the block it changes hands, and the next haunt reverts with OwnerChanged. There are no refunds: leases last ten minutes at most, and the terms are shown before you pay."],
  ["I hold a Chog. Did I agree to this?", "Every Chog in a regular wallet is open at 0.01 MON a minute from the first block, so it earns without a sign-up. You can set your own price or close it at any time from My Chogs."],
  ["Why is this Chog closed?", "Chogs held by contracts, such as vaults, marketplaces, Safes and EIP-7702 wallets, start closed, so nobody can borrow one for a block to drain its escrow. The holder can open it."],
  ["Do marks change my NFT?", "No. Marks are Dybbo data shown beside the art. The image and metadata never change, and every mark is gone after 24 hours."],
  ["What happens to unclaimed fees after a sale?", "They stay with the token, so the buyer can claim them. Prices and opt-outs do not carry over: the buyer starts on the defaults."],
  ["Is this made by the Chog team?", "No. Dybbo is an unofficial community project built for Chogathon 2026. Chog art is shown with permission and never altered."],
];
