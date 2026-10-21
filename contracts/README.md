# Dybbo contracts

Foundry project for the Dybbo contract (PRD §8). Monad mainnet, chainId 143.

```bash
forge build
forge test                          # unit tests against a mock Chog
forge test --match-contract Fork    # fork tests against the real Chog Genesis (needs network)
```
