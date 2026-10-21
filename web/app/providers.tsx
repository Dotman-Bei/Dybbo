"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fallback, http } from "viem";
import { WagmiProvider, createConfig, useAccount, useWalletClient } from "wagmi";
import { injected } from "wagmi/connectors";
import { monad } from "@/lib/chain";
import { RPC_URLS } from "@/lib/config";
import { dybbo } from "@/lib/dybbo";

export const wagmiConfig = createConfig({
  chains: [monad],
  connectors: [injected()],
  transports: { [monad.id]: fallback(RPC_URLS.map((u) => http(u))) },
  ssr: true,
});

function WalletBridge() {
  const { data } = useWalletClient();
  useEffect(() => {
    (dybbo as { wallet?: unknown }).wallet = data ?? null;
  }, [data]);
  return null;
}

/** Refetch every Dybbo read when the preview engine writes, in this tab or another. */
function PreviewSync({ client }: { client: QueryClient }) {
  const { address } = useAccount();
  useEffect(() => {
    const bump = () => client.invalidateQueries({ queryKey: ["dybbo"] });
    window.addEventListener("dybbo:change", bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener("dybbo:change", bump);
      window.removeEventListener("storage", bump);
    };
  }, [client]);
  useEffect(() => {
    client.invalidateQueries({ queryKey: ["dybbo"] });
  }, [address, client]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 5_000, refetchOnWindowFocus: false, retry: 2 } } }),
  );
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={client}>
        <WalletBridge />
        <PreviewSync client={client} />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
