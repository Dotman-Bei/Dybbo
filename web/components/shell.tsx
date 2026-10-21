"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { PREVIEW } from "@/lib/config";
import { mon, shortAddr } from "@/lib/format";
import { useActor, useMonBalance } from "@/lib/hooks";
import { DybboMark } from "./marks";

const LINKS = [
  { href: "/chogs", label: "Chogs" },
  { href: "/me", label: "My Chogs" },
  { href: "/me/possessions", label: "Possessions" },
  { href: "/proof", label: "Proof" },
  { href: "/judges", label: "Judges" },
];

const noop = () => () => {};

function active(path: string, href: string) {
  if (href === "/me") return path === "/me";
  return path === href || path.startsWith(href + "/") || (href === "/chogs" && (path.startsWith("/chog/") || path.startsWith("/possess/")));
}

export function WalletButton({ block }: { block?: boolean }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { wrongChain } = useActor();
  const balance = useMonBalance(address ?? null);
  // The wallet state only exists in the browser; render the plain button on the server.
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  const cls = `btn btn--secondary${block ? " btn--block" : ""}`;
  if (!mounted) return <button className={cls} disabled>Connect wallet</button>;
  if (isConnected && wrongChain)
    return <button className={cls} onClick={() => switchChain({ chainId: 143 })}>Switch to Monad</button>;
  if (isConnected && address)
    return (
      <button className={cls} onClick={() => disconnect()} title="Disconnect">
        <span className="mono">{shortAddr(address)}</span>
        {balance !== null && <span className="num muted"> · {mon(balance)} MON</span>}
      </button>
    );
  const injected = connectors[0];
  return (
    <button
      className={cls}
      disabled={isPending || !injected}
      onClick={() => injected && connect({ connector: injected, chainId: 143 })}
      title={error ? error.message : undefined}
    >
      {isPending ? "Connecting…" : "Connect wallet"}
    </button>
  );
}

export function TopBar() {
  const path = usePathname();
  // The sheet belongs to the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === path;
  const setOpen = (v: boolean) => setOpenOn(v ? path : null);
  const here = LINKS.find((l) => active(path, l.href))?.label ?? "Dybbo";

  return (
    <header className="bar">
      <div className="bar__in">
        <Link href="/" className="bar__brand">
          <DybboMark size={26} />
          <span>Dybbo</span>
        </Link>
        <span className="bar__here">{here}</span>
        <nav className="bar__nav" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="bar__link" aria-current={active(path, l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="bar__end">
          <span className="bar__net"><i aria-hidden="true" />Monad</span>
          <WalletButton />
        </div>
        <button className="bar__menu" aria-expanded={open} aria-controls="sheet" onClick={() => setOpen(!open)}>
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <div className="sheet" id="sheet">
          <nav aria-label="Main">
            {[{ href: "/", label: "Home" }, ...LINKS, { href: "/about", label: "About" }].map((l) => (
              <Link key={l.href} href={l.href} className="sheet__link" aria-current={path === l.href ? "page" : undefined}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="sheet__foot">
            <span className="bar__net"><i aria-hidden="true" />Monad mainnet</span>
            <WalletButton block />
          </div>
        </div>
      )}
      {PREVIEW && (
        <p className="notice notice--bar">
          Preview: the Dybbo contract is not on mainnet yet. Leases and marks here are simulated in this browser. Chogs, owners and art are real.
        </p>
      )}
    </header>
  );
}
