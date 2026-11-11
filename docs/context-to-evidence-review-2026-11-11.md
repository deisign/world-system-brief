# WSB — evidence promotion review (11 November 2026)

The preceding completeness audit covered **103 registered entities**: 76 had at least one explicitly recorded relation, while 27 had *only* source-backed context or explicitly noncausal comparisons. Coverage of all nodes is not equivalent to evidence of causal dependency.

## Direct relationships promoted from context

Thirteen relationships now have an explicit, named mechanism supported by an original claim/source pair or a dated external primary source. All carry the **editorial registration date 2026-11-11** and `physical_delta: false`. Historical issues and their event dates remain unchanged.

| Previously context-only entity | Directed relation to | What the source actually establishes |
|---|---|---|
| US SPR refiner loans | Strategic Petroleum Reserve | Repayable loan offer; not measured oil withdrawal |
| Cheniere–Petrobras LNG | Petrobras | Signed 22-year LNG contract; not delivered tonnage |
| EU grid guarantees | EIB–BNP guarantees | €700m signed risk-capacity instrument; projected investment not built infrastructure |
| Capital unblocks grid capacity | EU grid capacity | Prospective finance-to-capacity mechanism, not commissioned MW |
| Bidirectional charging | MiSpeL storage rule | Regulatory market integration, subject to implementation |
| Taiwan energy buffer | Taiwan public balance sheet | Budget absorbs part of fuel/electricity price differential |
| Hormuz navigation aid damage claim | Hormuz | Geographical subject of **unverified assertion**, not verified physical damage |
| Hormuz oil-risk repricing | Hormuz | Risk pricing, not measured shipping throughput |
| IRGC mine/seizure vessel claims | Hormuz | Subject of Iranian claims, **not independently confirmed losses** |
| Qatar tanker incident | Hormuz regional risk | Gulf regional risk; **not an incident inside Hormuz** |
| Gulf crude export flow | Hormuz | Reuters/Kpler preliminary transit estimates; preliminary series may be revised |
| Gulf of Oman STS | East–West pipeline | Observed Saudi oil rerouting after pipeline disruption |
| Pacific LNG optionality | LNG Canada Phase 2 | Committed future LNG export option, not operational Phase 2 |

## Evidence controls

- The registry retains **10 separately marked comparative edges**. These remain in the dashed, optional context layer, not promoted to causal relations.
- The 13 promoted relations are **specific reported policy, contract, location, finance, or physical flow mechanisms**. Some are claims of damage or market prices; the mechanism is the *relation between the report and its named object*, not a verified disaster.
- Every promoted relationship cites its original claim/source or an externally verified dated article.
- An early Reuters/Kpler September oil flow report includes preliminary estimates that differed across later versions. Consequently the link records the existence of the corridor and reported flows, **without pinning a supposed final volume**.
- The LNG Canada link uses [LNG Canada's original Phase 2 final investment decision](https://www.lngcanada.ca/news/lng-canada-announces-phase-2-final-investment-decision/), not an earlier speculative announcement.
- No new physical system transitions or backdated daily relation events are created.

## Reproduction

```sh
npm ci
npm test
node publisher/entity-connectivity-audit.js
```

Read `artifacts/entity-audit/connectivity.json` for the count of `in_explicit_graph` and `in_any_graph`. Keep these separate: the remaining context-only entities need additional mechanism-specific sources, and pure comparison links should not be promoted just to raise the percentage.
