# Hormuz dependency evolution: retrospective audit, 31 October–6 November 2026

**Scope:** WSB-0034 through WSB-0040. This audit checks previously recorded canonical issue states and source-linked claims. It is **not** a new event report and does not create additional dependency assessment or physical-transition entries.

| Issue / date | Dated observation | Canonical claim | Classification |
|---|---|---|---|
| WSB-0034 · 2026-10-31 | 30 October tanker-fire statements remained independently unverified | WSB-0034-CLM-01 · SRC-01 | evidence_update |
| WSB-0035 · 2026-11-01 | OPEC+ December targets maintained; reported Gulf export disruption cannot be converted into new output | WSB-0035-CLM-01 · SRC-01 | evidence_update |
| WSB-0036 · 2026-11-02 | ADNOC executive estimates on inventories and shipping costs, not independently measured new flows | WSB-0036-CLM-01 · SRC-01 | evidence_update |
| WSB-0037 · 2026-11-03 | Aramco statement about work on bypass pipeline expansion; not new commissioned capacity | WSB-0037-CLM-01 · SRC-01 | evidence_update |
| WSB-0038 · 2026-11-04 | IRGC mine/tanker statements not independently verified | WSB-0038-CLM-01 · SRC-01 | evidence_update |
| WSB-0039 · 2026-11-05 | Distinguish unverified IRGC claims from separate UKMTO-reported tanker incident north of Qatar | WSB-0039-CLM-03/04 · SRC-04/05/06 | evidence_update |
| WSB-0040 · 2026-11-06 | September–October oil balance estimates and October Gulf crude/products divergence | WSB-0040-CLM-01/02/03 · SRC-01/02 | evidence_update |

All seven published canonical `state.json` snapshots have `summary.confirmed_delta=0`. The carried `hormuz` object remains `persistent_navigation_constraint` with `change=stable`; **this is carried state**, not seven independently reverified physical observations.

**Model consequence:** We have a chronology of evidence and an analytical chain, **not** evidence for a seven-step structural transition. Do not label the sequence as weakening/strengthening of a specific actor's leverage without new evidence. For 6 November, the append-only `knowledge/dependency-transitions.json` contains two observation updates, `direction=unknown`. Product volumes refer to different denominators; the refined-product recovery is reported only as “just over half,” never a fabricated exact percentage.

**Next evidence gate:** To claim an actual change in corridor substitutability or throughput, obtain dated, source-linked before/after figures for the *same* infrastructure/flow and establish `confirmed_delta` in canonical claims; then add a physical transition entry. Until then, keep `effective_at=null`, and unknown leverage/rent/horizon explicit.

**Primary reference:** canonical `issues/0034`–`issues/0040` claims/evidence/state bundles. Relevant publication links and dates are in each issue's `evidence.json`; no URL is reconstructed here.
