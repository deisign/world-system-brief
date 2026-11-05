# Rare-earth separation study 01 — physical scene specification v0.2

**Status:** approved for technical blockout, **not** an approved engraving  
**Date:** 2026-11-05  
**Proposed plate ID:** \`rare-earth-separation-study-01\`  
**Editorial class to be added after plate review:** \`generic_processing_cascade\`  
**System mechanism:** concentration of *separation and refining capability* as an upstream bottleneck  
**Toolchain:** physical geometry → fixed camera/light → existing \`kit/intaglio.mjs\` / Draw Beautiful scene, genuine vector paths → reviewed SVG. Never substitute raster AI art or SVG-wrapped bitmaps.

## 0. Research-backed corrections to v0.1

A single mixer-settler extraction stage has a **mixing zone** and a **larger gravitational settling zone**. An agitator contacts the two phases; the dispersion enters the settler, and organic and aqueous phases are withdrawn separately through appropriate upper/lower outlets and controlled interfaces. An operating **countercurrent battery** feeds these two phases from opposite ends. This is not a single open water cascade flowing from tank to tank. Sources: Zhang et al. (2016), chapter 6, DOI **10.1007/978-3-319-28235-0_6**; [University of Michigan, Extractors](https://encyclopedia.che.engin.umich.edu/extractors/); [Minerals 2023, 13, 714](https://www.mdpi.com/2075-163x/13/6/714); [BCcampus, Engineering and Operating SX Circuits](https://pressbooks.bccampus.ca/hydrometallurgy/chapter/engineering-and-operating-sx-circuits/).

**Correction:** earlier proposed \`raffinate / waste\` and \`product / enriched stream\` outputs were too casual. The visualized *extraction bank* has distinct **raffinate (aqueous)** and **loaded organic** outputs. A purified/recovered rare-earth product generally involves additional scrubbing, stripping and recovery operations *outside the plate*. [Minerals 2023, Figures 2–4](https://www.mdpi.com/2075-163x/13/6/714); [RSC Advances, Nd/Dy mixer-settler experiment](https://pubs.rsc.org/en/content/articlehtml/2020/ra/c9ra08996a).

**Correction:** six visible stages are a **composition sample**, not a realistic or standard number for a complete rare-earth separation plant. Real circuits vary by the chemistry, selectivity and process goal. A documented lab-scale non-aqueous system used sixteen stages to split groups of heavy rare earths, not necessarily fully separate all individual elements: [Dewulf, Riaño & Binnemans (2022)](https://doi.org/10.1016/j.seppur.2022.120882).

## 1. The physical thesis

**What the plate depicts:** six repeated, technically plausible mixer-settler modules, each with distinct mechanical agitation and gravity separation zones; two independently routed phase systems; minimum supporting equipment.

**What it embodies:** material separation depends on a multi-stage industrial process and process know-how, **not just the existence of ore**.

**What it must not claim:** a particular Chinese installation; exact proportions of a real plant; rare-earth separation efficiency; throughput; industrial market share; safe operating instructions; particular reagents; a complete mine-to-magnet chain; or a literal map of a supply chain.

**Editorial relationship:** the plate embodies material form. A separately sourced SYSTEM diagram establishes \`ore → concentrate → hydrometallurgical separation → refined inputs → downstream manufacturing\`. Avoid implying that the plate alone proves national dependence or processing concentration.

## 2. Scene coordinate system and modular grid

Use **normalized model units**, not meters. These dimensions are *artist's blockout proportions*, not engineering equipment dimensions.

- \`X\`: line of six stages; stage indices \`S1 … S6\` increase left to right in a top-down diagram.
- \`Y\`: stage depth, front to rear.
- \`Z\`: height; \`Z=0\` floor reference.
- \`PITCH_X = 2.85 units\`, \`STAGES = 6\`; stage centers \`x = (i - 2.5) × 2.85\`, for \`i=0…5\`. Total nominal module extent ≈17.1 units along X before minimal inlets/outlets.
- Each stage footprint nominally \`2.6 × 2.2\`; maximum machinery top around \`z = 1.55\` including a short agitator drive.
- **Do not impose these units on throughput or a plant scale.** They only prevent inconsistent geometry and make revisions reproducible.

### Model primitives per stage

| ID | Quantity | Model primitive | Normalized size / position | Function / visual instruction |
|---|---:|---|---|---|
| \`MIXER_BODY\` | 1 | Rectangular rounded-edge prism or short cylinder | approx. \`0.85 × 1.00 × 0.90\` | One mixing compartment, placed at left portion of each stage. The exact industrial vessel shape varies; choose **rectangular** for a coherent repeated battery. |
| \`AGITATOR_SHAFT\` | 1 | Thin vertical cylinder | axis z, visible stem \`0.45\` | Makes this chamber visually distinct from the long settler |
| \`AGITATOR_MOTOR\` | 1 | Simple cylinder + cuboid mount | envelope \`0.38 × 0.38 × 0.32\` at z≈1.2 | Do not depict an impossibly huge reactor |
| \`SETTLER_BODY\` | 1 | Long rectangular open-topped trough | approx. \`1.55 × 1.5 × 0.78\` | **Larger than mixer**, calm separation zone |
| \`MIX_TO_SETTLE\` | 1 | Short contained channel / conduit | 0.28–0.40 long | Mixed dispersion passes into settling chamber; **not** a waterfall |
| \`INTERFACE_PLANES\` | 2 | Subtle near-horizontal surfaces inside settler | offset 0.10–0.14 | Only partly visible as simplified two-phase separation; not simulation of chemical concentrations |
| \`PHASE_OUTLETS\` | 2 | Upper withdrawal lip/channel and lower withdrawal port | two distinct z bands | Technical differentiation: lighter organic and heavier aqueous streams |
| \`FEET_FRAME\` | 1 | Four supports + low structural rails | at z≈0.1–0.3 | Gives object mass and structural credibility |
| \`ACCESS_LIP\` | 1 | Narrow rim + service cover | along settler side | Limited detail; prevents empty box look |

**Important:** the source-backed observation is that the settler is larger, not that the above geometric dimensions or volumes are a universal standard. Zhang et al. describe an example mixer/settler ratio of about 1:2.5 for rare-earth separation; proportions above are only a legible aesthetic proxy and should not be presented as reproducing that ratio in a functioning unit.

## 3. Interstage routing — mandatory technical correctness

### Topology, not an operating P&ID

One **extraction battery**, not entire conditioning/extraction/scrubbing/stripping facility:

- **Aqueous feed (REE-bearing)** enters the \`S1\` end and progresses in the positive X direction through mixers and settlers.
- **Lean organic solvent** enters from the \`S6\` end and progresses in the negative X direction through mixers and settlers.
- After a stage, separated phases transfer to the respective opposite-direction next-stage mixer via their distinct outlet/manifold routes.
- At the ends, conceptual outputs are **aqueous raffinate** at the \`S6\` end and **loaded organic** at the \`S1\` end. Neither is automatically pure rare-earth product.
- Single-stage visual loop: two phase inlets → mixer/impeller → dispersion transition → settler → two **separate** phase exits.

To avoid visually false one-way movement:

1. Render **two visually distinct continuous interstage pipe systems** (one low/front, one elevated/rear) with dedicated short branch connections. Do **not** merge both liquids into one product pipe.
2. For publication art, **no direction arrows inside the engraving**. A companion mechanism diagram must label \`aqueous →\`, \`← organic\`, and both outlet identities with sourced technological context.
3. Vertical gradients and pipe level differences are illustrative; don't imply a specific gravity-driven pressure design.
4. No uncontrolled waterfalls, overflowing settler lips, turbulent foam, fake flames or smokestacks.

The simplified arrow model is based on a standard countercurrent solvent-extraction circuit, not an assertion of exact piping arrangement in a named plant. Compare [University of Michigan extractor description](https://encyclopedia.che.engin.umich.edu/extractors/), [Minerals 2023, Figure 4](https://www.mdpi.com/2075-163x/13/6/714) and [US Patent US10407752B2, extraction–scrub–strip circuit](https://patents.google.com/patent/US10407752B2/en).

## 4. Top, side and projection blockout

### Top view (conceptual, not an equipment wiring diagram)

\`\`\`text
                         X increases →
                S1     S2     S3     S4     S5     S6
 REE aqueous → [M S]--[M S]--[M S]--[M S]--[M S]--[M S] → raffinate
               | |    | |    | |    | |    | |    | |
 loaded organic ←=======================================← lean organic
                countercurrent organic return manifold
 M = mixer / agitator; S = longer gravity settler
\`\`\`

The compact top view is for **layout only**; do not treat the single horizontal stroke as actual connection plumbing. In the 3D scene each stage has its own phase outlets and branch lines.

### Side elevation

\`\`\`text
    small drive    small drive           (six repetitions)
       [o]            [o]
        |              |
      [mix] ________ [mix] ________       z ≈ 1.4  motors
      |___|| settler||___|| settler|      z ≈ 0.8  vessels
     _|_|_|________|_|_|_|________|_     z ≈ 0.2  support beams
     -------------------------------      z = 0    floor reference
\`\`\`

### Three-quarter engraved projection

- Camera orthographic or long-focal, azimuth **30–38° relative to the X row** and elevation **19–24°**; tune to show both the repeated plan and short end sections without hiding the first three mixers.
- Target 960 × 660 coordinate viewBox as starting aspect, **not fixed raster resolution**.
- Put the closest 2–3 stages in the bottom-left/center, far stages tapering toward upper-right; **do not use theatrical vanishing point**.
- Roughly **20–30% of the frame should remain unoccupied** (layout target, not physical data).
- Crop nothing essential; at least five of six agitating drives must remain distinguishable.
- A plain neutral ground contact can anchor the scene; omit roof, factory skyline, people, vehicles and stock decorative machinery.

## 5. The minimal complete scene graph

\`\`\`text
RARE_EARTH_CASCADE_SCENE
├── FLOOR_REFERENCE (non-rendered or very quiet)
├── STAGE_GROUP × 6
│   ├── MIXER_BODY
│   ├── AGITATOR_SHAFT
│   ├── AGITATOR_MOTOR
│   ├── MIX_TO_SETTLE
│   ├── SETTLER_BODY
│   ├── INTERFACE_PLANES
│   ├── ORGANIC_OUTLET / AQUEOUS_OUTLET
│   └── FEET_FRAME
├── AQUEOUS_INTERSTAGE_MANIFOLD
├── ORGANIC_INTERSTAGE_MANIFOLD
├── INLET_AND_OUTLET_TERMINATIONS (four distinct ends)
└── OPTIONAL_SINGLE_SERVICE_WALKWAY
\`\`\`

**Not in the first blockout:** architectural building, overhead gantries, chemical reactor towers, industrial workers, process labeling, complete CESS circuit, valves on every bend, feed/product tank farms, speculative control apparatus. Add a walkway only if it helps scale; otherwise omit it.

## 6. Engraving profile and tone hierarchy

Keep the **same renderer logic** used for the existing reviewed tanker: frozen geometry, reproducible fixed camera/light, procedural physical shading, and *true vector* hatch strokes. No raster texture, embedded image, CSS filter pretending to be etching, or generated illustration.

- Light: single directional **upper-left/front** key; light direction stored as scene parameters.
- **Highest density:** beneath supports, below mixer-to-settler transitions, inside narrow back-facing pipe bends.
- **Medium density:** long undersides of settlers, sidewalls, structural frames.
- **Low density:** top rims and broad outward-facing planes.
- **Preserved paper:** most of the visible upper settler surfaces and background; visual cadence comes from stage repetition and negative space.
- Avoid representing the same-level liquid surface as boiling/violent circulation: the *mixer* is active; the *settler* is comparatively quiescent.
- Minimum plate must remain legible in black and white without color-coded phases. Counterflow direction belongs in its companion analytical diagram.

**Draft rendering parameters** (not claimed as upstream API names): initial hatch line spacing 6–9 normalized SVG screen units in lit regions, 2.5–4 in deep regions; keep maximum density below merge-to-black where thin manifolds become illegible. Map these *aesthetic goals* to the actual installed Draw Beautiful engine's profile controls after checking its code. Do not invent or hardcode nonexistent engine options.

## 7. Execution order and stop conditions

1. **Reference lock:** compare three independent sources (technical chapter, circuit schematic, experimental stage setup), save stable citations and explicit simplifications.
2. **Stage-only blockout:** build one mixer and one settler, confirm shapes, agitator, upper/lower outlet structure; no six-stage copying until this reads correctly.
3. **Countercurrent proof:** replicate to six stages *without hatching*, wire two separate phase networks, and make an external top-view labelled topology screenshot/diagram for QA. Reject if interstage connections visually imply a single flow or stage output going straight to pure product.
4. **Composition:** freeze stage count, X pitch, camera, floor and light; render flat silhouette/normal and shaded previews. Reject if half of the stages disappear behind piping or scale becomes unreadable.
5. **Intaglio pass:** run the **real** Draw Beautiful renderer, compare at 100%, 200% and mobile. Tune hatch density so mixers, settlers and phase lines stay distinguishable.
6. **True SVG export:** export vector paths from source renderer, not raster-in-SVG. Record engine commit hash, source scene and profile, units, camera and light settings.
7. **Editorial review:** confirm **generic physical processing cascade** scope, bilingual captions and exclusions. Pair with independently referenced processing concentration research; no unsupported location, output, efficiency or market share statements.
8. **Integration:** update \`publisher/physical-engraving.js\` validator to explicitly support \`generic_processing_cascade\` with its own tested contract. Do not mark the entry reviewed or add to publication manifest before visual QA passes. Final safe SVG should be subject to existing strict WSB release/link/browser checks.

### Acceptance criteria

- [ ] Exactly six complete mixer-settler stage forms; six distinct motors, six longer settlers.
- [ ] Each visible stage has **two separate phase withdrawals** and one mixer-to-settler transition.
- [ ] Countercurrent topology independently checked against source-based schematic.
- [ ] No faux water cascade, simultaneous mixing in settler, or false purified-product outlet.
- [ ] Readable at approximately **390 px phone viewport** and desktop without forced panorama that hides the subject.
- [ ] At least 20% deliberate visual breathing space and no purely decorative factory building.
- [ ] Actual \`<path>\` vector hatch exports; no embedded bitmaps or external SVG resources.
- [ ] Engine revision, camera, light, geometry versions and QA recorded.
- [ ] EN/UA explanatory scope; not a real plant or precise industrial design.
- [ ] The final plate links to a genuinely sourced **analytical study**, not an invented publication route.

## 8. Technical sources

1. J. Zhang et al., *Separation Hydrometallurgy of Rare Earth Elements*, chapter 6, Springer (2016), DOI [10.1007/978-3-319-28235-0_6](https://doi.org/10.1007/978-3-319-28235-0_6) — stage geometry and separation principle.
2. *Simulation of Solvent Extraction Circuits for the Separation of Rare Earth Elements*, Minerals **13** (2023) 714, [source](https://www.mdpi.com/2075-163x/13/6/714) — battery topology, extraction/scrub/strip distinctions.
3. University of Michigan, [Visual Encyclopedia of Chemical Engineering Equipment: Extractors](https://encyclopedia.che.engin.umich.edu/extractors/) — stage construction and interstage flow.
4. BCcampus, [Engineering and Operating SX Circuits](https://pressbooks.bccampus.ca/hydrometallurgy/chapter/engineering-and-operating-sx-circuits/) — gravity settling, phase outlets and weirs.
5. B. Dewulf, S. Riaño, K. Binnemans, “Separation of heavy rare-earth elements by non-aqueous solvent extraction,” *Separation and Purification Technology* **290** (2022), 120882, DOI [10.1016/j.seppur.2022.120882](https://doi.org/10.1016/j.seppur.2022.120882) — experimental sixteen-stage system; not a general plant size.
6. US Patent [US10407752B2](https://patents.google.com/patent/US10407752B2/en) — extraction, scrubbing and stripping connectivity, equipment drawings.

**No approved plate is produced by this specification.** The next artifact is the **single-stage geometry blockout** and the source-based routing proof; only then should the six-stage intaglio plate be attempted.
