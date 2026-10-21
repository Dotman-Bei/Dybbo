# Dybbo contracts

Foundry project for the Dybbo contract (PRD §8). Monad mainnet, chainId 143.

```bash
forge build
forge test                          # unit tests against a mock Chog
FOUNDRY_PROFILE=fork forge test     # fork tests against the real Chog Genesis (network, ~10 min)
```
