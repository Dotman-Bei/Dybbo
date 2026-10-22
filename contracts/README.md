# Dybbo contracts

**Monad mainnet:** [`0x908D8899795072985e35CB86dA3Aff88CE4e72e9`](https://monadscan.com/address/0x908D8899795072985e35CB86dA3Aff88CE4e72e9), deployed 2026-10-22 with a default price of 0.01 MON a minute. Details in [deployments.json](deployments.json).

Foundry project for the Dybbo contract (PRD §8). Monad mainnet, chainId 143.

```bash
forge build
forge test                          # unit tests against a mock Chog
FOUNDRY_PROFILE=fork forge test     # fork tests against the real Chog Genesis (network, ~10 min)
```

## Gas

`node script/measure-gas.mjs` estimates every action on Monad mainnet itself, with the compiled contract
injected through `eth_estimateGas` state overrides. Results are in [gas/monad-gas.json](gas/monad-gas.json):
possess 341k, haunt ~272k, claim 155k, setTerms 72k gas on fresh storage. Monad charges the gas limit, so the
app sets the limit to the estimate × 1.2.

## Deploy (Monad mainnet)

Prices are fixed at deploy. Defaults follow PRD §8.2 (0.01 MON a minute, bounds 0.001 to 1 MON).

```bash
export DEFAULT_PRICE_WEI=10000000000000000   # optional
forge script script/Deploy.s.sol --rpc-url monad --broadcast --slow \
  --gas-estimate-multiplier 200 --interactive   # or --account <keystore name>
```

The multiplier covers Monad's higher cold-access and storage pricing, which the local simulation does not
model. Verify the source on MonadScan (Etherscan v2 API, chainId 143):

```bash
forge verify-contract <address> src/Dybbo.sol:Dybbo --chain 143 \
  --verifier etherscan --etherscan-api-key $ETHERSCAN_API_KEY \
  --constructor-args $(cast abi-encode "constructor(address,uint256,uint256,uint256)" \
    0xc96d31F8626c6D03Fae5dCD3d61e3FB9F4a73763 $DEFAULT_PRICE_WEI 1000000000000000 1000000000000000000)
```

Then set `NEXT_PUBLIC_DYBBO_ADDRESS` in `web/.env.local` to leave preview mode.
