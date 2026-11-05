# World System Brief — Editorial contract for physical engravings

**Status:** editorial rule v1 · 2026-11-05  
**Reference plate:** `tanker-study-01`  
**Reference composition:** `Hormuz: chokepoint and bypass`

## The object is not the claim

A physical engraving depicts the **material form of a system component**. It is not an illustration-per-entity, an event reconstruction, a geographic map, or an evidence-bearing diagram. In a structured WSB publication, meaning comes from a deliberate three-part editorial association:

1. **Material form:** an identifiable carrier, machine, facility or physical infrastructure component, rendered accurately enough for the stated scope.
2. **System mechanism:** a separately articulated dependency, flow, bottleneck, substitution question or other structural process in which that form participates.
3. **Evidence and bounds:** an independently sourced explanatory diagram/claim connecting that mechanism to particular entities, routes, time periods and capacities. A vector engraving is **not evidence** for those assertions.

In short: **engravings embody systems; diagrams explain them; sources substantiate the explanation.**

## Reference case: tanker-study-01

**What the plate actually depicts:** a generic, procedural three-quarter view of an oil tanker, its hull, superstructure and cargo deck. It depicts a *physical carrier for seaborne oil transport*.

**What the plate does not depict:** the geography of Hormuz; a specific vessel, cargo or voyage; a maritime incident; a blockade; demonstrated throughput; the volume of oil lost through a route closure; or measured substitutability of pipelines.

**What the existing spread establishes, separately from the plate:** “Hormuz: chokepoint and bypass” juxtaposes that carrier with an analytical diagram of the Strait of Hormuz, East–West, and Habshan–Fujairah routing possibilities. Its thesis is **PARTIAL BYPASS IS NOT FULL SUBSTITUTION**. The thesis is a statement about evidence-bounded route alternatives, not a conclusion drawn from the engraving's visual appearance.

**Why it can be reused:** a tanker remains a physical carrier in other source-backed oil-shipping studies even if the geographic bottleneck changes. Reuse is legitimate if its caption stays generic, the accompanying study supplies its own validated claims, and the plate is not made to appear to document a specific incident.

## Editorial rules for new plates

- No **one entity → one engraving** rule. A plate is commissioned only if a physical form makes an otherwise abstract system mechanism more perceptible.
- A recurring mechanism may have multiple *physical forms*, and one physical plate may accompany multiple *studies*. The relationship is curated, not automatic.
- The subject must be explicitly scoped as a **generic physical type**, **specific engineered object**, or **evidence-backed reconstruction**. Do not blur the three.
- The caption must describe **what can be seen** and state critical limits; it must not silently assign geographic location, ownership, operating state, technical performance or event attribution.
- The caption and accessible alternative text must be authored in both English and Ukrainian, with no extra claims in either language.
- Render approval and model provenance are necessary but not sufficient: editorial approval must separately specify physical role, allowed contexts, excluded interpretations and associated studies.
- The publishing system must reject missing editorial metadata and invented or broken internal references. Linking to a canonical entity is context, **not** proof that the plate depicts that particular entity.
- Analytical diagrams remain separate and cite factual observations. Image geometry, proportions and hatch density cannot imply quantitatively measured capacities.
- Plates live in a reusable illustration catalog with stable IDs; issues can reference them, but the release pipeline must never auto-generate new engraving just because an entity appears in a claim.

## First catalog entry: explicitly scoped

| Field | Decision |
|---|---|
| ID | `tanker-study-01` |
| Subject class | `generic_physical_carrier` |
| Depicted role | Oil tanker as physical cargo carrier |
| System mechanism | Seaborne oil movement requires maritime transport and route access |
| Material scope | Generic hull, bridge/superstructure, cargo deck |
| Canonical context | `hormuz`, `gulf-oil-flow` (connections, not literal depictions) |
| Existing editorial composition | `/{lang}/visualizations/chokepoint-bypass/` |
| Main thesis when paired with diagram | Partial bypass is not full substitution |
| Excluded meanings | Specific ship or voyage, actual tanker loss, exact capacity, evidence of route closure, pipeline equivalence |
| Rendering status | `reviewed` SVG from Draw Beautiful; actual upstream model revision pinned in manifest |
| New factual claims | None |

The catalog entry supplies the reusable plate's **editorial semantics**; the spread supplies the **case-specific mechanism**; the canonical issue/ledger supplies the **dated evidence**.

## Commissioning checklist

A new engraving can be approved only when an editor can answer, in complete sentences: *Which physical form are we depicting? Which systemic mechanism does it illuminate? What does it not prove? Which existing analytical compositions may use it? Why is a drawing better than the diagram alone?*

If those questions have no distinct answers, the task is a diagram, a sourced photo, or no image at all—not a new physical engraving.

**Open question for future releases:** whether the illustration catalog should become its own navigable atlas section. This is not a reason to create additional images prematurely.
