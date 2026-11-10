# World System Brief — entity connectivity audit · 2026-11-10

## Scope and method

Complete canonical issue corpus WSB-0001–WSB-0042. The auditor reads **every** issue's `state.json`, `claims.json`, `evidence.json`, and `relations.json`, the entity registry and all dependency assessments.

Relations have two strictly separated levels:

- **Explicit:** directed relationships present in an issue `relations.json`. A recorded relationship is not automatically a physical change.
- **Contextual:** two entities share a dated source-backed claim or are directly supported by the same non-internal primary source addressing no more than three registered entities. This is **co-evidence, not causality**.
- **Isolated:** no qualifying entity-to-entity relationship in either layer. This does not imply real-world independence.

Internal `baseline` records, inherited state rolls, and omnibus supports are **excluded** as sources of contextual relationships. Those entries previously produced hundreds of meaningless pairwise associations.

## Final coverage

| Indicator | Count |
|---|---:|
| Registry before remediation | 90 |
| Historical missing identifiers registered | 5 |
| Registry after remediation | **95** |
| Entities observed in state histories | 69 |
| Entities anchored in claims | 81 |
| Entities supported by admissible external evidence | 70 |
| Entities touched by explicit relations | 45 |
| Entities touched by contextual associations | 52 |
| Entities in either relationship layer | **60** |
| Entities with no qualifying relationship | **35** |
| Dependency Ledger assessments covering unique entities | 6 |
| Unique explicit relation keys | 29 |
| Unique contextual association keys | 60 |
| Unknown entity-reference anomalies after fix | **0** |

Counts are from the CI-generated `connectivity.json` audit produced by `node publisher/entity-connectivity-audit.js`. The automatically updated map section `/{lang}/map/#entity-connections` renders **all 95 entities**, with direct biography links where dated observations exist, clearly separated relations, source links, and a filter for isolated records.

## Historical registration fixes

Five identifiers were referenced in the earliest canonical issues but absent from `knowledge/entities.json`. They are now registered:

- `gulf-crude-export-flow` — WSB-0001
- `gulf-of-oman-sts` — WSB-0001/0002
- `nvidia-china` — WSB-0001/0002
- `lng-canada-phase-2` — WSB-0002
- `pacific-lng-optionality` — WSB-0002 evidence

These are registry corrections, **not newly dated events**.

## Remaining entity-to-entity gaps

The following 35 registered entities remain without a qualifying explicit or shared-evidence relationship; they are still searchable in the directory and retain source/issue/claim links where available.

```text
adnoc-energy-buffer-depletion
ai-gas-turbine-capacity-bottleneck
aramco-hormuz-pipeline-expansion-plans
asml
cosco-zippel
estonia-grain-transit
europe-dispatchable-power-flexibility
forties-pipeline-strike-risk
gulf-shipping-risk-premium
hormuz-limpet-mine-ship-attack
hormuz-market-security-premium
hormuz-security-claims-weekend-persistence
hormuz-vessel-fire-claim-separation
india-hpcl-delivered-crude-contracts
indonesia-singapore-gas-supply-adjustment
iranian-seafarer-rescue-sri-lanka
lng-canada-upstream
maersk-container-freight-pricing
nextdc-uncontracted-data-centre-pauses
nord-stream-restart-option
nvidia-china
opec-december-2026-production-targets
opec7-november-output
riyadh-aramco-fire
saudi-crude-export-recovery
saudi-energy-attack-claims
shadow-fleet-shipping-services
siemens-ukraine-energy-cooperation
tsmc-rare-earth-equipment-substitution
uk-critical-minerals-resilience
ukraine-germany-energy-support
us-perm-tech-suspensions
world-bank-commodity-shock-outlook
yandex-data-centre-network
zeiss-smt
```

Closing these gaps needs **new documented, source-specific relationships**. Neither same-issue membership nor a source's inherited baseline state is sufficient. The map must never manufacture edges for completeness.

## Reproduction

```sh
npm ci
npm test
node publisher/entity-connectivity-audit.js
```

Outputs:

- `artifacts/entity-audit/connectivity.json` — machine-readable all-entity provenance audit, explicit and contextual edges, anomalies.
- `artifacts/entity-audit/isolated.tsv` — list of entities without qualifying links.
- GitHub Actions artifact `wsb-entity-connectivity-<sha>` — archive of both files.
