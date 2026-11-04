# Editorial Atlas 2.0 — design contract (candidate)

Status: **candidate for cross-domain validation**, 2026-11-04. Based on WSB System Engraving 03.3.1; not a site-wide redesign approval.

## Editorial sequence

1. **Physical substrate**: a verified object or a factual process description. Physical engravings are only rendered from a reviewed, independently exported Draw Beautiful SVG with provenance and QA; no substitute image or illustrative stock art.
2. **System mechanisms**: expose a dependency as named actors, inputs, bottlenecks, alternatives and downstream effects. Keep entities and relations distinct.
3. **Leverage and adaptation**: explicitly mark what changes bargaining power, what an alternate path can and cannot replace, and the time horizon.
4. **Evidence register**: date every claim, link specific source IDs, classify observed / reported / forecast / claim, distinguish event dates from publication, mark unknowns and incompatible measurement bases.

## Visual grammar

- Editorial cream #F3EBDD, ink #232523, constraint red #A2362A, alternative/related dependency blue #46697A.
- Typography: heavy sans for thesis, monospace for IDs and labels, serif for explanation.
- Top band: physical object + compact dependency architecture, **not** two unrelated infographics.
- Middle band: the leverage / substitutability thesis.
- Bottom band: evidence, caveats, source IDs, time horizons and measurement bases.
- Desktop grid may divide columns; on narrow screens reflow into one column. No decorative overflow, cropping of key objects, or required horizontal scrolling for text.
- Line width and length **never** implicitly encode capacity; to encode a numeric quantity, supply a documented unit, period and explicit quantitative scale.
- Sources are legible, secondary but individually clickable.
- EN and UA labels/constraints are mandatory in structured data. Source-language titles can remain original as proper titles.
- Preserve genre distinction: READ editorial narrative; SYSTEM analytical relationships; POSTER autonomous visual composition. Shared navigation, tokens and citation contracts do not force uniform layouts.

## Relation grammars

Choose the graph grammar from **edge semantics**, not from the last page's illustration.

| Grammar | Topology | What the arrows mean | Pilot |
| --- | --- | --- | --- |
| `FLOW / BYPASS` | Parallel and alternative physical paths | Route options, distinct capacities and constraints. Never imply equivalence with equal strokes. | Hormuz 03.3.1 |
| `CHAIN / BOTTLENECK` | Directed consecutive edges | Critical input → integration → downstream use; connectors must join distinct nodes. | EUV ZEISS SMT → ASML → advanced chipmaking |
| `NETWORK / LEVERAGE` | Multiple intersecting edges | Source-bound multiplex dependencies and uneven control; no implied hierarchy from display order. | Future validation required |

A route is not a supply-chain stage, and consecutive stages are not alternatives. In CHAIN every arrow must come from an explicit, sourced `edges[]` record and the display must preserve its `from → to` direction. EN and UA labels and source IDs are mandatory for every edge. Do not convert `single_source` to a claim of absolute technical impossibility to substitute without evidence.

When a reviewed physical engraving is unavailable, the physical panel may use a **source-linked textual process sequence** with clear status metadata, not a counterfeit engraving or an oversized placeholder. The process sequence is explanatory, not a literal machine blueprint.

## Cross-domain pilot

Semiconductor equipment is the negative-space test: an EUV tool contains a critical optical subsystem supplied by ZEISS SMT, but **no approved Draw Beautiful EUV tool engraving exists**. Therefore the pilot must show an explicitly labelled *physical-object pending* area with factual description, **not a simulated engraving**.

Test mechanism: optical subsystem (ZEISS SMT) → integrated lithography scanner (ASML) → semiconductor fabrication. The relationship is a supply dependency, not a claim that all chips worldwide depend on EUV. ASML describes ZEISS SMT as the sole supplier of critical optical components, with lithography-system production limited by ZEISS capacity. DUV alternatives are not asserted to be functionally equivalent to EUV.

## Adoption gates

1. Unit tests for bilingual coverage, source referential integrity and no invented physical asset.
2. Build on main and browser screenshots at desktop + mobile, plus overflow and source-link inspection.
3. User approval of visual quality on two distinct systems before adopting Atlas 2.0 globally.
4. Only then derive reusable shared shell/components and migrate READ/SYSTEM/POSTER/archive/entities in reviewed batches.

Primary evidence:
- ASML 2024 20-F: https://www.sec.gov/Archives/edgar/data/937966/000093796625000009/asml-20241231.htm
- ASML optics explainer: https://www.asml.com/en/technology/lithography-principles/lenses-and-mirrors
- ASML EUV manufacturing partners: https://www.asml.com/en/company/stories/2022/making-euv-lab-to-fab
