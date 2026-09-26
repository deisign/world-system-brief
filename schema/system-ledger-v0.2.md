# System Ledger v0.2 — logical relational schema

> Status: logical design draft. This is still **not** the initial SQL migration.
>
> Builds on `schema/system-ledger-v0.1.md`.
>
> Product language convention: **`en` / `ua`**.
>
> Important: WSB intentionally uses `ua` as its internal Ukrainian-language code. Do not silently normalize it to `uk` in application data, URLs, translation keys, APIs, or content records.

---

## 1. Design goals

The logical schema must preserve five separations:

1. **world objects** vs **localized presentation**;
2. **claims/evidence** vs **events**;
3. **events** vs **state changes (Δ)**;
4. **current living state** vs **immutable historical belief**;
5. **language-neutral analytical structure** vs **English/Ukrainian editorial text**.

Core invariant:

```text
SOURCE → CLAIM → OBSERVATION → EVENT → ASSESSMENT → Δ → STATE
```

Not every item traverses the whole chain.

A valid path is:

```text
SOURCE → CLAIM → OBSERVATION → EVENT → NO MATERIAL Δ
```

---

# 2. Localization architecture

WSB is bilingual from the data-model level.

Supported product languages at v0.1:

```text
en
ua
```

## 2.1 Language-neutral core

Never duplicate analytical objects by language.

Bad:

```text
entity_rare_earths_en
entity_rare_earths_ua
```

Correct:

```text
entity: rare_earths
  ├── en: Rare earths
  └── ua: Рідкісноземельні елементи
```

The following remain language-neutral:

- IDs;
- entity types;
- relation types;
- flow types;
- state dimensions;
- event types;
- constraint types;
- lifecycle statuses;
- numeric values;
- timestamps;
- source URLs;
- confidence/status codes;
- directional deltas;
- graph topology.

Localized text lives in translation tables or localized editorial records.

## 2.2 Translation fallback

Default editorial language: **en**.

Fallback policy:

```text
requested locale
   ↓
exact translation
   ↓ missing
en fallback
   ↓ missing
canonical machine label / slug
```

Missing Ukrainian translation must be visible to editorial tooling; fallback must not make translation completeness impossible to audit.

## 2.3 URLs

Recommended public pattern:

```text
/en/brief/2026-09-26/
/ua/brief/2026-09-26/

/en/system/rare-earths/
/ua/system/rare-earths/
```

The stable slug may remain language-neutral initially.

Later localized aliases can redirect to the canonical resource without changing entity identity.

## 2.4 What gets translated

Translate:

- display names;
- descriptions;
- brief headlines;
- summaries;
- explanations;
- annotations;
- chart labels;
- methodology/help text;
- evidence notes written by WSB;
- editorial status labels shown to readers.

Do not translate:

- canonical IDs;
- source URLs;
- source-native titles stored as evidence;
- quoted source text unless explicitly stored as a separate translation;
- machine enums.

## 2.5 Source language

Source language is independent from product language.

A German, Chinese, French or Ukrainian source can support both the `en` and `ua` WSB output.

Store:

```text
source_language
original_title
original_excerpt
```

separately from WSB-authored localized explanation.

---

# 3. ID strategy

Use stable opaque primary keys internally.

Logical examples use UUID-like IDs, but exact physical type remains for SQL v0.1.

Every public analytical object also gets a stable canonical key/slug where useful.

Examples:

```text
entity.id
entity.key = china

value_chain_node.id
value_chain_node.key = rare-earth-separation

system_event.id
system_event.public_id = WSB-EV-20260926-0042
```

Never encode mutable labels into foreign keys.

---

# 4. Core tables

## 4.1 languages

```text
languages
---------
code PK              en | ua
name
is_active
is_default
created_at
```

Seed:

```text
en
ua
```

The application must validate against this table rather than assuming arbitrary locale strings.

---

## 4.2 entities

Persistent identifiable things.

```text
entities
--------
id PK
key UNIQUE
entity_type
canonical_name
country_code NULL
created_at
retired_at NULL
superseded_by_entity_id FK NULL
metadata_json
```

Examples:

- China;
- European Union;
- Strait of Hormuz;
- European Commission;
- a company;
- a refinery;
- lithium;
- rare earths;
- an export-control regime.

`canonical_name` is an internal fallback, not the user-facing multilingual label.

### entity_translations

```text
entity_translations
-------------------
entity_id FK
language_code FK
display_name
short_name NULL
description NULL
updated_at

PK (entity_id, language_code)
```

### entity_aliases

Aliases help normalization and source ingestion.

```text
entity_aliases
--------------
id PK
entity_id FK
alias
language_code FK NULL
alias_type
source_scope NULL
valid_from NULL
valid_to NULL
```

---

# 5. Value-chain model

## 5.1 value_chains

```text
value_chains
------------
id PK
key UNIQUE
domain
created_at
retired_at NULL
```

### value_chain_translations

```text
value_chain_translations
------------------------
value_chain_id FK
language_code FK
name
description NULL

PK (value_chain_id, language_code)
```

## 5.2 value_chain_nodes

Functional stages, not necessarily physical entities.

```text
value_chain_nodes
-----------------
id PK
value_chain_id FK
key
node_type
sequence_hint NULL
parent_node_id FK NULL
created_at
retired_at NULL

UNIQUE (value_chain_id, key)
```

Examples:

```text
mining
concentration
separation
refining
magnet_material
cell_manufacturing
assembly
origin_test
procurement_eligibility
market
```

### value_chain_node_translations

```text
value_chain_node_translations
-----------------------------
node_id FK
language_code FK
name
description NULL

PK (node_id, language_code)
```

## 5.3 entity_node_participation

Maps real actors/assets to functional stages.

```text
entity_node_participation
-------------------------
id PK
entity_id FK
node_id FK
role
valid_from NULL
valid_to NULL
evidence_confidence NULL
created_at
```

---

# 6. Flows

## 6.1 flows

A controlled vocabulary of things moving through the system.

```text
flows
-----
id PK
key UNIQUE
parent_flow_id FK NULL
unit_family NULL
```

Top-level seeds:

```text
goods
capital
energy
technology
data
labour
```

### flow_translations

```text
flow_translations
-----------------
flow_id FK
language_code FK
name
description NULL

PK (flow_id, language_code)
```

More specific flows can sit below top-level categories:

```text
energy
  ├── crude_oil
  ├── lng
  └── electricity

goods
  ├── vehicles
  ├── semiconductors
  └── critical_materials
```

---

# 7. Relations

A relation is a persistent structural connection, not a news event.

## 7.1 relations

```text
relations
---------
id PK
key UNIQUE NULL
relation_type
subject_entity_id FK NULL
object_entity_id FK NULL
subject_node_id FK NULL
object_node_id FK NULL
valid_from NULL
valid_to NULL
created_at
retired_at NULL
```

At least one subject and one object scope must exist, but a relation may involve entity-to-node, node-to-entity or node-to-node structures.

Examples:

```text
EU downstream industry DEPENDS_ON rare-earth separation/refining
Chinese component suppliers SUPPLY EU assembly
EU regulation GOVERNS market access
Hormuz CARRIES Gulf export flows
```

## 7.2 relation_flows

```text
relation_flows
--------------
relation_id FK
flow_id FK
scope_note NULL

PK (relation_id, flow_id)
```

One relation can carry several flows.

## 7.3 relation_translations

Relations may need reader-facing explanation, but the relation itself is language-neutral.

```text
relation_translations
---------------------
relation_id FK
language_code FK
label NULL
description NULL

PK (relation_id, language_code)
```

---

# 8. Constraints and bottlenecks

## 8.1 constraints

```text
constraints
-----------
id PK
key UNIQUE NULL
constraint_type
entity_id FK NULL
node_id FK NULL
created_at
retired_at NULL
```

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

A bottleneck is provisionally modeled as **a constraint in a binding state**, not as an entirely separate ontology.

This keeps:

```text
constraint = persistent object
bottleneck = temporal condition
```

## 8.2 relation_constraints

```text
relation_constraints
--------------------
relation_id FK
constraint_id FK
valid_from NULL
valid_to NULL

PK (relation_id, constraint_id, valid_from)
```

## 8.3 constraint_translations

```text
constraint_translations
-----------------------
constraint_id FK
language_code FK
name
description NULL

PK (constraint_id, language_code)
```

---

# 9. Adaptations / bypasses

## 9.1 adaptations

```text
adaptations
-----------
id PK
key UNIQUE NULL
adaptation_type
status
proposed_at NULL
planned_at NULL
construction_started_at NULL
operational_at NULL
failed_at NULL
cancelled_at NULL
capacity_value NULL
capacity_unit NULL
coverage_fraction NULL
is_partial BOOLEAN NULL
created_at
retired_at NULL
```

Lifecycle vocabulary:

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

## 9.2 adaptation_targets

```text
adaptation_targets
------------------
adaptation_id FK
constraint_id FK NULL
relation_id FK NULL
flow_id FK NULL
node_id FK NULL
role

PK (...logical composite...)
```

The physical SQL should use a surrogate PK if nullable composite semantics become awkward.

### adaptation_translations

```text
adaptation_translations
-----------------------
adaptation_id FK
language_code FK
name
description NULL

PK (adaptation_id, language_code)
```

---

# 10. Sources and claims

## 10.1 sources

```text
sources
-------
id PK
source_type
publisher_entity_id FK NULL
url UNIQUE NULL
source_language NULL
published_at NULL
retrieved_at
original_title NULL
archive_url NULL
content_hash NULL
metadata_json
```

Source language is not restricted to `en`/`ua`; it describes the original evidence.

## 10.2 claims

Atomic factual claims extracted or entered from sources.

```text
claims
------
id PK
claim_type
subject_entity_id FK NULL
object_entity_id FK NULL
relation_id FK NULL
node_id FK NULL
constraint_id FK NULL
value_json
occurred_at NULL
valid_from NULL
valid_to NULL
created_at
created_by
superseded_by_claim_id FK NULL
correction_reason NULL
```

Claims should preserve structured meaning where possible.

## 10.3 claim_sources

```text
claim_sources
-------------
claim_id FK
source_id FK
support_type
source_locator NULL
source_excerpt NULL

PK (claim_id, source_id)
```

`source_excerpt` remains in the source's original language.

## 10.4 claim_translations

Only WSB-authored paraphrases/explanations belong here.

```text
claim_translations
------------------
claim_id FK
language_code FK
paraphrase
editor_note NULL

PK (claim_id, language_code)
```

Do not overwrite original evidence with translation.

---

# 11. Observations

Observations normalize one or more claims into an analytical observation.

```text
observations
------------
id PK
observation_type
relation_id FK NULL
constraint_id FK NULL
adaptation_id FK NULL
node_id FK NULL
observed_at
confidence_level
created_at
created_by
superseded_by_observation_id FK NULL
```

## observation_claims

```text
observation_claims
------------------
observation_id FK
claim_id FK
role

PK (observation_id, claim_id)
```

---

# 12. System events

## 12.1 system_events

```text
system_events
-------------
id PK
public_id UNIQUE
event_type
occurred_at NULL
observed_at
status
importance_editorial NULL
created_at
created_by
superseded_by_event_id FK NULL
```

Possible public ID:

```text
WSB-EV-20260926-0042
```

## 12.2 event_observations

```text
event_observations
------------------
event_id FK
observation_id FK
role

PK (event_id, observation_id)
```

## 12.3 event_relations

```text
event_relations
---------------
event_id FK
relation_id FK
role

PK (event_id, relation_id, role)
```

## 12.4 event_translations

```text
event_translations
------------------
event_id FK
language_code FK
headline
summary NULL
editorial_note NULL

PK (event_id, language_code)
```

The event's identity does not depend on language.

---

# 13. System-effect assessments

This table is required to preserve **no-change** analysis.

```text
system_effect_assessments
-------------------------
id PK
event_id FK
relation_id FK NULL
assessed_at
delta_detected BOOLEAN
assessment_status
confidence_level
created_by
supersedes_assessment_id FK NULL
```

## assessment_dimensions

```text
assessment_dimensions
---------------------
assessment_id FK
dimension_key
result
note_key NULL

PK (assessment_id, dimension_key)
```

Example:

```text
access             unchanged
export_controls    unchanged
tariffs            unchanged
substitutability   unchanged
leverage           unchanged
bypass             unchanged
```

### assessment_translations

```text
assessment_translations
-----------------------
assessment_id FK
language_code FK
explanation

PK (assessment_id, language_code)
```

Thus a summit can be permanently recorded as:

```text
event exists
assessment exists
delta_detected = false
Ledger state unchanged
```

---

# 14. State dimensions

Avoid hardcoding every analytical dimension as a column until real data proves it stable.

## 14.1 state_dimensions

```text
state_dimensions
----------------
id PK
key UNIQUE
value_type
unit_family NULL
allowed_values_json NULL
is_directional BOOLEAN
```

Initial keys may include:

```text
dependency
substitutability
substitution_horizon
constraint_status
leverage
access
capacity
risk
adaptation_status
rent_direction
```

### state_dimension_translations

```text
state_dimension_translations
----------------------------
dimension_id FK
language_code FK
name
description NULL

PK (dimension_id, language_code)
```

---

# 15. Ledger state

## 15.1 ledger_states

A state record represents a scoped dimension at a point/interval in modeled time.

```text
ledger_states
-------------
id PK
relation_id FK NULL
constraint_id FK NULL
adaptation_id FK NULL
node_id FK NULL
actor_entity_id FK NULL
dimension_id FK
value_json
valid_from
valid_to NULL
recorded_at
confidence_level
created_by
superseded_by_state_id FK NULL
```

Scope is deliberately flexible because:

- dependency belongs to a relation;
- constraint status belongs to a constraint;
- adaptation status belongs to an adaptation;
- leverage may belong to an actor over a relation/node;
- risk may belong to a route or constraint.

Physical SQL must enforce sensible scope combinations with CHECK constraints or validation logic.

---

# 16. State changes / Δ

## 16.1 state_changes

```text
state_changes
-------------
id PK
public_id UNIQUE NULL
event_id FK NULL
assessment_id FK NULL
dimension_id FK
scope_type
scope_id
before_state_id FK NULL
after_state_id FK
effective_from
observed_at
direction
confidence_level
created_at
created_by
correction_of_change_id FK NULL
```

A Δ may have:

- one triggering event;
- several supporting observations;
- no single clean event when change is inferred from accumulated evidence.

Therefore `event_id` is nullable.

## 16.2 change_evidence

```text
change_evidence
---------------
state_change_id FK
observation_id FK
role

PK (state_change_id, observation_id)
```

A change is not valid for publication without evidence linkage, except explicitly marked manual/system initialization records.

---

# 17. Leverage

Leverage must never be a global actor score.

Represent it as a state dimension with scope.

Conceptual example:

```text
actor_entity_id = China
relation_id = EU dependence on China-linked rare-earth separation
dimension = leverage
value = high
```

This allows simultaneously:

```text
EU regulatory leverage over EV market access ↑
China component-chain leverage → 
```

without contradiction.

---

# 18. Rent

Initial rent representation should remain directional and mechanism-based.

## 18.1 rent_changes

```text
rent_changes
------------
id PK
event_id FK NULL
relation_id FK NULL
beneficiary_entity_id FK NULL
rent_category
direction
mechanism_key
effective_from
confidence_level
created_at
```

Candidate categories:

```text
resource
processing
manufacturing
technology_ip
regulatory_policy
distribution
logistics
financial
```

### rent_change_translations

```text
rent_change_translations
------------------------
rent_change_id FK
language_code FK
mechanism_explanation

PK (rent_change_id, language_code)
```

Quantitative monetary observations should be evidence claims, not required fields on every rent change.

---

# 19. Bottleneck migration

This is first-class.

## 19.1 constraint_migrations

```text
constraint_migrations
---------------------
id PK
from_constraint_id FK
to_constraint_id FK
trigger_event_id FK NULL
adaptation_id FK NULL
relation_id FK NULL
detected_at
migration_type
confidence_level
created_at
```

Possible migration types:

```text
shift
partial_shift
cascade
substitution_induced
regulatory_displacement
capacity_displacement
```

### constraint_migration_translations

```text
constraint_migration_translations
---------------------------------
migration_id FK
language_code FK
explanation

PK (migration_id, language_code)
```

Example:

```text
finished-vehicle tariff pressure
  ↓ localization
rules-of-origin / component-origin constraint
```

---

# 20. Temporal semantics

WSB needs at least three distinct times.

## occurred_at

When the real-world occurrence happened.

## observed_at

When WSB learned or recorded it.

## effective_from

When WSB considers the modeled state change to begin.

These must not be conflated.

Example:

```text
event happened       20 SEP
data published       24 SEP
WSB observed         25 SEP
state effective      20 SEP
```

---

# 21. Bitemporal direction

Full bitemporal SQL may be unnecessary in migration 001, but the logical model must preserve the path.

Two timelines:

### Valid time

When the state is considered true in the modeled world:

```text
valid_from
valid_to
```

### Record time

When WSB held/recorded that belief:

```text
recorded_at
superseded_at
```

Rule:

> A correction closes/supersedes the old record; it does not erase it.

This allows the query:

> What did WSB believe on 26 Sep about a state we now know was different?

---

# 22. Append-only policy

Analytical history is append-oriented.

Do not UPDATE old historical meaning in place except for strictly non-semantic technical fixes.

For substantive correction:

1. create replacement claim/observation/state;
2. point new record to superseded record;
3. preserve old record;
4. create correction metadata;
5. regenerate current materialized state;
6. do **not** silently regenerate old published snapshots.

Published snapshots remain immutable.

---

# 23. Snapshot model

## 23.1 snapshots

```text
snapshots
---------
id PK
snapshot_date
snapshot_type
created_at
schema_version
pipeline_version
content_hash
git_commit_sha NULL
storage_path
status
```

Types:

```text
daily
weekly
monthly
manual
```

## 23.2 snapshot_states

Logical membership:

```text
snapshot_states
---------------
snapshot_id FK
ledger_state_id FK

PK (snapshot_id, ledger_state_id)
```

The actual implementation may serialize a canonical JSON snapshot instead of storing every membership row if that proves cleaner.

Required invariant:

> Given a published snapshot ID, WSB can reproduce the analytical state exposed in that issue.

---

# 24. Briefs

## 24.1 briefs

```text
briefs
------
id PK
issue_code UNIQUE
brief_type
publication_date
snapshot_id FK
status
published_at NULL
created_at
```

Examples:

```text
WSB 004
daily
2026-09-26
```

## 24.2 brief_translations

One analytical issue, two editorial renderings.

```text
brief_translations
------------------
brief_id FK
language_code FK
title
dek NULL
intro NULL
closing_note NULL
publication_status
published_at NULL

PK (brief_id, language_code)
```

This allows `en` and `ua` publication times to differ without duplicating the Brief.

## 24.3 brief_items

```text
brief_items
-----------
id PK
brief_id FK
item_type
position
event_id FK NULL
state_change_id FK NULL
relation_id FK NULL
constraint_id FK NULL
adaptation_id FK NULL
metadata_json
```

Item types may include:

```text
system_shift
bottleneck_watch
chain_of_day
weaponized_interdependence
noise_check
ledger_delta
```

## 24.4 brief_item_translations

```text
brief_item_translations
-----------------------
brief_item_id FK
language_code FK
headline NULL
summary NULL
body NULL
annotation NULL

PK (brief_item_id, language_code)
```

Crucially:

> `en` and `ua` are translations/editorial renderings of the same structural Δ, not two separate analytical events.

---

# 25. Symbol grammar and localization

WSB symbols are language-independent.

Example:

```text
◈ RARE EARTHS · CN ⇢ EU · × REFINING · CN ↑ · ⧖ YEARS
```

Ukrainian rendering:

```text
◈ РІДКІСНОЗЕМЕЛЬНІ · CN ⇢ EU · × ПЕРЕРОБКА · CN ↑ · ⧖ РОКИ
```

The structural symbols and entity IDs remain stable.

Therefore symbol mappings belong in code/config, while visible labels belong in translations.

---

# 26. Mini-history encoding test A — rare earths

This is conceptual row-level behavior.

### T1: initial state

```text
relation R1:
EU downstream industry DEPENDS_ON rare-earth separation/refining

state S1:
R1 / dependency = high

state S2:
R1 / substitutability = low

constraint C1:
separation/refining capacity

state S3:
C1 / constraint_status = binding

state S4:
China / R1 / leverage = high
```

### T2: export licensing tightens

```text
source → claim → observation O1 → event E1

constraint C2:
export licensing

assessment A1:
delta_detected = true

Δ D1:
China / R1 / leverage
high → very_high

Δ D2:
C2 / constraint_status
latent → active
```

C1 remains binding.

### T3: alternative EU project announced

```text
event E2
adaptation B1 created
B1 status = planned

assessment:
current dependency unchanged
current substitutability unchanged
```

No false de-dependence Δ is created.

### T4: project operational at material scale

```text
B1 planned → operational
R1 substitutability low → medium
R1 dependency high → medium_high
```

All changes have separate evidence.

**PASS CONDITION:** current state and every historical belief are reconstructable.

---

# 27. Mini-history encoding test B — Hormuz

### T1

```text
constraint C10 = Strait of Hormuz
type = transport_chokepoint
flow = crude_oil + LNG
status = active
```

### T2: risk rises, throughput unchanged

```text
event E10

Δ:
C10 / risk elevated → high

claims:
insurance cost ↑
freight cost ↑

NO Δ:
throughput
```

The schema does not require physical interruption to represent increased constraint.

### T3: alternate route expands

```text
adaptation B10
status operational
capacity bounded
is_partial true
```

### T4: alternate terminal becomes constrained

```text
constraint C11 status active → binding

constraint_migration:
C10 → C11
type = partial_shift
adaptation = B10
```

**PASS CONDITION:** query can show that adaptation to Hormuz pressure contributed to a new capacity constraint elsewhere.

---

# 28. Mini-history encoding test C — EU–China EV

### T1

Separate relations:

```text
R20 Chinese components SUPPLY EU assembly
R21 Chinese capital INVESTS_IN EU production
R22 EU regulation GOVERNS vehicle market access
```

Leverage states:

```text
China / R20 / leverage = high
EU / R22 / leverage = high
```

No contradiction: leverage is scoped.

### T2: market-access rule tightens

```text
event E20

EU / R22 / leverage:
high → very_high
```

### T3: local assembly expands

```text
finished_vehicle_import_dependency ↓
local_assembly ↑
R20 component_dependency →
```

Possible migration:

```text
finished_vehicle tariff constraint
    ↓
component-origin / rules-of-origin constraint
```

**PASS CONDITION:** localization does not automatically become “China dependency down.”

---

# 29. Mini-history encoding test D — no-change summit

```text
event E30:
high-profile diplomatic meeting

observations:
O30, O31, O32

assessment A30:
delta_detected = false

dimensions:
export_controls = unchanged
critical_mineral_access = unchanged
tariffs = unchanged
substitutability = unchanged
leverage = unchanged
```

No new `ledger_states` required.

No `state_changes` created.

The event can still appear in:

```text
brief_item.item_type = noise_check
```

with two localized explanations:

```text
en
ua
```

**PASS CONDITION:** WSB can publish a structurally meaningful “nothing changed” conclusion without polluting state history.

---

# 30. Derived current-state view

The application should expose a materialized/logical view equivalent to:

```text
current_ledger_state
```

For each active scope + dimension:

- choose the latest non-superseded state valid at query time;
- retain confidence;
- retain evidence chain;
- retain effective date.

The current view is disposable and rebuildable.

Historical rows are not.

---

# 31. Translation completeness view

Create a logical QA view:

```text
translation_completeness
```

For publishable objects, show:

```text
object_type
object_id
en_present
ua_present
missing_language
publication_blocking
```

Suggested publication rule for Daily:

> A bilingual Daily issue cannot reach final `published` status until all reader-visible editorial items have both `en` and `ua` content.

Evidence/source-native text is exempt.

---

# 32. API consequences

Language is a presentation parameter, not an analytical identity.

Good:

```text
GET /api/events/WSB-EV-20260926-0042?lang=ua
GET /api/events/WSB-EV-20260926-0042?lang=en
```

Both return the same structural event with localized labels.

Bad:

```text
/api/ua-events/...
/api/en-events/...
```

Snapshot machine data should remain language-neutral where possible, with localized editorial payloads referenced separately.

---

# 33. HTML consequences

One analytical issue can produce:

```text
/en/brief/2026-09-26/index.html
/ua/brief/2026-09-26/index.html
```

Both point to the same:

```text
issue_id
snapshot_id
system_event IDs
state_change IDs
```

Only presentation changes.

A future single-file bilingual HTML variant is possible, but should not be required for v0.1.

Two generated HTML documents are simpler for:

- SEO;
- sharing;
- accessibility;
- canonical URLs;
- editorial QA.

---

# 34. What SQL migration 001 should implement

The first physical migration should be narrower than this entire logical document.

Recommended minimum:

```text
languages
entities
entity_translations
entity_aliases

flows
flow_translations

value_chains
value_chain_nodes
value_chain_node_translations

relations
relation_flows

constraints
relation_constraints

sources
claims
claim_sources
observations
observation_claims

system_events
event_observations
event_relations
system_effect_assessments
assessment_dimensions

state_dimensions
ledger_states
state_changes
change_evidence

adaptations
adaptation_targets

constraint_migrations

snapshots
briefs
brief_translations
brief_items
brief_item_translations
```

Rent tables may enter migration 001 if the first real dataset needs them; otherwise migration 002.

---

# 35. SQL invariants to enforce

Migration 001 should enforce as much as practical:

1. language codes are FK-backed and seeded with `en`, `ua`;
2. translated object has max one row per language;
3. public event IDs are unique;
4. state change `after_state_id` is mandatory;
5. a no-change assessment can exist without any state change;
6. historical states are never cascade-deleted from published snapshots;
7. source URLs are unique when present;
8. supersession cannot point to self;
9. validity intervals cannot end before they begin;
10. publication references a snapshot;
11. `en` and `ua` Brief translations share one Brief ID;
12. relation/state scope validation prevents meaningless combinations.

---

# 36. Decision log added in v0.2

### DECISION — bilingual core from day one

WSB launches with:

```text
en
ua
```

Localization is not an afterthought.

### DECISION — analytical identity is language-neutral

A Δ exists once.

It may have two reader-facing explanations.

### DECISION — use `ua`, not `uk`, internally

This is an explicit WSB product convention.

Do not auto-correct it in code.

### DECISION — source language is separate

Evidence may be in any language.

### DECISION — bottleneck = temporal state of a constraint

Provisional, but strong enough to test in SQL.

### DECISION — leverage is scoped

No global actor leverage score.

### DECISION — no-change assessment is first-class

This protects WSB from becoming a news archive.

### DECISION — hybrid temporal model

Append-only state transitions + reproducible snapshots.

---

# 37. Next file

Now write:

```text
schema/001_initial.sql
```

But keep it intentionally boring.

PostgreSQL first.

No ORM assumptions.

No graph database.

No vector layer.

No application framework leakage.

The migration should implement only what the four stress tests require and should ship with seed rows for:

```text
languages: en, ua
top-level flows
state dimensions
basic controlled vocabularies where appropriate
```

Then add a fixture representing the four mini-histories and prove these queries:

1. reconstruct state at date T;
2. retrieve evidence behind a Δ;
3. retrieve events with no Δ;
4. show bottleneck migration;
5. render the same Brief in `en` and `ua`;
6. list missing translations;
7. preserve an old belief after correction.

If those seven pass, System Ledger v0.1 is real enough to start feeding the HTML renderer.
