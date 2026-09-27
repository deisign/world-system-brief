# WSB Color Standard v0.2

Status: working palette after first rendered color proof. Still provisional until tested across laboratory issues 0001–0004 and print/export.

## Premise

WSB colour should feel printed, mineral and material rather than screen-native.

**PAPER, NOT WHITE.**  
**GRAPHITE, NOT BLACK.**  
**PIGMENT, NOT RGB.**  
**COLOR IDENTIFIES; GEOMETRY EXPLAINS.**

No canonical WSB colour may be pure white (`#ffffff`), pure black (`#000000`), or pure red (`#ff0000`). Saturated primaries are avoided throughout.

## Proof 0.1 findings

The first rendered proof established:
- Paper + Graphite works as the substrate.
- Oxide/Dust are related but clearly distinct.
- Federal/Slate remain distinguishable.
- Petrol/Mineral remain distinguishable.
- 900 values remain visibly pigmented rather than collapsing into black.
- Saffron/Brass collide too strongly, especially at 700–900.

v0.2 therefore changes the Saffron and Brass families and lightly normalizes pale 100 values. Other families remain controls.

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

## Actor pigment families

| Family | 100 | 300 | 500 | 700 | 900 |
|---|---|---|---|---|---|
| OXIDE / China | #E7D1C8 | #C99080 | #A85E4F | #7F443B | #55332F |
| FEDERAL / US | #D6E0E4 | #93ACB8 | #5F7F90 | #405F70 | #2D4653 |
| VIOLET / EU | #DEDCE5 | #AAA5BC | #7D7698 | #5D5877 | #403E58 |
| SAFFRON / India | #E9D7A8 | #D0A94E | #B18428 | #86631F | #5C491F |
| BRASS / Gulf | #E2DACB | #B6A17F | #8A7454 | #65543F | #463D33 |
| PETROL / Caspian | #CFDFDC | #8EADA8 | #5E837F | #41635F | #304A48 |

Saffron now moves toward mustard/golden pigment. Brass moves toward aged metal/bronze. Their dark values should no longer resolve into the same ochre-brown family.

## Technical pigments

| Family | 100 | 300 | 500 | 700 | 900 |
|---|---|---|---|---|---|
| MINERAL | #DCE1D5 | #A9B59C | #77866D | #586651 | #3E493B |
| SLATE | #D9DEDF | #A4AFB1 | #748184 | #566164 | #3C4648 |
| DUST | #E3DDD3 | #BBB0A1 | #8E8171 | #695F53 | #49443D |

## Usage grammar

- 100 = field / atmosphere.
- 300 = secondary.
- 500 = normal identity.
- 700 = emphasis.
- 900 = dense mark.
- Colour never carries structural meaning alone.
- Bottleneck = geometry `×`, not red.
- Policy = `§`, not red.
- Adaptation = route geometry, not blue.
- Rent = `◇` attachment, not green.
- Grayscale must preserve the model.
- Actor colours are stable identities; editorial area/intensity may vary by issue.

## Test sentence

**Geometry says WHAT. Colour says WHO and WHERE TO LOOK.**

## Acceptance tests for proof 0.2

1. Saffron and Brass are distinguishable at a glance at 300–900.
2. Their 100 values remain compatible with PAPER-100.
3. All families still feel like one physical box of inks.
4. No 900 value reads as black.
5. No family becomes digitally saturated.
6. Structural meaning survives grayscale.
7. Oxide remains red without becoming digital red.

Exact values remain provisional until real-issue and print/export testing.
