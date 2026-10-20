# WSB editorial illustration engine — Draw Beautiful evaluation

**Candidate:** [bumicodes/draw-beautiful](https://github.com/bumicodes/draw-beautiful) — MIT, Node built-ins, procedural SVG/standalone HTML. **Decision:** staged prototype, not production adoption yet.

## Division of responsibility

- **RHP**: measurements, ratios, series, comparisons; use canonical `evidence.json` and chart specifications.
- **Draw Beautiful**: geometrically modelled physical mechanisms and objects, then engraved using real lighting and occlusion.
- **Dependency map**: directed network of recorded relations, evidence IDs, uncertainty and evolving system leverage. Never substitute decorative illustration for this graph.

## Required editorial contract

1. **MODEL_THEN_RENDER** — define object, topology, units, camera, parts and causal/mechanical behaviour as data or pure functions before styling.
2. **TRUTH_DRIVES_THE_DRAWING** — cite which source grounds each factual dimension; mark stylized, unknown or schematic geometry explicitly. No invented equipment routes masquerading as documented reality.
3. **STYLE_AS_RENDERER_NOT_PROMPT** — fix WSB engraving rules: warm paper (#F3EBDD), graphite (#232523), deep red (#A2362A), optional blue (#46697A), controlled contour/cross-hatching and legible plate labels.
4. **REFERENCE_TO_GEOMETRY_RECONSTRUCTION** — if a photograph informs the figure, preserve its source, camera-fit method, measurements and provenance; never treat the source photo as a hidden texture.
5. **VERIFY_RENDERED_OUTPUT** — check actual desktop, mobile, reduced-motion still and detailed silhouette/shadow close-ups. Build success alone is insufficient. Preserve a still PNG, standalone HTML/SVG and QA notes.

## First prototype recommendation

**WSB-0011 / Strait of Hormuz oil-route bottleneck**. A simplified physical model of a chokepoint, tanker, and alternative pipeline routes, separating documented geography from schematic overlays. Start with one isolated vessel, not an elaborate unverified port scene. Compare visual explanatory power against the existing dependency map and RHP evidence chart; each must communicate a distinct claim.

## Integration guardrails

- Keep source in separate `visualizations/engravings/` or future `illustration/` directories. Do not embed automatically into all issues.
- Bundle a fixed reviewed rendering locally; no live execution of a generative model or external API in publication builds.
- Preserve MIT copyright notice when reusing kit code. Pin upstream revision and inspect dependencies.
- Treat processing time, SVG complexity and accessibility as adoption gates; include a text explanation and a nonanimated fallback.
- Explicitly label idealized/schematic geometry. Avoid geographic or logistical accuracy claims from composition alone.

**Next gate:** construct and visually verify one genuine Draw Beautiful-generated plate before production installation.
