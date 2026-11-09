# System Ledger v1.1 — Dependency Evolution (contract)

Status: implementation contract / first vertical slice. This document does **not** certify a physical transition or production deployment.

## Purpose

The existing append-only bilingual assessments (`knowledge/dependency-assessments.json`) record dated knowledge. v1.1 must distinguish changes **in evidence** from changes **in physical dependency**. Never infer physical change merely from a new issue, a new estimate, or movement between separate product categories.

## Model

Retain all v1 records and IDs unchanged. Future transition records are separate append-only objects:

- `id`, `entity_slug`, `observed_at`, `effective_at` (nullable), `issue_id`
- `from_state` / `to_state` (nullable when not observed)
- `change_class`: `knowledge_update` | `physical_transition`
- `direction`: `persistent` | `strengthening` | `weakening` | `substituting` | `disrupted` | `unknown`
- `claim_ids` and `source_ids` pointing to canonical evidence in that issue
- `reason.en` / `reason.ua`; `caveat.en` / `caveat.ua`
- `leverage_delta` / `rent_delta`: `unknown` unless measured or explicitly sourced
- `substitution_horizon`: `unknown` unless the source establishes a scope and bounds
- `supersedes`: prior transition IDs only when an actual revision is evidenced

### Gate: physical transition

Require an explicit canonical claim with `status=confirmed_delta`, same entity, and source evidence establishing the physical before/after. A reported estimate, editorial synthesis, or source publication date never passes this gate. On uncertainty, record a knowledge update with `direction=unknown`; do not silently classify it as `persistent`.

### Time discipline

Display publication/observation date separately from the event/effective date. Never show September–October measurements as changes occurring on November 6. No ordering inference between events that have only the same reporting date.

### Timeline presentation

On entity pages, show source-linked assessment history, followed by an explicit state-change timeline. If none is verified, show bilingual `No confirmed dependency transition / Підтверджених переходів залежності немає`. Leave unknown substitution and rent visible, not blank. An interactive timeline must remain accessible without JavaScript.

## WSB-0040 baseline (6 November 2026)

- `DPA-0040-GLOBAL-OIL-BALANCE`: JPMorgan retrospective September/October crude-market surplus estimates; *knowledge_update*, no evidenced infrastructure transition. `WSB-0040-CLM-01/03`, `SRC-01`.
- `DPA-0040-REFINED-PRODUCTS-GAP`: preliminary October Gulf tanker-tracking: crude and condensate 14.0m b/d (~86% pre-war), products 3.1m b/d (just over half normal); **different denominators**. *knowledge_update*, not a measured refinery repair or rerouting. `WSB-0040-CLM-02`, `SRC-01/02`.
- Both observations have `direction=unknown` until an evidence-backed before/after exists; `confirmed_delta=0`. Do **not** manufacture `52%` or `55%` from “just over half”.
- The chain `global-oil-balance → gulf-oil-flow → refined-products-bottleneck` is an analytical **dependency sequence**, **not** a dated physical transition series.

## Implementation order / acceptance

1. Add a strict transition schema and validator that fails closed on missing canonical refs, ungrounded changes, missing translation, duplicate IDs, reversed chronology and fabricated horizons.
2. Add fixture-based unit tests: accepted knowledge update; rejected unsourced physical transition; rejected fake product percentage; rejected misplaced event date; valid successive observations without changing history.
3. Integrate bilingual entity timeline and links into `publisher/build-dependency-ledger.js` without modifying v1 assessments.
4. Add Chromium checks for `/en/ledger/dependencies/` and `/ua/ledger/dependencies/` plus entity pages at mobile/desktop widths.
5. Run `npm run build` and browser checks in CI; only then merge and verify the production Cloudflare route at deployed SHA. Never equate merged PR with published site.

## Invariants

Source and claim identities always resolve in the issue. The published view makes evidence-time vs event-time legible. A confirmed state change needs source-backed physical evidence. Absence of evidence remains `unknown`, not zero or persistent. Historical records remain append-only.
