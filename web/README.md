# Dybbo web

Next.js 16 app for Dybbo on Monad mainnet. Design and copy: [`../docs/FRONTEND.md`](../docs/FRONTEND.md).

```bash
cp .env.example .env.local   # the mainnet contract; remove NEXT_PUBLIC_DYBBO_ADDRESS for preview mode
npm install
npm run dev                  # http://localhost:3000
```

## Environment

| Variable | Use |
|---|---|
| `NEXT_PUBLIC_DYBBO_ADDRESS` | The Dybbo contract. Unset = preview mode (rules simulated in the browser). |
| `NEXT_PUBLIC_DYBBO_VERIFIED`, `NEXT_PUBLIC_DYBBO_SOURCE_URL` | Show and link the verified source on `/proof`. |
| `NEXT_PUBLIC_RPC_URL` | A local fork instead of the public Monad RPCs (`anvil --fork-url https://rpc.monad.xyz --chain-id 143`). |
| `NEXT_PUBLIC_REPO_URL`, `NEXT_PUBLIC_VIDEO_URL` | Links in the footer, the judge guide and `/proof`. |

## Data

- `data/chogs.json`: name, image and traits for all 1,969 Chogs, read from `tokenURI` on chain (`scripts/snapshot.mjs`, re-run if the base URI changes).
- `lib/dybbo/abi.ts`: generated from the compiled contract (`contracts/script/export-abi.mjs`).
- `/api/image/[id]`: Chog art through IPFS gateways with fallback, resized once and served with a one-year cache header.

## Deploy (Vercel)

1. Import the GitHub repo and set **Root Directory** to `web`.
2. Add the variables from `.env.example` under Settings → Environment Variables.
3. Deploy. The snapshot ships with every route (`outputFileTracingIncludes` in `next.config.ts`).
