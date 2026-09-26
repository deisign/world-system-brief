# World System Brief — architecture.md

> **Technical architecture and decision record**
>
> Status: v0.1
>
> This document defines **how WSB runs**.
>
> `brain.md` — what WSB is.  
> `discourse.md` — how WSB speaks.  
> `schema/` — how WSB remembers the system.  
> **`architecture.md` — how the product is assembled, published, served, and evolved.**

---

# 1. Architectural objective

WSB is a small data platform with a publishing layer.

It is **not** primarily:

- a CMS;
- a news website;
- a blog;
- a React application;
- a collection of manually authored HTML pages.

The architecture should optimize for:

1. analytical integrity;
2. reproducibility;
3. immutable publication history;
4. fast static delivery;
5. graceful degradation;
6. bilingual EN/UA output;
7. simple operations;
8. low early-stage cost;
9. future professional/API products without an early rewrite.

---

# 2. Core architecture

```text
                     ┌───────────────────────┐
                     │     PUBLIC SOURCES    │
                     │ data · filings · news │
                     │ rules · statistics    │
                     └───────────┬───────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │       INGESTION       │
                     │        Python         │
                     └───────────┬───────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │  CLAIM / NORMALIZE    │
                     │ entity · relation     │
                     │ evidence · candidate Δ│
                     └───────────┬───────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │  REVIEW / VALIDATION  │
                     │ human + deterministic │
                     │ checks + LLM assist   │
                     └───────────┬───────────┘
                                 │
                                 ▼
              ┌──────────────────────────────────┐
              │          SYSTEM LEDGER           │
              │        PostgreSQL / Supabase     │
              │          LIVING STATE            │
              └───────────────┬──────────────────┘
                              │
                    snapshot / delta export
                              │
                              ▼
              ┌──────────────────────────────────┐
              │      IMMUTABLE SNAPSHOTS         │
              │          JSON + Git              │
              └───────────────┬──────────────────┘
                              │
                         build/render
                              │
                              ▼
              ┌──────────────────────────────────┐
              │       STATIC PUBLICATION         │
              │ HTML · CSS · JS · inline SVG     │
              │          EN + UA                 │
              └───────────────┬──────────────────┘
                              │
                              ▼
              ┌──────────────────────────────────┐
              │          CLOUDFLARE              │
              │ Workers + Static Assets + CDN    │
              └───────────────┬──────────────────┘
                              │
                              ▼
              ┌──────────────────────────────────┐
              │            READERS               │
              └──────────────────────────────────┘
```

---

# 3. The four-layer rule

The architecture separates four different kinds of truth.

## PostgreSQL = living state

PostgreSQL contains the current and historical analytical model.

It answers:

> What does WSB currently believe about the system, and how did that belief change?

## Git = reproducible history

Git contains:

- schema;
- pipeline;
- renderer;
- editorial rules;
- migration files;
- fixtures;
- canonical snapshots where appropriate;
- build configuration.

It answers:

> Which code, schema and editorial rules produced this artifact?

## JSON snapshot = machine-readable publication state

A snapshot freezes the relevant Ledger state for a publication.

It answers:

> What exact analytical state was used to produce this issue?

## HTML = human-readable publication artifact

The rendered Brief is immutable public output.

It answers:

> What did readers see?

Canonical shorthand:

> **Postgres = living state · Git = history · JSON = machine snapshot · HTML = human snapshot**

---

# 4. Hosting decision

## Decision

Use **Cloudflare** as WSB's public delivery/runtime platform.

Initial deployment target:

```text
Cloudflare Workers + Static Assets
```

Do not use GitHub Pages as the primary production architecture.

GitHub Pages remains acceptable for disposable experiments or emergency previewing.

## Why Cloudflare

WSB initially behaves like a static site but is expected to acquire dynamic capabilities:

- API endpoints;
- authentication;
- professional access;
- alerts;
- watchlists;
- saved views;
- redirects;
- edge logic;
- potentially cached API responses.

Cloudflare lets the project begin with static delivery without forcing a hosting migration when those capabilities appear.

---

# 5. Static-first rule

The public Daily Brief is static-first.

A published issue must **not require a live database request** to render.

Correct:

```text
Ledger
  ↓
snapshot
  ↓
build
  ↓
HTML
  ↓
Cloudflare CDN
```

Avoid:

```text
reader
  ↓
page
  ↓
API
  ↓
database
  ↓
render article
```

for published Daily issues.

---

# 6. Failure invariant

A critical architectural rule:

> **If PostgreSQL, Supabase, the ingestion pipeline, or the internal API is temporarily unavailable, already published WSB issues must continue to work.**

Published Briefs are static artifacts.

A database outage may prevent:

- new ingestion;
- new Ledger edits;
- new snapshots;
- new publication.

It must not remove yesterday's Brief from the web.

---

# 7. GitHub role

Canonical repository:

```text
deisign/world-system-brief
```

GitHub is the source-control and build-history authority.

GitHub contains:

- architecture;
- discourse rules;
- schemas;
- migrations;
- tests;
- renderer;
- site;
- pipeline;
- publication manifests;
- reproducibility metadata.

GitHub is **not** the production database.

GitHub is **not** the main runtime.

---

# 8. Cloudflare role

Cloudflare provides the public edge.

Initial responsibilities:

- static asset delivery;
- HTML delivery;
- TLS;
- custom domain;
- caching;
- redirects;
- language routing;
- canonical URL handling;
- deployment previews where useful.

Later responsibilities may include:

- API gateway;
- lightweight API routes;
- auth/session edge handling;
- rate limiting;
- alert endpoints;
- signed/professional content access;
- cache coordination.

Do not add dynamic Workers merely because they are available.

Static remains the default.

---

# 9. Database decision

Primary database:

```text
PostgreSQL
```

Preferred managed option:

```text
Supabase
```

Reasons:

- relational model fits Ledger semantics;
- strong constraints;
- temporal queries;
- JSONB where useful;
- mature tooling;
- easy migration path;
- auth/storage available later without requiring them now.

The architecture must remain sufficiently standard PostgreSQL that moving away from Supabase is possible.

Avoid proprietary coupling in core Ledger semantics.

---

# 10. Database exposure rule

The browser should never receive direct privileged database access.

Public flow:

```text
browser
  ↓
static artifact
```

Dynamic future flow:

```text
browser
  ↓
Cloudflare / API
  ↓
application authorization
  ↓
PostgreSQL
```

Never:

```text
browser
  ↓
service-role database credential
```

---

# 11. API architecture

Internal boundaries should be API-shaped even before a public API exists.

Candidate resources:

```text
/api/entities
/api/relations
/api/events
/api/state
/api/delta
/api/history
/api/evidence
/api/snapshots
```

Initial implementation may be:

- Python functions;
- CLI commands;
- FastAPI routes used internally.

The conceptual boundaries matter more than exposing HTTP immediately.

---

# 12. FastAPI role

Preferred application/API layer:

```text
FastAPI
```

Use it when an actual service boundary is needed.

Possible future responsibilities:

- professional Ledger queries;
- internal editorial UI;
- search;
- history queries;
- evidence retrieval;
- alerts/watchlists;
- export;
- API product.

Do not put FastAPI in the critical path of already published static Daily pages.

---

# 13. Python role

Python is the primary data/pipeline language.

Responsibilities:

```text
ingestion
source parsing
claim extraction
normalization
entity matching
candidate event detection
candidate Δ detection
validation
snapshot generation
data QA
fixture generation
publication orchestration
```

LLM calls, where used, belong inside controlled pipeline stages.

---

# 14. LLM architecture

LLMs assist analysis.

They do not become the authoritative database.

Preferred:

```text
source
  ↓
LLM extraction
  ↓
structured candidate
  ↓
validation
  ↓
review
  ↓
Ledger mutation
```

Avoid:

```text
source
  ↓
LLM
  ↓
automatic authoritative state mutation
```

for material structural Δs.

The system must preserve enough provenance to answer:

> Why did this state change?

---

# 15. Renderer

The Daily renderer consumes structured snapshot data.

Input:

```text
snapshot JSON
+ localized editorial content
+ symbol grammar
+ renderer version
```

Output:

```text
EN HTML
UA HTML
```

The renderer must not invent analytical facts.

It formats existing structured analysis.

---

# 16. Daily HTML

Each Daily issue should be capable of existing as one self-contained HTML artifact.

Preferred characteristics:

- inline critical CSS;
- small vanilla JS;
- inline SVG;
- embedded issue metadata;
- responsive;
- printable;
- accessible;
- offline-readable after download;
- no required client framework.

External fonts are not required for v0.1.

System fonts first.

A future brand font can be embedded or served deliberately.

---

# 17. JavaScript rule

Use JavaScript for interaction, not basic legibility.

Without JavaScript, a Brief should still expose:

- headlines;
- summaries;
- Δs;
- tables;
- evidence links;
- core diagrams.

JS may enhance:

- filters;
- 7D / 30D / 90D switching;
- disclosure panels;
- sparklines;
- node exploration;
- evidence drawers.

Progressive enhancement is preferred.

---

# 18. SVG rule

Use inline SVG for:

- system maps;
- flow arrows;
- small charts;
- bottleneck diagrams;
- sparklines;
- relation diagrams.

Avoid bitmap assets for information graphics when SVG or Unicode can express the same structure.

This supports:

- crisp rendering;
- print;
- responsive layouts;
- dark/light adaptation later;
- self-contained artifacts.

---

# 19. Unicode-first grammar

Core system meaning should remain understandable with text + Unicode.

Examples:

```text
⇢ FLOW
⇄ INTERDEPENDENCE
× BOTTLENECK
↑ STRENGTHENING
↓ WEAKENING
→ NO MATERIAL CHANGE
Δ STATE CHANGE
⧖ SUBSTITUTION HORIZON
↪ BYPASS
§ REGULATION
◇ RENT
```

SVG enhances the model.

It must not be the only carrier of meaning.

---

# 20. Site architecture

The main WSB site is a **current system-state interface**, not an article feed.

Likely routes:

```text
/en/
/ua/

/en/brief/2026-09-26/
/ua/brief/2026-09-26/

/en/system/rare-earths/
/ua/system/rare-earths/

/en/relation/china-eu-ev/
/ua/relation/china-eu-ev/

/en/bottleneck/advanced-lithography/
/ua/bottleneck/advanced-lithography/

/en/ledger/...
/ua/ledger/...
```

Language codes are explicitly:

```text
en
ua
```

Do not normalize `ua` to `uk`.

---

# 21. Main site framework

Probable choice:

```text
Astro
```

Reason:

- static-first;
- content/data-friendly;
- produces simple HTML;
- allows selective interactivity;
- avoids forcing a full SPA;
- good fit for Cloudflare.

This remains a provisional decision until the first real HTML prototype is built.

If plain HTML generation proves simpler, do not adopt Astro merely for architectural fashion.

---

# 22. No-SPA default

Do not build WSB as a single-page application by default.

Reasons:

- Daily issues are documents;
- permanent URLs matter;
- SEO matters;
- print matters;
- offline readability matters;
- long-term archival stability matters;
- JS failure should not destroy content.

Interactive components may exist without making the whole product an SPA.

---

# 23. Bilingual build

One analytical Brief produces two public artifacts.

```text
snapshot
   │
   ├── editorial EN
   │       ↓
   │   /en/brief/date/
   │
   └── editorial UA
           ↓
       /ua/brief/date/
```

Both share:

- issue ID;
- snapshot ID;
- event IDs;
- relation IDs;
- state-change IDs;
- numerical data;
- confidence;
- publication state.

They differ in reader-facing language.

---

# 24. Snapshot format

Each publication produces a canonical machine snapshot.

Example:

```text
snapshots/
  2026/
    09/
      2026-09-26.json
```

Conceptual payload:

```json
{
  "issue_id": "WSB-2026-09-26",
  "generated_at": "...",
  "ledger_snapshot_id": "...",
  "schema_version": "...",
  "pipeline_version": "...",
  "renderer_version": "...",
  "git_commit": "...",
  "changes": [],
  "relations": [],
  "constraints": [],
  "evidence": []
}
```

Exact schema belongs in a dedicated snapshot specification.

---

# 25. Immutable publication rule

Once an issue is published:

- its snapshot is immutable;
- its public HTML is immutable except for clearly marked technical corrections;
- later analytical corrections create new Ledger history;
- old publication history is not silently rewritten.

If a serious factual correction is required, preserve:

- original publication;
- correction record;
- corrected rendering/version;
- explanation.

Never pretend the original state did not exist.

---

# 26. Build metadata

Every generated issue should embed:

```text
issue_id
publication_date
generated_at
snapshot_id
schema_version
pipeline_version
renderer_version
git_commit_sha
language
```

This metadata may be visible partly in the UI and fully in machine-readable form.

---

# 27. Deployment flow

Initial target:

```text
commit to main
      ↓
GitHub Actions
      ↓
tests
      ↓
snapshot validation
      ↓
render
      ↓
build site
      ↓
deploy to Cloudflare
```

Publication should eventually be separable from ordinary code merge.

A code commit must not accidentally publish an unfinished Daily.

Likely later model:

```text
editorial approval
      ↓
publication manifest/status
      ↓
release workflow
```

---

# 28. CI gates

Before production deployment:

```text
schema tests
fixture tests
snapshot validation
broken-link checks
EN/UA completeness
semantic parity checks where automatable
HTML validation
accessibility smoke checks
anti-lexicon lint
```

Not all gates need to exist on day one.

The architecture should leave room for them.

---

# 29. Preview deployments

Every substantial site/rendering change should be previewable before production.

Preview must make it possible to inspect:

- desktop;
- mobile;
- EN;
- UA;
- no-JS rendering;
- print layout;
- long headlines;
- missing translation behavior.

Cloudflare preview environments or equivalent deployment previews should be used where practical.

---

# 30. Caching

Published Daily artifacts are ideal for aggressive CDN caching.

Immutable assets can use long cache lifetimes.

Current-state pages may use shorter cache periods.

Future API responses should have cache policy based on semantics:

```text
historical snapshot → highly cacheable
current state        → moderately cacheable
editorial draft      → private/no-store
authenticated data   → access-aware
```

---

# 31. Search

Do not add a dedicated search platform until corpus size justifies it.

Early options:

- static generated index;
- PostgreSQL full-text search;
- lightweight API search.

Later, if necessary:

- specialized search service.

Search architecture should support:

```text
entity
relation
event
bottleneck
flow
date
source
```

not merely article keywords.

---

# 32. Authentication

No authentication required for initial public Daily.

Future Professional layer may require:

- user accounts;
- organizations;
- entitlements;
- saved views;
- alerts;
- API keys.

Supabase Auth is a plausible option.

Do not couple public static publication to authentication.

---

# 33. Professional product boundary

Free layer:

```text
Daily Brief
public system pages
limited history
email/social distribution
```

Professional layer:

```text
full Ledger
history
filters
alerts
watchlists
exports
saved views
```

Institutional layer:

```text
teams
API
sector dashboards
custom watchlists
integrations
internal-data overlays
```

Architecture should permit these layers without requiring the Daily to become dynamic.

---

# 34. Alerts

Alerts subscribe to **state changes**, not keywords.

Correct trigger:

```text
relation R:
substitutability LOW → MEDIUM
```

Not:

```text
new article contains "rare earths"
```

Future alert pipeline:

```text
validated Δ
   ↓
subscription matcher
   ↓
delivery queue
   ↓
email / other channel
```

---

# 35. Observability

Initial system should at least log:

- ingestion runs;
- source failures;
- extraction failures;
- Ledger writes;
- snapshot builds;
- render failures;
- deploy status.

Later add:

- structured logs;
- metrics;
- alerting;
- pipeline latency;
- source freshness;
- translation completeness;
- failed watch conditions.

Avoid observability infrastructure heavier than the application itself.

---

# 36. Secrets

Secrets must never enter:

- repository;
- generated HTML;
- public snapshot JSON;
- browser bundle;
- logs.

Use:

- GitHub Actions secrets;
- Cloudflare secrets;
- managed database secrets.

Rotate credentials independently of published artifacts.

---

# 37. Backups

PostgreSQL needs managed backups.

But database backup alone is insufficient.

WSB has several recoverable layers:

```text
Git history
+ migrations
+ snapshots
+ published HTML
+ database backups
```

This is intentional redundancy.

A catastrophic database loss should not erase the historical public record.

---

# 38. Reproducibility target

Given:

- a snapshot;
- renderer version;
- discourse/versioned editorial content;
- build configuration;

we should be able to reproduce a materially equivalent published Brief.

Pixel-perfect historical browser rendering is not required.

Analytical equivalence is.

---

# 39. Versioning

Track at least:

```text
schema_version
pipeline_version
snapshot_version
renderer_version
discourse_version
```

Do not necessarily create separate packages for each.

The purpose is provenance.

---

# 40. Repository direction

Provisional structure:

```text
world-system-brief/
├── brain.md
├── discourse.md
├── architecture.md
├── README.md
│
├── docs/
│
├── schema/
│   ├── system-ledger-v0.1.md
│   ├── system-ledger-v0.2.md
│   └── 001_initial.sql
│
├── pipeline/
│
├── renderer/
│
├── site/
│
├── snapshots/
│
└── tests/
```

Do not create empty directories simply to satisfy this diagram.

Create them when real code/data arrives.

---

# 41. Infrastructure we explicitly do not need yet

Do not introduce without demonstrated need:

```text
Kubernetes
Kafka
microservices
Neo4j
Elasticsearch
Redis
vector database
event-sourcing framework
GraphQL
full React SPA
service mesh
Terraform empire
```

Some may eventually become useful.

None are architecture badges.

---

# 42. Graph question

WSB is conceptually graph-shaped.

That does **not** mean it needs a graph database.

PostgreSQL can represent:

- entities;
- relations;
- nodes;
- constraints;
- migrations;
- histories.

Use recursive queries/materialized views where needed.

Only consider a graph database if real query patterns become materially painful in PostgreSQL.

---

# 43. Vector question

Embeddings may later help:

- source similarity;
- claim matching;
- entity resolution;
- duplicate detection;
- research retrieval.

They are not part of authoritative system state.

If added, vectors are an **assistive index**, not truth storage.

---

# 44. Data portability

Core Ledger data should be exportable to:

```text
JSON
CSV
SQL
```

where semantics permit.

Permanent analytical IDs should survive platform changes.

The WSB archive must not become hostage to one SaaS vendor.

---

# 45. Cost principle

Early WSB should be cheap to operate.

Spend money where it buys:

- reliable data;
- analytical time;
- source access;
- database reliability;
- useful model inference.

Do not spend it on infrastructure complexity whose primary function is looking serious.

---

# 46. Security principle

Public WSB content is public.

Editorial pipeline and unpublished Ledger changes are not.

Separate:

```text
public artifacts
internal analytical state
credentials
draft editorial content
professional user data
```

Future professional features require explicit authorization boundaries.

---

# 47. Current-state pages

Unlike immutable Daily pages, current system pages represent the latest Ledger state.

Possible build models:

### A. regenerate statically after every material Δ

Preferred initially.

### B. edge/API-render selected dynamic fragments

Possible later.

Default:

> regenerate rather than dynamically query until latency requirements prove otherwise.

---

# 48. Publication latency

WSB does not need millisecond publication.

Correctness beats immediacy.

Pipeline may be:

```text
detect
→ verify
→ model
→ review
→ snapshot
→ render
→ publish
```

Do not sacrifice the event/Δ distinction to compete with breaking-news latency.

---

# 49. Domain

Production should use a dedicated WSB domain.

Exact domain is a separate product decision.

Requirements:

- Cloudflare-managed DNS preferred;
- HTTPS;
- canonical EN/UA routing;
- stable permanent URLs;
- redirects under our control;
- domain independent from GitHub/Supabase vendor URLs.

---

# 50. Architecture decision record

## ADR-001 — Cloudflare for public delivery

**Decision:** Cloudflare Workers + Static Assets.

**Reason:** static-first today, dynamic edge capability tomorrow, without hosting migration.

## ADR-002 — GitHub is source/history, not runtime

**Decision:** canonical code and reproducibility history live in GitHub.

## ADR-003 — PostgreSQL is the authoritative living Ledger

**Decision:** standard PostgreSQL semantics; Supabase preferred managed provider.

## ADR-004 — published Daily is static

**Decision:** no live database dependency for reading published issues.

## ADR-005 — snapshots are immutable

**Decision:** every publication binds to a machine-readable snapshot.

## ADR-006 — bilingual artifacts share analytical identity

**Decision:** EN and UA render from one structural issue/snapshot.

## ADR-007 — static-first, progressive enhancement

**Decision:** HTML remains useful without JS.

## ADR-008 — no infrastructure theatre

**Decision:** add systems only in response to demonstrated constraints.

---

# 51. First implementation milestone

Build one genuine Daily WSB issue end-to-end:

```text
structured fixture
      ↓
snapshot JSON
      ↓
renderer
      ↓
EN HTML + UA HTML
      ↓
Cloudflare preview
```

The first milestone does **not** require:

- production database ingestion;
- authentication;
- API product;
- alerts;
- search service.

It proves the publication architecture.

---

# 52. Second implementation milestone

Implement System Ledger schema v0.1:

```text
PostgreSQL
+ migrations
+ fixtures
+ seven schema tests
```

Then replace the hand-authored fixture with an actual Ledger snapshot.

---

# 53. Third implementation milestone

Connect:

```text
Ledger
→ snapshot generator
→ renderer
→ Cloudflare deployment
```

At that point WSB has a real spine.

---

# 54. Architecture invariant

The system should remain understandable by one technically capable person.

If explaining how a Daily Brief gets from evidence to the reader requires a distributed-systems diagram with twenty services, we have probably failed.

The desired path remains:

```text
EVIDENCE
  ↓
LEDGER
  ↓
SNAPSHOT
  ↓
HTML
  ↓
CLOUDFLARE
  ↓
READER
```

Everything else must justify its existence.
