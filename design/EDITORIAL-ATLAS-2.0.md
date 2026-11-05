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
| `NETWORK / LEVERAGE` | Intersecting directed edges with shared nodes | Archived, sourced constraints, buffers and downstream consequences; no implied quantitative leverage. | WSB oil network / Issues 0009–0011 (candidate visual QA) |

A route is not a supply-chain stage, and consecutive stages are not alternatives. In CHAIN every arrow must come from an explicit, sourced `edges[]` record and the display must preserve its `from → to` direction. EN and UA labels and source IDs are mandatory for every edge. Do not convert `single_source` to a claim of absolute technical impossibility to substitute without evidence.

When a reviewed physical engraving is unavailable, the physical panel may use a **source-linked textual process sequence** with clear status metadata, not a counterfeit engraving or an oversized placeholder. The process sequence is explanatory, not a literal machine blueprint.

## Third pilot: oil network

The network case reuses **canonical** relations and evidence from issues WSB-0009 (2026-10-06), WSB-0010 (2026-10-07) and WSB-0011 (2026-10-08). It selects six sourced edges connecting seven registered entities: Hormuz constraint and East–West recovery support affect Gulf flows; downstream product bottlenecks are exposed and buffered by emergency stocks; oil balance is also constrained by offshore production disruption. The archived relationship is not newly independently verified by the visual component. Edge colors and direction reflect recorded predicates; node coordinates do not represent geography or measured leverage. Each relationship is accompanied by its issue/date and source IDs. No invented percentages, rent values, or substitutability horizons.

The graph is the *top register*; the corresponding physical context, leverage interpretation, and evidence listing remain distinct editorial registers. On mobile the network SVG may pan independently, while the full list of textual relationships must remain responsive and readable without horizontal scrolling.

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

## Shared component extraction — phase 1

The shared publisher module `publisher/atlas-primitives.js` owns the editorial palette, safe literal escaping, canonical numbered section headings and HTTPS-only source link rendering. All three tested grammars (FLOW / BYPASS, CHAIN / BOTTLENECK, NETWORK / LEVERAGE) use these evidence/typographic primitives while retaining their independent, source-specific relationship renderers. This deliberately changes no page layouts or approved SVGs.

Later phases can extract larger page registers and responsive shells only after desktop/mobile visual regression. Do not force a universal relation graph: FLOW, CHAIN and NETWORK have different semantics.

## Shared component extraction — phase 2

`publisher/atlas-layout.js` centralizes the editorial masthead, bilingual local navigation and four numbered register headings. Its small responsive CSS rules supplement grammar-specific composition. The three tested pages now consume the same structural shell and keep distinct routing / chain / network renderers. Header and navigational URLs are validated as local paths; source links remain the responsibility of `atlas-primitives.js`.

The phase does **not** port issue READ, SYSTEM, POSTER, the archive, or entity templates. It is a controlled extraction with bilingual output tests, not a site-wide release of Atlas 2.0.

## READ typography comparison — November 2026

Compare IBM Plex Sans Bold against Manrope ExtraBold on **the same** WSB-0038 EN/UA article. Both trials use IBM Plex Serif for reading text and IBM Plex Mono for evidence metadata, with identical editorial geometry and headline size (64px maximum). Preview-only routes: `/en|ua/atlas/read/0038/type/plex/` and `/en|ua/atlas/read/0038/type/manrope/`. The existing READ pilot and historical briefs remain unchanged. Google Fonts CSS is used **only for the test**; a production decision requires reviewed self-hosted WOFF2 files with verified Ukrainian Cyrillic and Latin subsets, license metadata, and visual review at mobile/desktop widths. The typographic hierarchy differs by genre: READ restrained; SYSTEM analytical; POSTER may be expressive.

## Approved production typography — 5 November 2026

User-selected heading family: **Manrope ExtraBold 800**. Editorial prose: **IBM Plex Serif 400**. Editorial metadata and evidence: **IBM Plex Mono 400 / 600 / 700**. READ retains the restrained 64px headline cap; SYSTEM remains analytical, and POSTER retains independent layout/scale. Published pages load locally copied Latin, Latin Extended, Cyrillic, and Cyrillic Extended WOFF2 files via Fontsource with original SIL Open Font License texts preserved. Font files are generated into `dist/assets/fonts` during Pages publishing; Google Fonts is not required for canonical production pages. Self-hosting is verified in CI by checking every requested subset before deployment. The historical Plex/Manrope trial pages remain comparative evidence, not the canonical implementation.

## Production typography — genre-scoped rollout (phase 3)

Production typography is deliberately scoped by the generated HTML page genre rather than applying global heading overrides. READ receives Manrope 800/IBM Plex Serif/IBM Plex Mono without changing its editorial measurements; SYSTEM and its visualization studies receive a smaller 78px maximum analytical headline and source metadata styling; the homepage wordmark is allowed to wrap rather than cause mobile horizontal overflow. Archive and entity registers retain their own layout. POSTER retains its authored, independent typography and composition. The original READ type comparison remains a true trial and is excluded from production-family overrides. The build annotates pages with `data-wsb-genre`; tests check classification and idempotence. Publication still requires UI review on real narrow and wide screens before any further global layout migration.

## Cross-study navigation — phase 4 (5 November 2026)

An EN/UA `/atlas/studies/` overview links the three distinct validated dependency grammars, preserving their original renderers and all source citations. Each study adds the same accessible cross-study navigation with its active genre identified: **FLOW / BYPASS** (Hormuz 03.3), **CHAIN / BOTTLENECK** (EUV optics) and **NETWORK / LEVERAGE** (oil relation graph). The hub also links the dependency map, canonical entity-history index and issue archive. These are *exploratory* connections, not claims that the studies refer to identical events, entities or measurements. Each study explicitly communicates its evidentiary boundary. No new system facts, source IDs, metrics, relations or entity records are created by navigation.

Next adoption gate: inspect published pages at desktop and narrow mobile widths, ensure navigation paths work in GitHub Pages deployment and do not alter the original relationship diagrams.

## Phase 5 — audited node-to-ledger bridges (5 November 2026)

FLOW / BYPASS now links the Hormuz and East–West route labels directly to their canonical, previously published entity histories, only when those histories actually exist. Habshan–Fujairah remains explicitly unlinked: there is no validated one-to-one match to a canonical issue-history entry. EUV's ZEISS SMT, ASML and downstream fab nodes are evidence-backed study nodes but do not yet have canonical System Ledger biographies; no fictional entries are generated.

NETWORK retains source-backed edges and allows SVG node links only when an actual published history exists. Each study has a generated bilingual entity-history register showing confirmed matching records, number of issues and first/last observed issue dates. Links point to the existing /entity/:slug/ pages, which retain their own source records. Absence of a link means the entity is not covered by the published ledger, not that the corresponding relationship is untrue. No issue source, claim or relation is added by this presentation layer.

Validation must use the assembled canonical issue-history index, not only the registry of possible entity slugs. Any unknown study node fails publication rather than silently routing to a guessed slug.

## Phase 6 — sourced structural profiles, without fabricated event histories

The EUV CHAIN study now has two registered canonical organization entities: `zeiss-smt` (`ENT-000079`) and `asml` (`ENT-000080`). The generic `fab` stage is **not** registered as an organization: it is a value-chain function, not a uniquely identifiable entity. `knowledge/structural-profiles.json` maps the two registered organizations to already sourced and bilingual EUV study nodes. Validation resolves all references against `knowledge/system-ledger-visual/euv-optics.json`, checks source URLs and required translations, and rejects any false assertion of a dated issue-history record.

Each entity has bilingual `/en|ua/structure/<slug>/` profiles with the exact study context, evidence links and an explicit **no issue history** boundary. The EUV CHAIN graph and its Ledger bridge now link the two named organizations to these profiles. No synthetic event, daily change (Δ), assessment, source, relation, or issue is created. Later canonical issue publication must earn a real dated history through the existing evidence workflow; structural context must never substitute for that process.

Further work: add an editorially reviewed identity and source approval process for new organization nodes; do not blindly auto-register inferred entities from diagrams.

## Phase 7 — reproducible knowledge history (5 November 2026)

Structural profiles are now re-rendered on every canonical publisher build from the full ordered issue corpus: `state.json`, `claims.json` and `evidence.json`. An entity enters its knowledge timeline **only** when an explicit `claims[].entity_ids` value resolves to its canonical ID/slug; undirected news mentions and synthetic matches are not inferred. Claim evidence must resolve to source IDs within the very same canonical issue and include valid HTTPS URLs and publication dates. Dated claims are rendered with their exact claim IDs, statuses, source IDs, issue references and source publication dates; no factual restatement or synthesized causal relation is introduced.

Every supported claim is classified as a **knowledge update**, unless a `confirmed_delta` claim also corresponds to an explicitly changed issue state object and a positive issue delta tally; inconsistent assertions fail publication. Immutable study snapshots retain their original date and sourced structural description while later issues accumulate alongside them. Zero matching claims is shown as an honest empty timeline; there are no synthetic ZEISS/ASML event histories. No new recurring scraper or source-monitoring service is introduced by this phase: the rebuild happens automatically when the normal WSB issue build executes, including the daily pipeline if it publishes a canonical new issue.

This is a first additive knowledge layer, not a replacement for full immutable revisions, editorial claim adjudication or a complete source-identity service.

## Phase 9 — editorial claim review desk (5 November 2026)

The publisher generates bilingual static review workbenches at `/en/editorial/reviews/` and `/ua/editorial/reviews/`, linked from the claims register. The priority queue is derived from canonical dated claims, their original evidence, the existing validated claim revision history, and *later* canonical issue evidence that explicitly mentions the same canonical entity via `supports[]`. Baseline/internal sources, malformed links, and unrelated entities are excluded. An entity-level match is an investigative lead only: it does not mean the later source addresses the same claim, much less confirms, qualifies or refutes it.

The editor may filter and search claims, open original and later source URLs, select a candidate later source and supply **both EN and UA reasons** to generate a local JSON review draft. The generated review is never saved or submitted automatically. The editor must verify the candidate really addresses the original claim, adjust the draft revision ID if necessary, obtain review, and submit a separate PR to `knowledge/claim-revisions.json`. The existing Phase 8 fail-closed validator determines whether any proposed record can be published. This is a publicly readable, client-only workbench; no authentication, hidden evidence, persistence, or autonomous adjudication is implied.

## First actual editorial review — Isaias production shut-ins

- Original claim: `CLM-261007-04`, WSB-0010, dated 2026-10-07. The contemporaneous assessment classified the approaching Gulf storm as a supply risk and reported no *confirmed loss in the evidence reviewed*; it did not demonstrate uninterrupted production.
- Later canonical evidence: `WSB-SRC-0011-01` (Reuters citing the US offshore regulator, published 2026-10-08) and `WSB-SRC-0011-02` (Reuters reporting Shell and Chevron curtailments, published 2026-10-08). Both appear in WSB-0011 and describe shut-ins already occurring on **2026-10-07**.
- Review: `REV-0011-CLM26100704`, `qualified` as of WSB-0011 (2026-10-08). The original report is not retroactively called false; later reporting resolves an earlier evidentiary uncertainty about the same day.
- Measured evidence: oil output shut in 25.08%, gas output shut in 16.37%. Neither permanent infrastructure damage nor equivalent loss of delivered supply is asserted.
- Reproducibility: revision stored append-only in `knowledge/claim-revisions.json`; originals in issue 0010 remain unchanged. Unit and end-to-end publication tests verify both localized claim pages and source IDs.

This case confirms the crucial difference between **event date**, **source publication date** and **editorial review date**, and demonstrates how WSB can correct its state of knowledge without inventing a separate physical transition.
