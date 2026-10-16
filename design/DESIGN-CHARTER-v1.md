# WORLD SYSTEM BRIEF — DESIGN CHARTER 1.0

**Status:** Approved art direction · 2026-10-16  
**Concept:** Editorial Atlas / Atlas System  
**Formula:** Editorial atlas + engineering precision + avant-garde poster expression.

## Purpose
WSB is a daily atlas of changes in the world system, not a breaking-news feed, generic blog or dashboard. Its visual language must communicate flows, dependencies, bottlenecks, substitution, leverage, rent and adaptation with evidence and time context.

## Three publishing modes
- **READ — editorial journal:** warm-paper reading environment, rigorous hierarchy, comfortable long-form typography, source notes and citations.
- **SYSTEM — analytical atlas:** modular geometry, consistent status symbols, entity timelines, flow graphs, relationship labels, and a System Ledger that distinguishes observations from confirmed state changes.
- **POSTER — visual thesis:** striking typographic or geometric image with one structural claim; controlled asymmetry, strong contrast and very little copy. Expression must not overstate evidence.

## Shared editorial principles
1. **Paper as substrate.** Warm, tactile editorial tone rather than cold dashboard white.
2. **Color encodes meaning.** Never use semantic status colors as decoration alone.
3. **Typography establishes hierarchy.** Confident display style, readable editorial body, precise data/mono labels; full-quality English and Ukrainian support.
4. **Diagrams explain mechanisms.** Show what changed, which flow is affected, where the bottleneck sits, substitutability and time horizon, distribution of leverage and rent.
5. **A proposal is not an event.** Dated evidence, discussion and confirmed transitions must never share the same indicator.
6. **Accessibility.** Every meaning survives monochrome reproduction and is distinguishable through text and shape.

## Working color tokens (provisional hexadecimal values)
| Token | Hex | Role |
|---|---|---|
| paper | #F3EBDD | primary background |
| paper-deep | #E8DDCC | secondary surface |
| ink | #232523 | primary text |
| ink-soft | #4A4B47 | secondary text |
| system-red | #A2362A | confirmed delta / rupture |
| rust | #7F2A23 | deep accent |
| flow-blue | #46697A | flow / connectivity |
| steel-blue | #708893 | secondary flow / evidence |
| constraint-ochre | #B08C3E | bottleneck / friction |
| line-gray | #9B9386 | separators |
| rule-light | #CFC4B3 | quiet rules |
| rule-dark | #5B564E | heavy rules |

Color values are *design tokens*, not proof of accessible contrast; test them in real combinations before shipping.

## Status grammar
| Status | Text marker | Shape | Color |
|---|---|---|---|
| confirmed_delta | Δ | solid filled marker | system-red |
| developing | ~ | open/dashed frame | ochre + ink |
| persistent | = | thin outlined shape | ink / subdued blue |
| evidence_update | + | outline with point marker | flow-blue |
| rejected / noise | × | struck, muted element | gray |

Avoid treating escalation, volatility and confirmed delta as interchangeable concepts. A red mark must be tied to a dated confirmed transition.

## Typography roles
- **Display:** confident condensed or semi-condensed sans for masthead, issue headers, figures and posters; Ukrainian glyph quality essential.
- **Editorial:** bookish, legible long-read face for READ.
- **Data / mono:** dates, evidence IDs, state labels, chart annotation, entity codes, measurements.

Specific font families are **not yet selected**. Test typography in both EN and UA; do not lock in families before the style-tile prototype.

## Layout
- Responsive 12-column underlying grid.
- READ: generous reading measure; narrow parallel metadata / source column when viewport allows.
- SYSTEM: dense-but-legible modular grid, graphs, state transitions, entity cards, timeline and consistent legend.
- POSTER: inherits core type, palette, legend conventions; may break editorial grid deliberately for one clear visual thesis.

## Core components
1. Masthead: WORLD SYSTEM BRIEF; date, issue number, language and publication mode.
2. Issue header: headline, dek, structural takeaway, *confirmed delta count*.
3. Source block: dated, clickable source, type, claim supported, editorial assessment.
4. Ledger strip: **flow → dependency → bottleneck → substitution horizon → leverage → rent → adaptation**.
5. Entity card: name, type, entering/current states, status, dependencies, linked issue history.
6. Noise check: excluded claims and why they did not meet evidence/change standards.
7. Chain of the day: causal path; distinguish evidenced links from hypotheses and unrelated analogies.

## Site architecture
- **Home:** daily edition as editorial cover, structural takeaway, system map preview, recent entities, archive / ledger entry points.
- **Issue:** coordinated READ / SYSTEM / POSTER with evidence and source access.
- **Entity:** evolving state, timeline, dependencies, leverage history, source-backed issue appearances.
- **Archive:** searchable dates, headlines, delta counts and key mechanisms, not only a chronological list.
- **Ledger:** persistent structured memory across issues, never replaced by the issue narrative.

## Motion and interaction
Use restrained interactions: expand source notes; highlight corresponding entity/edge; inspect historical states; label changes. Prefer immediate comprehension, keyboard accessibility and low-motion preferences over spectacle.

## Next deliverables
1. **Style tile:** color tokens, candidate EN/UA type pairings, hierarchy, sample evidence / ledger UI.
2. **Component sheet:** statuses, source blocks, entities, ledger strips, controls, legends.
3. **Wireframes:** homepage, daily READ/SYSTEM page, entity page and poster template.
4. **Prototype:** implement on a separate branch; validate mobile, source visibility, accessibility and print/export.

## Scope of approval
**Approved:** editorial direction, three modes, diagram-first semantics, functional color, warm substrate, design principles and component architecture.  
**Provisional:** precise hex values, fonts, spacing/size scales and individual screens. They require visual prototype and review before production implementation.

This charter is the design baseline for subsequent WSB work. Editorial truth and source traceability supersede visual drama.
