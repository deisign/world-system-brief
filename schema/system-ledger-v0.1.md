# System Ledger v0.1 — schema stress tests

> Status: design draft, not SQL.
>
> Purpose: derive the minimum viable temporal model from real WSB story types before committing to a database schema.
>
> Governing rule: **events are evidence-bearing occurrences; deltas are changes in modeled system state. They are not the same thing.**

## 1. What the schema must be able to represent

The Ledger must represent all of these without special-case hacks:

1. persistent structural relationships;
2. value-chain stages rather than only country-to-country links;
3. several simultaneous flows across one relationship;
4. physical, productive, technological, financial, regulatory and logistical constraints;
5. a constraint that exists but does not materially change today;
6. state changes caused by events;
7. events that cause no state change;
8. planned adaptation that has not yet reduced dependency;
9. adaptation becoming operational later;
10. bottleneck migration from one node to another;
11. strengthening, weakening, reversal and resolution;
12. corrections and superseded evidence without rewriting history;
13. uncertainty and confidence;
14. reconstruction of what WSB believed at any historical date.

The tests below deliberately stress different parts of that model.

---

# TEST A — Rare earths

## Why this case

Rare earths test **value-chain concentration**, **stage-specific dependency**, **slow substitution**, and the difference between announced capacity and operational substitution.

A country-to-country relation such as:

```text
China → EU
```

is insufficient.

The economically meaningful chain is closer to:

```text
ORE
 ⇢ CONCENTRATE
 ⇢ SEPARATION
 ⇢ REFINING
 ⇢ MAGNET MATERIAL
 ⇢ PERMANENT MAGNET
 ⇢ COMPONENT
 ⇢ END PRODUCT
```

Different entities may dominate different stages.

## Candidate system line

```yaml
system_line:
  subject: EU downstream industry
  depends_on: China-linked rare-earth processing capacity
  flow: critical_materials
  chain:
    commodity_family: rare_earths
    critical_stage: separation_refining
```

## State at T1

```yaml
state:
  dependency:
    level: high
  bottleneck:
    node: separation_refining
    type: productive_capacity
    status: active
  substitutability:
    level: low
    horizon: years
  leverage:
    holder: China
    level: high
  bypass:
    status: none_material
```

## Event at T2 — new restriction or licensing constraint

The event is evidence-bearing:

```yaml
event:
  type: export_control_change
  affects:
    - rare_earth_products
    - licensing
  status: confirmed
```

Possible resulting Δ:

```yaml
delta:
  leverage:
    before: high
    after: very_high
  constraints:
    add:
      type: regulatory_access
      node: export_licensing
```

Important: the original refining bottleneck has not disappeared. A second constraint has appeared.

The model must support **multiple active constraints on one system line**.

## Event at T3 — EU announces alternative refining project

This is where a naive news database fails.

The announcement is an event:

```yaml
event:
  type: capacity_project_announced
  node: separation_refining
  geography: EU
  expected_online: future
```

But current dependency may remain unchanged:

```yaml
delta:
  dependency: none
  substitutability: none
  leverage: none
```

Instead, adaptation state changes:

```yaml
adaptation:
  type: alternative_capacity
  status:
    before: absent
    after: planned
  expected_online: future
```

Thus:

> **A future bypass can change adaptation state without changing present dependency state.**

## Event at T4 — project becomes operational

Now the state may change:

```yaml
delta:
  adaptation:
    before: planned
    after: operational
  substitutability:
    before: low
    after: medium
  substitution_horizon:
    before: years
    after: 18_36_months
  dependency:
    before: high
    after: medium_high
```

Whether all those transitions occur must be evidence-driven; commissioning alone does not automatically prove sufficient scale.

## Requirements discovered

The schema needs:

- value-chain stages;
- stage-specific relations;
- multiple simultaneous constraints;
- adaptation/bypass lifecycle;
- expected vs actual operational dates;
- state dimensions that can change independently;
- evidence for each individual Δ;
- no automatic “announcement = reduced dependency” rule.

---

# TEST B — Hormuz

## Why this case

Hormuz tests a **physical transport chokepoint**, route capacity, insurance/freight effects, inventory buffers and bypasses.

Unlike rare-earth refining, the chokepoint is not a productive stage.

## Candidate system line

```text
Gulf production
    ⇢ terminal/loading
    ⇢ Strait of Hormuz
    ⇢ maritime route
    ⇢ Asian / European buyers
```

Relevant flows can include:

```text
⚡ crude oil
⚡ refined products
⚡ LNG
```

One physical node may therefore constrain multiple flows.

## State at T1

```yaml
constraint:
  node: strait_of_hormuz
  type: transport_chokepoint
  status: active
  substitutability: low
```

But dependency is not binary.

Some producers or cargoes may have:

- pipeline alternatives;
- alternate export terminals;
- inventories;
- spare shipping capacity;
- destination flexibility.

Therefore a bypass must have **capacity and scope**, not just boolean existence.

## Event at T2 — transit risk increases

Possible Δ:

```yaml
delta:
  transport_risk:
    before: elevated
    after: high
  insurance_cost:
    direction: up
  freight_cost:
    direction: up
```

Physical throughput may still be unchanged.

This is important:

> **A chokepoint can become more economically constraining before physical flow declines.**

## Event at T3 — adaptation increases

Possible adaptations:

```yaml
adaptations:
  - type: alternate_pipeline
    status: operational
    capacity: bounded
  - type: alternate_terminal
    status: operational
    capacity: bounded
  - type: inventory_draw
    status: active
    duration: bounded
  - type: ship_to_ship_transfer
    status: expanding
    effect: routing_or_commercial_adaptation
```

The model must not call every workaround a full substitute.

## Bottleneck migration example

Suppose Hormuz pressure causes traffic to shift toward an alternative terminal.

Then:

```text
HORMUZ ×
   ↓ adaptation
ALTERNATIVE TERMINAL ↑ utilization
   ↓
TERMINAL / PIPELINE CAPACITY ×
```

The original bottleneck may weaken while a downstream or parallel bottleneck strengthens.

We need to record this as a **migration relationship**, not merely two unrelated events.

## Requirements discovered

The schema needs:

- constraint type;
- physical node identity;
- multiple flows through one node;
- capacity/scoped bypasses;
- risk/cost effects distinct from throughput;
- temporary buffers such as inventories;
- explicit bottleneck migration;
- partial substitution.

---

# TEST C — EU–China EV chain

## Why this case

This tests **regulatory bottlenecks**, rules of origin, capital flows, localization, component dependence, market access and rent distribution.

A simple “China exports EVs to EU” model is inadequate.

## Candidate chain

```text
MINERALS
  ⇢ BATTERY MATERIALS
  ⇢ CELLS / COMPONENTS
  ⇢ VEHICLE TECHNOLOGY
  ⇢ CAPITAL / FDI
  ⇢ LOCAL ASSEMBLY
  ⇢ § RULES OF ORIGIN
  ⇢ § PROCUREMENT / SUBSIDY ELIGIBILITY
  ⇢ MARKET
```

Different flow types coexist:

```text
◈ materials
⚙ components
▦ technology
$ capital
↔ trade
```

## State at T1

Possible structural state:

```yaml
relations:
  - China_component_base -> EU_assembly
  - China_capital -> EU_production
  - EU_regulation -> market_access
```

The EU may hold regulatory leverage while Chinese firms retain component-chain leverage.

Therefore leverage is not a single scalar attached to “EU vs China.”

It is:

> **leverage held by an actor over a specific relation, node or access condition.**

## Event at T2 — tariff / procurement / origin rule changes

Possible event:

```yaml
event:
  type: regulatory_change
  instrument: rules_of_origin
  target: vehicle_market_access
```

Possible Δ:

```yaml
delta:
  regulatory_leverage:
    holder: EU
    direction: up
  market_access_constraint:
    direction: up
```

But Chinese productive leverage may remain unchanged.

## Event at T3 — Chinese producer localizes assembly in Europe

Naive interpretation:

```text
China dependency ↓
```

Potentially wrong.

The real chain may become:

```text
Chinese capital
   ⇢ EU assembly
Chinese components
   ⇢ EU assembly
EU regulation
   ⇢ market access
```

So one dependency may weaken while another persists.

Possible changes:

```yaml
delta:
  finished_vehicle_import_dependency:
    direction: down
  local_assembly:
    direction: up
  component_dependency:
    direction: unchanged
  EU_regulatory_leverage:
    direction: up
  Chinese_component_leverage:
    direction: unchanged
```

This is a textbook case of **bottleneck migration**.

The system moves from:

```text
finished vehicle tariff
```

toward:

```text
origin eligibility / component sourcing / battery inputs
```

## Rent implications

The model should be able to record directional rent migration without pretending to know precise monetary values.

Possible categories:

- resource rent;
- processing rent;
- manufacturing rent;
- technology/IP rent;
- regulatory/policy rent;
- distribution rent;
- logistics rent.

Example:

```yaml
rent_shift:
  from: imported_finished_vehicle_margin
  toward:
    - local_assembly
    - eligible_component_supply
  confidence: medium
```

## Requirements discovered

The schema needs:

- simultaneous flow types;
- regulatory instruments as first-class entities or nodes;
- market access as a modeled relation;
- leverage scoped to a relation/node;
- localization without assuming de-dependence;
- bottleneck migration across value-chain stages;
- directional/categorical rent shifts;
- multiple opposing leverage positions in one broader bilateral relationship.

---

# TEST D — high-profile event with no system change

## Why this case

This is the anti-news-feed test.

Suppose a major summit occurs and produces extensive coverage, but no material change to:

- semiconductor export controls;
- critical-mineral access;
- tariffs;
- payment rails;
- investment restrictions;
- relevant substitution capacity.

The event is real and evidence-worthy.

But:

```text
SYSTEM Δ = NONE
```

## Representation

```yaml
event:
  type: diplomatic_meeting
  importance_in_news_cycle: high
  evidence:
    - source_a
    - source_b
```

Evaluation:

```yaml
system_effect_assessment:
  delta_detected: false
  checked_dimensions:
    - access
    - export_controls
    - tariffs
    - substitutability
    - leverage
    - bypass
  result: no_material_change
```

Current Ledger state remains untouched.

New evidence may still attach to existing relations.

## Why this matters

Without this distinction, WSB will drift into:

```text
article → database row → Daily Brief
```

The required architecture is:

```text
article
  ↓
claim
  ↓
observation
  ↓
candidate event
  ↓
system-effect assessment
  ├─ Δ detected → Ledger transition
  └─ no Δ       → evidence only
```

## Requirements discovered

The schema needs:

- events without deltas;
- explicit no-change assessments;
- dimensions checked;
- evidence attachment without state mutation;
- separation of editorial prominence from structural significance.

---

# 2. Cross-test conclusions

The four tests expose several concepts that should remain distinct.

## 2.1 Entity

A persistent identifiable thing.

Examples:

- China;
- EU;
- a regulator;
- a company;
- Strait of Hormuz;
- a refinery;
- a terminal;
- a technology;
- a commodity;
- a standard or regulatory instrument.

## 2.2 Value-chain node

A functional stage in a chain.

Examples:

- mining;
- separation;
- refining;
- cell manufacturing;
- assembly;
- procurement eligibility.

A node is not necessarily an entity.

“Refining” is a functional stage; a specific refinery is an entity participating in that stage.

## 2.3 Flow

Something moving through relations/nodes.

Initial controlled vocabulary:

```text
goods
capital
energy
technology
data
labour
```

Potential later refinements should not destroy these top-level categories.

## 2.4 Relation

A persistent structural connection.

Examples:

```text
EU downstream industry DEPENDS_ON China-linked refining
Chinese component suppliers SUPPLY EU assembly
EU regulation GOVERNS market access
Hormuz CARRIES Gulf export flows
```

Relations persist across many events.

## 2.5 Constraint

Something limiting or conditioning a relation/flow.

Candidate types:

```text
productive_capacity
transport_chokepoint
regulatory_access
technology_access
financial_access
infrastructure_capacity
licensing
standards
market_access
logistics
```

“Bottleneck” may eventually be a **state of a constraint**, rather than a separate object class.

This remains an open design question.

## 2.6 Event

An occurrence at a time.

An event may:

- change system state;
- fail to change system state;
- create a planned adaptation;
- correct prior evidence;
- confirm an existing trend.

Events are not states.

## 2.7 Observation / claim

Evidence-backed factual input.

Several claims can support one event.

Several events can support one state transition.

## 2.8 State

The modeled condition of a scoped system line at a given time.

Possible dimensions include:

```text
dependency
substitutability
substitution_horizon
constraint_status
leverage
rent_distribution
adaptation_status
access
capacity
risk
```

Not every system line needs every dimension.

## 2.9 Delta

A transition between two states or state dimensions.

A Δ must specify:

- what changed;
- before;
- after;
- effective time;
- evidence;
- confidence;
- reviewer/provenance.

## 2.10 Adaptation / bypass

A response to a constraint.

Lifecycle should support at least:

```text
proposed
planned
under_construction
testing
operational
scaling
mature
failed
cancelled
```

A bypass should also be able to express:

- capacity;
- scope;
- affected flows;
- time horizon;
- whether it is partial or full.

## 2.11 Bottleneck migration

A causal or analytical link between constraints:

```text
constraint A weakens
because adaptation X
while constraint B strengthens
```

This deserves explicit representation.

Otherwise one of the most important WSB ideas will exist only in prose.

---

# 3. Provisional minimum conceptual model

Do not treat this as final SQL.

```text
ENTITY
  │
  ├── participates in ── VALUE_CHAIN_NODE
  │
  └── connected by ───── RELATION
                            │
FLOW ───────────────────────┤
                            │
CONSTRAINT ─────────────────┤
                            │
ADAPTATION ─────────────────┤
                            │
                         STATE
                            │
                         DELTA
                            │
                         EVENT
                            │
                      OBSERVATION
                            │
                          CLAIM
                            │
                         SOURCE
```

This diagram is intentionally incomplete about cardinality.

Cardinality should be derived when we move to logical schema design.

---

# 4. Provisional tables suggested by the tests

Likely candidates:

```text
entities
entity_aliases

value_chains
value_chain_nodes
entity_node_participation

flows
relations
relation_flows

constraints
relation_constraints

adaptations
adaptation_targets

system_events
event_relations

claims
sources
claim_sources
observations

state_dimensions
ledger_states
state_changes

event_evidence
change_evidence

constraint_migrations

snapshots
snapshot_states

briefs
brief_items
```

This is deliberately more explicit than the final database may need to be.

Before SQL, we should attempt to collapse tables where semantics remain clear.

---

# 5. Strong schema rules already justified

## Rule 1 — never encode the world only as country-to-country edges

Dependency must be scoped to a product, flow, stage, node or access condition.

## Rule 2 — event and delta are different objects

```text
EVENT ≠ Δ
```

## Rule 3 — an event may produce zero, one or many deltas

A regulatory decision may simultaneously affect:

- market access;
- leverage;
- expected investment;
- bypass incentives.

## Rule 4 — one delta may require several pieces of evidence

No single article is privileged as “the event.”

## Rule 5 — future capacity is not current substitution

```text
ANNOUNCED ≠ BUILT ≠ OPERATIONAL ≠ MATERIAL AT SCALE
```

## Rule 6 — leverage must be scoped

Avoid:

```text
China leverage = high
```

Prefer:

```text
China leverage over EU access to rare-earth separation capacity = high
```

## Rule 7 — bypass existence is not enough

Record capacity, scope and lifecycle.

## Rule 8 — no-change is a legitimate analytical result

A major event may add evidence and leave the Ledger state unchanged.

## Rule 9 — corrections append history

Never silently mutate an old published belief.

## Rule 10 — bottleneck migration must be queryable

It cannot exist only as editorial prose.

---

# 6. Temporal model questions for v0.2

Before writing SQL, resolve these explicitly.

### 6.1 Three times may exist

For any fact/change:

- **occurred_at** — when the real-world event happened;
- **observed_at** — when WSB learned about it;
- **effective_from** — when WSB considers the modeled state to have changed.

These can differ.

We likely need all three.

### 6.2 Valid time vs transaction time

A mature Ledger may need bitemporal behavior:

- what state was valid in the modeled world;
- what WSB database believed at a given historical moment.

This is especially important for corrections.

We should decide whether to implement true bitemporal tables now or preserve enough fields to migrate later.

### 6.3 State storage

Options:

A. store full state snapshots per relation after every change;

B. store only deltas and reconstruct state;

C. hybrid: deltas as truth + periodic/materialized snapshots.

Initial preference:

> **Hybrid.**

Deltas preserve meaning; snapshots make historical rendering and queries cheap.

---

# 7. Confidence model questions

Do not use fake numerical precision by default.

Possible initial scale:

```text
low
medium
high
```

But confidence may refer to different things:

- source reliability;
- factual claim confidence;
- event interpretation confidence;
- causal attribution confidence;
- state-change confidence.

These should not automatically collapse into one score.

---

# 8. Rent model questions

Rent is analytically important but easy to overclaim.

Initial recommendation:

Store:

- rent category;
- beneficiary;
- direction;
- mechanism;
- confidence.

Example:

```yaml
rent_change:
  category: logistics
  beneficiary: tanker_owners
  direction: up
  mechanism: constrained_shipping_capacity
  confidence: medium
```

Do not require a monetary value.

Quantitative values can be attached when reliable data exists.

---

# 9. Candidate state vocabulary

These are working enums, not commitments.

## Dependency

```text
low
medium
high
critical
```

## Substitutability

```text
high
medium
low
none_known
```

## Substitution horizon

Prefer bounded ranges or semantic buckets:

```text
days
weeks
months
1_3_years
3_5_years
5_plus_years
unknown
```

Later we may store numeric lower/upper bounds instead.

## Constraint status

```text
latent
active
binding
easing
resolved
```

## Trend

```text
strengthening
stable
weakening
reversing
uncertain
```

---

# 10. Query tests the eventual SQL must pass

The first schema is not acceptable unless these questions are answerable.

### Historical state

> What did WSB believe about EU dependence on China-linked rare-earth refining on 2026-09-26?

### Evidence trail

> Which claims and sources justified that state?

### Change history

> Show every Δ on this system line in chronological order.

### No-change history

> Show major evaluated events that did not change this line.

### Bottleneck migration

> Which constraints emerged after attempts to bypass another constraint?

### Adaptation lifecycle

> Which bypasses moved from planned to operational, and how long did that take?

### False promise / failed bypass

> Which announced alternatives never became materially operational?

### Cross-domain leverage

> Show regulatory leverage changes affecting automotive market access.

### Persistence

> Which bottlenecks remained binding for more than 90 days?

### Revision history

> What did WSB originally believe, and what was later corrected?

---

# 11. What we deliberately do NOT decide yet

Do not lock these prematurely:

- PostgreSQL enum vs lookup table;
- UUID vs sortable IDs;
- graph extension;
- PostGIS;
- vector embeddings;
- exact ontology hierarchy;
- numerical leverage scores;
- automated causal inference;
- event importance scoring;
- user-facing taxonomy;
- public API shape.

The stress tests justify semantics first.

Implementation follows.

---

# 12. Next step

Take these conceptual requirements and write:

```text
schema/system-ledger-v0.2.md
```

with a **logical relational schema**:

- tables;
- primary keys;
- foreign keys;
- temporal fields;
- versioning;
- append-only rules;
- correction/supersession behavior;
- snapshot strategy.

Then test that logical schema by encoding one complete mini-history for each of the four cases above.

Only after those examples survive round-trip reconstruction should we write:

```text
schema/001_initial.sql
```

The target is not an elegant schema diagram.

The target is:

> **A database that can remember how our model of the world changed without confusing news, evidence, events, and reality.**
