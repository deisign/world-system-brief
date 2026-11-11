# WSB entity connectivity — evidence reconciliation, 11 November 2026

## Editorial result

This review does **not** rewrite canonical 2026 issues or backdate publication of derived relationships. The retrospective file `knowledge/retrospective-relations.json` explicitly records the registration date **2026-11-11** and points back to historical issue claims and source IDs.

| Audit indicator | Before | After |
|---|---:|---:|
| Registered entities | 100 | 100 |
| With any justified entity link | **65** | **88** |
| With no documented or separately labelled comparative link | **35** | **12** |
| Directed recorded relations (unique) | 32 | **47** |
| Contextual/comparative associations (unique) | 64 | **68** |
| Unknown entity references | 0 | **0** |
| Confirmed physical changes created by review | 0 | **0** |

The additions consist of **15 documented relations** and **4 noncausal analytical comparisons**. Of the 15 documented relations, the ZEISS SMT → ASML strategic optics supply dependency is supported by current ASML primary documentation, not an invented 2026 event. The other documented links point to specific pre-existing issue claims and source IDs.

A documented relation can still be a *risk, disputed claim, stated target or announced plan*. Examples: Forties pipeline strike risk is **not** a confirmed shutdown; Houthi claims about the East–West pipeline are **not** confirmed damage; OPEC output targets are **not** physically measured oil production; a World Bank forecast is **not** a realised supply loss.

The four comparative links are explicitly **noncausal**: Siemens Energy cooperation / German energy support for Ukraine; TSMC substitution studies / UK critical minerals diversification; NextDC data-centre project pauses / global gas-turbine procurement constraints; two separately sourced Gulf risk-premium observations. They are available in the optional dashed context overlay, not as solid causal relationships.

## Remaining 12 unresolved entity-to-entity gaps

| Entity | Current evidence limitation / missing counterpart |
|---|---|
| `cosco-zippel` | A reported potential German investment veto, but no direct relationship to another registered logistics transaction or port-operating entity |
| `estonia-grain-transit` | Historical state only; no associated claim and verifiable source support in the canonical corpus |
| `indonesia-singapore-gas-supply-adjustment` | Dated gas-supply claim and source, but no specific registered Singapore gas demand/import entity |
| `iranian-seafarer-rescue-sri-lanka` | Rescue claim with source; no evidence tying it to a specific sanctions or oil-shipping flow change |
| `lng-canada-upstream` | Registered upstream concept but no individual sourced claim proving the particular upstream-to-Phase-2 capacity relation |
| `maersk-container-freight-pricing` | Sourced freight-rate signal; no properly evidenced direct dependency with another named mechanism in the registry |
| `nord-stream-restart-option` | Reported talks, but no implemented flow or verified causal connection to a current gas-power constraint |
| `nvidia-china` | Unverified possible GPU purchase relaxations in 2026-09-27 reporting; cannot be equated with confirmed exports or Chinese export licensing |
| `riyadh-aramco-fire` | Observed incident and attack claim, but no confirmed capacity impact or verified link to other Saudi attacks |
| `shadow-fleet-shipping-services` | Multiple sourced sanctions proposals, but no enacted change directly tying these services to the distinct registered sanctions instruments |
| `us-perm-tech-suspensions` | Dated US labour-permission decision, but no separately registered labour-flow entity or proven cross-entity relation |
| `yandex-data-centre-network` | Well-sourced data-centre damage, but the existing AI infrastructure/power entities are not established causal counterparts |

These are **not failures hidden by inventing a graph edge**. They remain visible in the Entity Connections directory with issue, claim and source links, where present. Closing them requires either evidence of a genuinely related existing entity or the registration of a new, correctly scoped counterparty with independent evidence.

## Reproduce the result

```bash
npm ci
npm test
node publisher/entity-connectivity-audit.js
```

The auditor creates `artifacts/entity-audit/connectivity.json` and `artifacts/entity-audit/isolated.tsv`. GitHub Actions publishes both as a downloadable artifact. The generated EN/UA System Map renders all registered entities and links and labels retrospective source review separately from newly reported physical system changes.
