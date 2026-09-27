# WSB Symbol Standard v0.1

**Status:** working standard for laboratory issues 0001–0004  
**Applies to:** READ diagrams, SYSTEM interface, POSTER, Ledger visualizations, social derivatives  
**Principle:** symbols encode modeled system state. They are not decoration.

## 1. Purpose

World System Brief needs a compact visual language for flows, dependencies, bottlenecks, leverage, rents, adaptation and state change. The same analytical object should remain legible in plain text, HTML/SVG, a static poster and print.

The standard therefore has two layers:

1. **Semantic layer** — stable meaning independent of renderer.
2. **Rendered layer** — Unicode/text fallback plus WSB SVG primitives.

A renderer may improve geometry. It may not change semantics.

## 2. Core rules

1. **If the arrow did not move, it is not a new Δ.**
2. Every visual distinction must correspond to a data distinction.
3. Never use line weight, color, size or position merely for drama.
4. Operational and future/committed flows must look different.
5. Event, assessment, Δ and state are distinct objects.
6. Bottlenecks may migrate. The diagram must preserve both the relieved constraint and the new constraint.
7. Leverage is scoped: actor + dependency + node + horizon.
8. A persistent state is not a fresh Δ.
9. Unicode is the fallback contract; SVG is the canonical graphical rendering.
10. The vocabulary should stay small enough to learn. v0.1 deliberately limits atomic symbols.

## 3. Atomic semantic vocabulary

| Token | Name | Meaning | Do not use for |
|---|---|---|---|
| `Δ` | STATE CHANGE | modeled state changed since comparison state | mere event/news |
| `⇢` | FLOW | directional movement of goods, energy, capital, technology, data or labour | causality |
| `⇄` | INTERDEPENDENCE | material two-way dependency | ordinary two-way trade without dependency |
| `×` | BOTTLENECK | binding constraint, interruption or materially constrained node/edge | generic risk |
| `↑` | STATE UP | measured/assessed state variable increased | trend without state change |
| `↓` | STATE DOWN | measured/assessed state variable decreased | trend without state change |
| `→` | NO MATERIAL CHANGE | assessed state materially unchanged | unknown |
| `↗` | STRENGTHENING | directional process/trend strengthening | completed state change |
| `↘` | WEAKENING | directional process/trend weakening | completed state change |
| `↪` | ADAPTATION / BYPASS | route, supplier, technology or institutional adaptation around a constraint | ordinary alternate route |
| `⧖` | SUBSTITUTION HORIZON | time required for credible substitution | generic delay |
| `◇` | RENT | economic rent / surplus captured because of position in the system | revenue generally |
| `§` | POLICY INTERVENTION | regulation, sanction, tariff, export control, standard, licensing or comparable state rule | politics generally |
| `∴` | CONSEQUENCE | modeled downstream consequence | chronological next event |

### Critical distinction: `↑ ↓` vs `↗ ↘`

`↑/↓` mean the **state itself changed**.  
`↗/↘` mean a **process is strengthening or weakening**.

Example: pipeline capacity is unchanged but pressure to expand it is increasing: `capacity →`, `constraint pressure ↗`.

## 4. Flow-line grammar

Text fallback:

```
━━━━━━▷   established major / primary flow
──────▷   established secondary flow
┄┄┄┄┄▷   committed, proposed or expected flow; not yet operational
━━━━×     materially constrained or interrupted flow
━━━↪━━▷   adaptation / bypass route
◉━━━━▷    source node feeding a flow
━━━━▷◉    destination / market node
◉━━⇄━━◉   material interdependence
```

### Line weight

Line weight may encode relative materiality **only when the underlying issue data supports the comparison**. If no comparable quantity or justified ordinal assessment exists, use the default weight.

Never make oil thicker than data merely because oil is visually important.

### Dashed lines

Dashed/dotted lines mean **not presently operational at the represented state**. They require an epistemic or lifecycle label such as `FID`, `PLANNED`, `PROPOSED`, or `DEVELOPING`.

A final investment decision is not an operating pipeline.

### Arrowheads

Arrowheads encode direction of the modeled flow, not political influence. Leverage is annotated separately.

## 5. Domain vocabulary

Unicode/text fallback:

| Token | Domain |
|---|---|
| `⚡` | ENERGY |
| `◈` | MATERIALS |
| `⚙` | INDUSTRY |
| `▦` | TECHNOLOGY |
| `$` | CAPITAL |
| `♟` | LABOUR |
| `⌁` | DATA |
| `↔` | TRADE |
| `§` | REGULATION / STATE RULES |

These are semantic fallbacks, not a mandate to reproduce platform glyphs in the poster. Canonical HTML/POSTER rendering should use a custom monochrome SVG family with common geometry and stroke weight. Avoid emoji styling and illustrative miniatures.

## 6. Nodes

The default node is geometric, not pictorial.

```
◉  actor / source / market node
□  infrastructure / facility / transformation node
◇  rent marker when attached to an edge or node
×  binding constraint attached to the constrained node or edge
```

Labels carry identity. A refinery does not require a tiny refinery drawing to be understood.

## 7. Epistemic and lifecycle state

The visual system must distinguish what exists from what is expected.

| State | Rendering rule |
|---|---|
| CONFIRMED / OPERATIONAL | solid node/edge |
| CONFIRMED CHANGE, NOT YET EFFECTIVE | solid annotation + future/dashed edge |
| COMMITTED / FID | dashed future edge + explicit `FID` |
| DEVELOPING | dashed edge/node + `DEVELOPING` |
| UNCERTAIN | dotted/light treatment + `UNCERTAIN` |
| PROJECTION | dotted future edge + horizon |
| PERSISTENT | existing solid state + `→ PERSISTENT`; never fresh `Δ` |
| REVERTED | prior constraint retained in history; current edge restored + `REVERTED` |
| SUPERSEDED | historical state remains addressable; current view points to successor |

Color must never be the sole carrier of epistemic state.

## 8. Leverage notation

Leverage is never a free-floating claim that actor A “controls” actor B.

Minimum annotation:

```
SOURCE ━━━━━▷ DEPENDENT
   ↑
LEVERAGE
low substitutability
⧖ 5–10Y
```

A leverage claim should be resolvable to:
- actor/node holding the position;
- dependent flow or capability;
- substitutability;
- substitution horizon;
- enforcement or constraint mechanism;
- relevant scope.

## 9. Bottleneck migration

Migration is first-class.

```
BEFORE

A ━━━━━×━━━━▷ B
       X₁

AFTER ADAPTATION

A ━━━↪━━▷ C ━━━━━×━━━━▷ B
                    X₂

X₁ ↓ relieved
X₂ ↑ new binding constraint
```

Do not draw the original bottleneck as “solved” if the constraint merely moved upstream or downstream.

## 10. Weaponized interdependence

```
A ━━━━━§×§━━━━▷ B
       EXPORT
       CONTROL
```

`§` identifies an institutional/state mechanism. `×` is used only when that mechanism materially constrains the modeled flow.

For relaxation:

```
A ━━━§━━▷ B
    tariff
      ↓
 friction
```

A diplomatic statement without a changed rule or flow gets no `§ Δ`.

## 11. Rent

Rent is attached to the position that captures it:

```
SOURCE ━━━▷ BOTTLENECK × ━━━▷ MARKET
                  │
                  ◇
             RENT CAPTURE
```

When adaptation changes rent distribution, show direction explicitly:

```
OLD NODE  ◇ ↓
BYPASS    ◇ ↑
```

Do not use `◇` for ordinary turnover, profit or market size.

## 12. No material change

No-change is an analytical result.

```
A ━━━━━━━━━━━▷ B
       →
NO MATERIAL Δ
```

Use it when an event was assessed and the modeled relation remains materially unchanged. Do not use it as filler for lines that were not examined.

## 13. Poster hierarchy

Every POSTER must work at three distances.

**Far:** masthead, dominant mechanism, `Δ`, `×`, direction and day-state.  
**Middle:** system geometry, named nodes, secondary Δs, bypasses, bottleneck migration.  
**Near:** values, horizons, confidence/lifecycle, Ledger labels, evidence/source references.

Rule:

> One system mechanism becomes the composition.

The POSTER is not a dashboard screenshot. It is a static projection of the same issue state.

## 14. Color

v0.1 defines roles, not final color values.

- **INK** — ordinary state, labels, established flows.
- **CHANGE** — confirmed Δ / editorial emphasis.
- **UP / RELIEF** — improving capacity, restored flow, reduced constraint where direction matters.
- **DOWN / CONSTRAINT** — interruption, binding constraint, deterioration where direction matters.
- **MUTED** — historical, secondary or epistemically weaker information.

Color is redundant with shape/text. A monochrome print must remain semantically complete.

Final palette values are deferred until specimen testing.

## 15. Four real-issue stress tests

### A. Hormuz — persistent bottleneck + bypass

```
GULF OIL ◈ ━━━━━× HORMUZ ━━━━━▷ MARKET
               │
               ↪
          EAST–WEST PIPELINE
               ━━━━━▷ YANBU / RED SEA

HORMUZ          → PERSISTENT
BYPASS CAPACITY ↗
```

The bypass does not erase Hormuz. It changes substitutability and the distribution of pressure.

### B. India captive power — function change + bottleneck migration

```
COAL ◈ ━━━▷ CAPTIVE POWER ⚡
                 ├━━▷ INDUSTRY ⚙
                 │
                 ↪━━▷ GRID ⚡
                        Δ

COAL INVENTORY / LOGISTICS ×
```

The new grid edge is operationally meaningful. Mobilizing generation shifts attention upstream toward fuel inventory and logistics.

### C. Absheron II — committed future flow

```
CASPIAN GAS ◈
     │
     └┄┄┄▷ ABSHERON II ┄┄┄▷ AZERBAIJAN ┄┄┄▷ EU
             FID · ⧖ 3–4Y
                                      ×
                              PIPELINE CAPACITY
```

Dashed geometry prevents future capacity from masquerading as present flow.

### D. US–China tariffs — narrow policy-friction reduction

```
US ◉ ━━━§━━⇄━━§━━ ◉ CHINA
       tariff layer
           ↓
   selected-goods friction

strategic dependencies → PERSISTENT
```

The symbol grammar shows a narrow policy change without visually implying general decoupling or general normalization.

## 16. Composition rules

1. Prefer relationships over icons.
2. Prefer one dominant system geometry over a grid of equal cards.
3. Labels should sit on or next to the edge/node they qualify.
4. Never make every story a `Δ`; persistence and no-change are legitimate outputs.
5. Do not encode causality with proximity alone.
6. Do not use flags as node icons.
7. Avoid politician portraits, globes, dramatic military arrows and stock-photo symbolism.
8. Avoid colorful emoji glyphs in canonical output.
9. A diagram must remain intelligible when copied into plain text.
10. If a diagram needs a paragraph to explain what its symbols mean, simplify it.

## 17. Renderer contract

Each rendered primitive should eventually map to a stable semantic type rather than ad-hoc SVG:

```
flow
interdependence
bottleneck
adaptation
policy_intervention
rent
leverage_change
state_change
no_material_change
substitution_horizon
consequence
```

Suggested edge attributes:

```
status: operational | committed | developing | uncertain | projected
materiality: primary | secondary | unspecified
direction: forward | reverse | bidirectional
constraint: none | partial | interrupted
change: up | down | strengthening | weakening | unchanged
```

These names are provisional until the first four issues expose what the renderer actually needs. Do not turn them into SQL schema yet.

## 18. v0.1 acceptance test

The standard passes an issue only if:

- a reader can identify the dominant flow and bottleneck without prose;
- operational vs future state cannot be confused;
- `Δ` vs persistence/no-change is visually explicit;
- bottleneck migration can be drawn without inventing a new symbol;
- leverage can be scoped with horizon/substitutability;
- adaptation can be distinguished from an ordinary alternate route;
- the composition survives monochrome output;
- text fallback preserves the analytical meaning;
- the same semantics can drive SYSTEM HTML and POSTER SVG.

## 19. Deferred to v0.2

Do **not** expand the vocabulary yet for:
- shipping-specific pictograms;
- food/agriculture iconography;
- company/country logo systems;
- quantitative line-width scales;
- exact palette;
- animation grammar;
- map projection conventions;
- bespoke typography;
- dense network-layout rules.

Those decisions require evidence from real issues 0001–0004.

---

**WSB design rule:** *The arrow is the sentence. The bottleneck is the punctuation. Δ is earned.*
