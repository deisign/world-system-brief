# World System Brief — brain.md

> Working memory, product thesis, methodology, and architectural contract for **World System Brief (WSB)**.
>
> Status: **v0.1 / founding document**
>
> Core rule: **If the arrow didn't move, it isn't the story.**

---

## 1. What this product is

**World System Brief** is not a news digest, not a geopolitical newsletter, and not a collection of explainers.

It is a continuously updated model of the world economy that tracks **structural change** across:

- flows,
- dependencies,
- bottlenecks,
- substitutability,
- leverage,
- rents,
- adaptation,
- bypasses,
- and the migration of bottlenecks through networks.

The public-facing Daily Brief answers:

> **What changed in the world system since the previous state?**

The underlying **System Ledger** answers:

> **What is the current state of a dependency, how did it change over time, and what evidence supports each change?**

The product should make it possible to distinguish:

- a loud event from a structural event;
- a new headline from a changed dependency;
- rhetoric from an actual shift in access, substitutability, leverage, or rent capture.

---

## 2. Product thesis

Traditional daily news asks:

> What happened?

WSB asks:

> What did what happened change in the structure of the world system?

The core analytical sequence is:

**flow → dependence → bottleneck → leverage → rent → adaptation**

A second-order principle is equally important:

> **Bottlenecks migrate through networks.**

A constraint removed at one node may create concentration, congestion, regulatory exposure, or dependence at another.

The product therefore tracks not just bottlenecks, but their movement.

---

## 3. Intellectual foundation

WSB combines several analytical traditions without treating any of them as doctrine:

- world-systems analysis;
- global value chain analysis;
- network theory;
- chokepoint analysis;
- political economy of rent;
- industrial policy;
- supply-chain resilience;
- economic statecraft;
- weaponized interdependence.

The relevant modern synthesis is:

> **Global value chains + network power + bottlenecks + rents + temporal state tracking.**

The system can concentrate power without requiring a hidden global director.

WSB must therefore avoid conspiracy-style personification of structures.

Whenever a claim resembles “X controls Y,” ask:

1. Which exact node, institution, infrastructure, standard, market, or protocol?
2. What flow passes through it?
3. How substitutable is it?
4. Over what time horizon?
5. What enforcement mechanism exists?
6. Who captures the resulting rent?
7. What bypasses exist or are developing?

---

## 4. Editorial doctrine

### 4.1 Primary rule

> **If the arrow didn't move, it isn't the story.**

A news item belongs in the Daily Brief only if it changes at least one of:

- an arrow;
- a node;
- a dependency;
- a bottleneck;
- substitutability;
- substitution horizon;
- leverage;
- rent distribution;
- access;
- a bypass/adaptation route.

An event may still enter the evidence layer even if it does not qualify for the Daily Brief.

### 4.2 No headline recycling

Do not recycle yesterday's story merely because a new article appeared.

If the underlying state did not change:

- update evidence;
- keep the Ledger state unchanged;
- mention it only when continued persistence itself is analytically important.

### 4.3 Noise check

Every major high-profile geopolitical story should be eligible for a simple question:

> **Did it change the system?**

Possible outputs:

- **STRUCTURAL CONSEQUENCE DETECTED**
- **NO SYSTEM CHANGE DETECTED**
- **DEVELOPING / EVIDENCE INSUFFICIENT**

Internal maxim:

> **Track the arrow, not the speech.**

---

## 5. The atomic unit: Δ

The true atomic unit of WSB is not the article.

It is the **state change**.

Example:

```text
relation: China → EU
domain: critical minerals
node: refining
dependency: HIGH
substitutability: LOW
leverage_holder: China
```

A new event may cause:

```text
leverage: HIGH → VERY HIGH
```

That transition is a **Δ**.

A Daily Brief is a curated set of meaningful Δs.

---

## 6. The System Ledger

The **System Ledger** is the core asset.

For each meaningful relation or system line, record:

- date / timestamp;
- flow;
- entities;
- dependency;
- bottleneck;
- substitutability;
- substitution horizon;
- leverage;
- rent distribution;
- adaptation / bypass route;
- confidence;
- supporting evidence;
- current status.

Possible statuses:

- developing;
- confirmed;
- stable;
- persistent;
- weakening;
- strengthening;
- reverted;
- superseded;
- resolved;
- uncertain.

The Ledger must support time series.

Example:

```text
Rare-earth refining / China → EU

2026-09-24  leverage CN ↑
2026-09-25  leverage CN →
2026-09-26  bottleneck persistent
2026-10-03  bypass capacity developing
```

The value of the product increases with continuity.

After six months, WSB should contain approximately 180 sequential system snapshots.

After several years, the archive becomes a temporal knowledge graph / structured historical dataset.

---

## 7. Evidence history vs system-state history

These are distinct and must never be collapsed.

### Evidence history

What information was available, from which source, and when.

### System-state history

What WSB believed the state of the system to be at that moment.

If later evidence corrects earlier evidence, do **not** silently rewrite the past.

Example:

```text
20 SEP
state = X
evidence = A

01 OCT
A superseded by B
state X → Y
reason = correction
```

Historical state must remain reconstructable.

This is essential for:

- research integrity;
- auditability;
- reproducibility;
- commercial value of the archive.

---

## 8. Evidence model

Raw material comes from sources such as:

- Reuters;
- Bloomberg;
- Financial Times;
- official government and regulator documents;
- WTO;
- IMF;
- OECD;
- World Bank;
- IEA;
- customs data;
- industry associations;
- corporate filings;
- company announcements;
- sector-specific reports;
- credible specialist publications.

The conceptual evidence pipeline is:

```text
SOURCE
  ↓
CLAIM
  ↓
DATE
  ↓
ENTITY / RELATION
  ↓
CONFIDENCE
```

A factual claim is not automatically a system event.

Evidence can accumulate without changing Ledger state.

---

## 9. Analytical questions for every candidate event

For each candidate structural event, answer:

1. **What flows?**
   - goods;
   - capital;
   - energy;
   - technology;
   - data;
   - labour.

2. **Who depends on whom?**

3. **Where is the bottleneck?**

4. **How substitutable is it?**

5. **What is the substitution horizon?**

6. **Who gains or loses leverage?**

7. **Who captures the rent?**

8. **What adaptation or bypass is emerging?**

9. **Did the bottleneck move?**

10. **Is this actually a new Δ, or just new evidence about an unchanged state?**

---

## 10. Daily Brief

The Daily Brief is the human-readable daily interface to the Ledger.

Target reading time:

**5–7 minutes.**

Each issue should be a **self-contained interactive HTML document**.

Core sections:

### 10.1 SYSTEM DELTA

A compact summary such as:

```text
3 SYSTEM SHIFTS
2 BOTTLENECKS MOVED
1 NEW BYPASS
4 LEVERAGE CHANGES
```

These counts should ultimately be derived from Ledger data rather than invented editorially.

### 10.2 SHIFTS

Compact structural cards:

- domain;
- flow;
- bottleneck;
- leverage change;
- substitution;
- state.

### 10.3 SYSTEM MAP

A relational diagram showing relevant nodes and arrows.

Not necessarily geographic.

Example:

```text
CHINA ⇢ UK ⇄ EU
```

### 10.4 BOTTLENECK WATCH

A persistent watchlist with trend and recent history.

Possible horizons:

- 7D;
- 30D;
- 90D;
- ALL.

### 10.5 CHAIN OF THE DAY

A full chain from upstream to market.

Example:

```text
Mine
  → Concentrate
  → Refining
  → Component
  → Assembly
  → Origin test
  → Procurement / subsidy
  → Market
```

Show where:

- concentration exists;
- technology matters;
- regulation enters;
- rents are captured.

### 10.6 WEAPONIZED INTERDEPENDENCE

Track only actual changes in network access or coercive infrastructure, including:

- sanctions;
- export controls;
- tariffs;
- payment rails;
- standards;
- investment restrictions;
- public procurement;
- licensing;
- infrastructure access.

### 10.7 NOISE CHECK

A high-profile story tested for structural consequence.

### 10.8 SYSTEM LEDGER DELTA

End each issue with a structured table:

```text
event / line
flow
what changed in 24h
bottleneck
leverage
rent / adaptation
direction
status
```

---

## 11. Product surfaces

The product is not “a site plus a newsletter.”

There is one underlying information system with multiple surfaces.

### 11.1 Daily interactive HTML

The editorial face of WSB.

One permanent URL per issue.

Example:

```text
/brief/2026-09-26/
```

### 11.2 Main site / System State

The homepage should not be “Latest articles.”

It should answer:

> **What is the current state of the system?**

Possible top-level indicators:

- active bottlenecks;
- leverage shifts / 30D;
- bypasses developing;
- dependencies strengthening;
- dependencies weakening.

### 11.3 System Ledger

Professional research interface with filters by:

- country;
- company;
- sector;
- commodity;
- technology;
- flow;
- bottleneck;
- policy instrument;
- date;
- status.

### 11.4 Entity / relation pages

Permanent pages should exist for important entities, relations, sectors, and bottlenecks.

Examples:

```text
/system/rare-earths
/system/hormuz
/relation/china-eu-ev
/bottleneck/advanced-lithography
```

### 11.5 Email Brief

Very short summary.

Goal:

**30 seconds to understand whether today's issue matters to the reader.**

Email should point to the interactive HTML rather than duplicate it.

### 11.6 Social distribution

Telegram / LinkedIn / X are distribution layers, not separate editorial products.

One structural fact can become one compact post.

### 11.7 Weekly System Review

Daily asks:

> What moved?

Weekly asks:

> What persisted?

Possible summary:

```text
14 Δ detected
5 persisted
3 strengthened
4 reverted
2 uncertain
```

### 11.8 Monthly / Quarterly State of the System

Aggregate the Ledger into:

- dependencies strengthening;
- dependencies weakening;
- new bottlenecks;
- bottlenecks resolving;
- bypasses becoming structural;
- rent migration;
- value-chain relocation.

### 11.9 Alerts

Future professional feature.

Users subscribe to **state change**, not to keywords.

Examples:

```text
Alert me when leverage changes in the EU–China EV chain.

Alert me when a new bypass appears for a specific oil flow.

Alert me when semiconductor substitutability changes.
```

### 11.10 API / export

Future machine-readable access to:

- entities;
- relations;
- events;
- state;
- delta;
- history;
- evidence.

---

## 12. Positioning

WSB should not be positioned as:

- “for people interested in geopolitics”;
- another daily news digest;
- a guru explaining “what it all really means”;
- a prediction service;
- a trading signal.

Primary positioning:

> **World System Brief shows what changed beneath the news.**

Functional positioning:

> **Daily intelligence on flows, dependencies, bottlenecks and leverage.**

Internal formulation:

> **WSB sells a model of change, not a stream of headlines.**

---

## 13. Target users

### 13.1 Strategy / risk / international business

Relevant roles:

- executives;
- strategy teams;
- procurement;
- supply-chain management;
- corporate intelligence;
- business continuity;
- industrial planning.

Their question:

> Which external dependency changed before it becomes my operational problem?

### 13.2 Investors and analysts

WSB is not a buy/sell engine.

It helps construct structural hypotheses around:

- regulation;
- relocation;
- supply concentration;
- industrial policy;
- substitution;
- capital expenditure;
- bottleneck migration.

### 13.3 Policy / government / think tanks

Relevant users include:

- ministries;
- regulators;
- diplomats;
- industrial-policy teams;
- international organizations;
- policy researchers.

Value proposition:

**daily structural delta instead of waiting for a 40-page report three weeks later.**

### 13.4 Journalists

WSB can function as a context machine:

```text
headline
→ affected chain
→ dependency
→ bottleneck
→ leverage
→ evidence
```

### 13.5 Researchers and universities

Long-term value comes from structured historical state.

Possible future query:

> Show every semiconductor bottleneck change between 2026 and 2029.

### 13.6 Smart non-specialists

People who want more than a morning-news summary but do not want to read fifteen institutional and industry sources every day.

---

## 14. Commercial thesis

The free Daily Brief should be the acquisition layer.

Do not initially hide the Daily behind a hard paywall.

A plausible model:

### Free

- Daily HTML;
- email;
- social posts;
- limited Ledger access.

### Professional

- full Ledger;
- history;
- advanced filters;
- alerts;
- exports;
- saved views;
- watchlists.

### Institutional

- teams;
- API;
- sector dashboards;
- custom watchlists;
- integrations;
- possible internal-data overlays.

Core commercial insight:

> **News is free; memory is valuable.**

Or more precisely:

> **WSB does not sell old news. It sells the memory of how the system changed.**

After approximately six months, the archive should already have enough temporal depth to become sellable as a change-history product.

---

## 15. The moat

News can be copied.

Articles can be summarized.

Design can be imitated.

Methodology can be read.

The difficult-to-recreate asset is:

> **A long, consistent sequence of decisions about when a specific dependency actually changed.**

Over time, WSB becomes a temporal knowledge graph of the world economy.

That historical continuity is the moat.

---

## 16. System Event ID

Every structural event should receive a stable identifier.

Example:

```text
WSB-EV-20260926-0042
```

Possible structure:

```yaml
type: leverage_shift
flow: manufactured_goods
sector: automotive
entities:
  - EU
  - UK
  - China
bottleneck: rules_of_origin
direction: EU_up
confidence: medium
first_seen: 2026-09-26
status: developing
```

If tomorrow's news continues the same event, do not create a new event automatically.

Update the event:

```text
developing → confirmed
↑ → →
developing → reverted
```

This prevents one structural event from being reborn as a new “story” every morning.

---

## 17. Visual identity

The visual system should resemble:

> **International Style + financial terminal + scientific journal**

Avoid generic geopolitical aesthetics:

- globes;
- flags;
- dramatic maps;
- red military arrows;
- portraits of political leaders;
- stock “world crisis” photography.

The interface should look like an instrument for observing a system.

Suggested masthead:

```text
WORLD SYSTEM BRIEF
Flows · Bottlenecks · Leverage
26 SEP 2026 · WSB 004
```

Possible supporting line:

> **FACTS · STRUCTURE · CONNECTIONS · CONSEQUENCES · NOT NOISE**

Photography is optional evidence, never required identity.

A tanker photo usually communicates less than:

```text
Persian Gulf ━━━×━━→ Indian refinery
```

---

## 18. Unicode-first symbol system

WSB should be capable of expressing its core system semantics without external image assets.

This is both a technical and branding principle.

Goal:

> **The WSB visual language must survive as plain text.**

Prefer text-presentation Unicode symbols over platform-dependent color emoji.

### 18.1 Relationship / state symbols

Working v0.1 vocabulary:

```text
⇢   FLOW
⇄   INTERDEPENDENCE
×   BOTTLENECK / INTERRUPTION
↑   LEVERAGE / STATE UP
↓   LEVERAGE / STATE DOWN
→   NO MATERIAL CHANGE
↗   STRENGTHENING TREND
↘   WEAKENING TREND
Δ   STATE CHANGE
⧖   LONG SUBSTITUTION HORIZON
↪   BYPASS / ADAPTATION
§   REGULATION
◇   RENT
∴   CONSEQUENCE
```

### 18.2 Domain symbols

Working set, subject to testing across existing issues:

```text
⚡  ENERGY
◈   MATERIALS
⚙   INDUSTRY
▦   TECHNOLOGY
$   CAPITAL
♟   LABOUR
⌁   DATA
↔   TRADE
§   REGULATION
```

FOOD and SHIPPING symbols should be selected only after testing legibility and cross-platform rendering.

Avoid using colorful emoji as the core visual grammar.

Example syntax:

```text
◈ RARE EARTHS · CN ⇢ EU · × REFINING · CN ↑ · ⧖ YEARS
```

```text
⚡ OIL · GULF ⇢ ASIA · × HORMUZ · ↪ STS · ◇ SHIPPING ↑
```

The symbol set should eventually become **WSB Symbol Standard v0.1** and remain stable across issues.

---

## 19. HTML-first publication principle

Every Daily issue should be publishable as a **single self-contained HTML file**.

Preferred properties:

- no required external image folder;
- no ZIP dependency;
- inline CSS;
- small vanilla JS;
- inline SVG for diagrams, charts, and sparklines;
- embedded issue data;
- usable offline after saving;
- responsive;
- printable;
- permanent URL.

Principle:

> **Every WSB issue is a self-contained document.**

External images may be included when useful, but the document must not rely on them for its core semantics.

If brand typography later requires a custom font, a WOFF2 may be embedded directly in the HTML as data, preserving the one-file property.

Initial system typography can rely on robust stacks such as:

```css
font-family: "Arial Narrow", "Roboto Condensed", Arial, sans-serif;
```

and:

```css
font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
```

---

## 20. Technical architecture — v0.1

WSB should be built as a small data platform, not as a CMS.

Recommended initial stack:

- **PostgreSQL** — System Ledger;
- **Python** — ingestion / extraction / normalization / delta pipeline;
- **FastAPI** — internal and future external API;
- **static HTML + vanilla JS** — Daily Brief;
- **inline SVG** — maps, diagrams, sparklines;
- **Astro** — likely main website / static + interactive islands;
- **Git** — immutable snapshots and historical reproducibility;
- **Cloudflare Pages** — static delivery;
- **Supabase** — plausible managed PostgreSQL/auth/storage option.

Do not introduce infrastructure merely because it is fashionable.

No immediate need for:

- Kubernetes;
- Kafka;
- microservices;
- Neo4j;
- vector database;
- full SPA;
- React for the Daily Brief.

---

## 21. Initial data model

Start relationally.

Likely core tables:

```text
entities
relations
sources
claims
observations
system_events
ledger_states
briefs
brief_items
snapshots
```

### 21.1 entities

Countries, institutions, firms, infrastructure, commodities, technologies, markets, standards, etc.

### 21.2 relations

Persistent relationships between entities / system nodes.

### 21.3 sources

Source metadata.

### 21.4 claims

Atomic sourced factual claims.

### 21.5 observations

A normalized observation connecting claims to entities / relations.

### 21.6 system_events

Structural event records with stable IDs.

### 21.7 ledger_states

Temporal state history.

### 21.8 briefs

Daily / weekly / monthly editorial outputs.

### 21.9 brief_items

Links between editorial selections and Ledger events.

### 21.10 snapshots

Immutable state snapshots used for historical reconstruction.

A graph database should only be introduced later if actual query patterns justify it.

---

## 22. Pipeline

Conceptual pipeline:

```text
WEB SOURCES
     ↓
INGEST
     ↓
EXTRACT CLAIMS
     ↓
NORMALIZE ENTITIES
     ↓
MATCH EXISTING RELATIONS
     ↓
DETECT POSSIBLE Δ
     ↓
VERIFY / EDIT
     ↓
SYSTEM LEDGER
     ↓
SNAPSHOT
     ↓
RENDER
```

LLMs are useful for:

- extraction;
- entity normalization;
- candidate relation matching;
- candidate Δ detection;
- summarization;
- drafting.

LLMs should **not** autonomously mutate authoritative Ledger state without validation.

For important Δs, preserve human review.

Goal:

> automation without creating a beautifully structured hallucination archive.

---

## 23. API-first thinking

Even before public API access exists, use API-shaped internal boundaries.

Candidate endpoints:

```text
/api/entities
/api/relations
/api/events
/api/state
/api/delta
/api/history
/api/evidence
```

This ensures the Daily renderer, website, alerts, and future Professional UI all consume the same model.

---

## 24. Git + database division of responsibility

Keep both.

```text
Postgres = living state
Git      = immutable history
HTML     = human-readable snapshot
JSON     = machine-readable snapshot
```

Every published issue should carry:

- issue_id;
- generated_at;
- ledger_snapshot_id;
- pipeline_version;
- schema_version.

Each publication should produce a machine-readable snapshot such as:

```text
/snapshots/2026-09-26.json
```

The goal is reproducibility even if the backend is completely rewritten later.

---

## 25. Repository direction

Initial repository:

```text
world-system-brief/
├── brain.md
├── README.md
├── docs/
├── schema/
├── pipeline/
├── renderer/
├── site/
├── snapshots/
└── tests/
```

This structure is provisional.

Do not create directories merely to satisfy the diagram. Add them when real files exist.

---

## 26. First implementation milestone

Do **not** begin by building the full website.

The first real prototype should be:

> **One genuine Daily WSB issue rendered as a self-contained interactive HTML document from structured data.**

Use a real issue as the test case.

The prototype should prove:

1. the information hierarchy;
2. Unicode symbol grammar;
3. System Delta rendering;
4. System Map interaction;
5. Bottleneck Watch;
6. Chain of the Day;
7. evidence reveal;
8. Ledger Delta;
9. responsive behavior;
10. offline single-file behavior.

Only after the Daily format works should the broader site architecture be finalized.

---

## 27. Second implementation milestone

Design **System Ledger schema v0.1** before accumulating a large archive.

This is higher priority than polishing the website.

The HTML can be redesigned repeatedly.

A flawed temporal model becomes expensive to repair once hundreds of daily changes depend on it.

Schema work should explicitly define:

- entity identity;
- relation identity;
- event identity;
- state transitions;
- evidence provenance;
- confidence;
- corrections;
- supersession;
- temporal validity;
- snapshot behavior;
- versioning.

---

## 28. Core future queries

The system should eventually support queries such as:

> Show every structural change in the EU–China EV value chain between September 2026 and March 2027.

> Show bottleneck migration in advanced semiconductors over the last 18 months.

> Which dependencies involving China weakened during the last 90 days?

> Which bypasses first marked “developing” later became “structural”?

> Show all cases where regulatory leverage increased without a corresponding physical supply disruption.

> Show the evidence trail behind the current state of rare-earth refining dependence.

These queries are useful design tests for the data model.

---

## 29. Current founding principles

1. **If the arrow didn't move, it isn't the story.**
2. **Track the arrow, not the speech.**
3. **Bottlenecks migrate through networks.**
4. **Evidence is not the same as state.**
5. **Never silently rewrite historical belief.**
6. **Daily is a view; Ledger is the asset.**
7. **News is free; memory is valuable.**
8. **The product should survive without external graphics.**
9. **Every Daily issue should be a self-contained HTML document.**
10. **Postgres is living state; Git is immutable history.**
11. **Do not over-engineer before query patterns demand it.**
12. **Build the schema before building the empire.**

---

## 30. One-sentence definition

> **World System Brief is a continuously updated, evidence-backed temporal model of global economic dependencies that publishes the meaningful changes as a daily interactive brief.**

---

## 31. Open questions

These are intentionally unresolved:

- final public brand / domain;
- exact WSB Symbol Standard;
- final FOOD and SHIPPING symbols;
- formal confidence scale;
- exact leverage scale;
- exact substitutability model;
- how to distinguish “bottleneck” from “constraint” formally;
- whether rent should be categorical, directional, or quantitative;
- formal rules for event merge / split;
- human-review workflow;
- editorial selection scoring;
- source reliability weighting;
- archival licensing constraints;
- Professional pricing;
- when to expose the API publicly;
- whether graph visualization remains a view over Postgres or eventually justifies a graph database.

These should be resolved through prototypes and real data, not abstract architecture debates.

---

## 32. Immediate next step

Design **System Ledger schema v0.1** against several real historical WSB events.

Do not model imaginary completeness.

Take actual examples from existing briefs and test whether the schema can represent:

- persistence;
- strengthening;
- weakening;
- reversal;
- correction;
- bottleneck migration;
- bypass development;
- leverage change;
- unchanged state with new evidence.

Once this works, build the first data-driven Daily HTML renderer.
