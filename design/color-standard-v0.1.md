# WSB Color Standard v0.1

Status: working standard for laboratory issues 0001–0004.

## Premise

WSB colour should feel printed, mineral and material rather than screen-native.

**PAPER, NOT WHITE.**  
**GRAPHITE, NOT BLACK.**  
**PIGMENT, NOT RGB.**  
**COLOR IDENTIFIES; GEOMETRY EXPLAINS.**

No canonical WSB colour may be pure white (`#ffffff`), pure black (`#000000`), or pure red (`#ff0000`). Saturated primaries are avoided throughout.

## Two jobs of colour

1. **Identity** — recurring actors and system territories can own stable pigment families.
2. **Attention** — tone/value within a family directs the eye and establishes hierarchy.

Colour does **not** carry structural meaning by itself. Flow, bottleneck, interruption, adaptation, lifecycle and uncertainty must remain legible through geometry, line, mark, label or pattern in monochrome.

## Neutral substrate

| Token | Hex | Use |
|---|---|---|
| PAPER-050 | #F7F3E9 | light field / reversed inset |
| PAPER-100 | #F1ECE0 | canonical sheet |
| PAPER-200 | #E6DFD0 | secondary field |
| PAPER-300 | #D7CEBD | rule field / inactive zone |
| GRAPHITE-300 | #8B877E | tertiary annotation |
| GRAPHITE-500 | #68655E | secondary text |
| GRAPHITE-700 | #403F3A | diagrams / rules |
| GRAPHITE-850 | #292A27 | primary text |
| GRAPHITE-950 | #1C1D1B | densest mark, never pure black |

Canonical body text begins at GRAPHITE-850, not black.

## Actor pigment families

Each family has five usable values. 100 is atmospheric/field colour; 300 secondary; 500 identity; 700 emphasis; 900 dense mark.

| Family | 100 | 300 | 500 | 700 | 900 |
|---|---|---|---|---|---|
| OXIDE / China | #E7D1C8 | #C99080 | #A85E4F | #7F443B | #55332F |
| FEDERAL / US | #D6E0E4 | #93ACB8 | #5F7F90 | #405F70 | #2D4653 |
| VIOLET / EU | #DEDCE5 | #AAA5BC | #7D7698 | #5D5877 | #403E58 |
| SAFFRON / India | #EADDBD | #CEB06F | #A88443 | #7E6234 | #55482F |
| BRASS / Gulf | #E5DCC8 | #BEA77A | #92794C | #6D593A | #4D432F |
| PETROL / Caspian | #CFDFDC | #8EADA8 | #5E837F | #41635F | #304A48 |

These are identities, not geopolitical judgments. Actor families should be assigned sparingly to recurring high-value nodes, not automatically to every country.

## Technical pigments

Technical families are available for neutral/non-actor structures and composition.

| Family | 100 | 300 | 500 | 700 | 900 |
|---|---|---|---|---|---|
| MINERAL | #DCE1D5 | #A9B59C | #77866D | #586651 | #3E493B |
| SLATE | #D9DEDF | #A4AFB1 | #748184 | #566164 | #3C4648 |
| DUST | #E3DDD3 | #BBB0A1 | #8E8171 | #695F53 | #49443D |

Do not create a new technical family merely to decorate a story.

## Usage grammar

- Actor identity normally enters at 500.
- Use 100–300 for fields, halos, zones and context.
- Use 700–900 for focal nodes or compact dense marks.
- Prefer one actor family plus graphite for simple diagrams.
- Multi-actor diagrams may use multiple actor families when identity materially improves reading.
- Do not use colour as the sole carrier of status, direction, constraint, confidence or lifecycle.
- Bottleneck is `×` / geometry first, not “red”.
- Adaptation is route geometry first, not “blue”.
- Rent is `◇` / attachment first, not “green”.
- Policy is `§` / intervention geometry first, not “red”.
- Colour must survive conversion to grayscale without destroying the model.
- Background remains paper-toned; white may exist only when imposed by an external medium, never as a WSB design token.

## Composition rule

A daily issue may select a dominant pigment family from its dominant mechanism, but that does not change the permanent identity of actors. Editorial colour may vary in area and intensity; semantic identity must remain stable.

## Test sentence

**Geometry says WHAT. Colour says WHO and WHERE TO LOOK.**

## Acceptance tests

A WSB colour composition passes only if:

1. no pure white, black or red is used as a canonical token;
2. the sheet still reads as a coherent object with 30–40 available shades;
3. actor identity becomes faster to read after repeated exposure;
4. removing colour preserves structural meaning;
5. no colour is asked to mean both an actor and a structural state;
6. pale values work on PAPER-100 without becoming invisible;
7. GRAPHITE-850 carries body text without the digital harshness of black;
8. the palette feels materially related: ink, oxide, mineral, brass, petrol, paper.

Exact values remain provisional until tested across the first four real issues and print/export paths.
