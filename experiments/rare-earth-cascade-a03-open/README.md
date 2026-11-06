# A03-2 Spatial — open settler (6 November 2026)

**Status: physical geometry experiment, not an approved WSB plate.**

Changed the geometry of the existing A03-2 Spatial without replacing the source renderer or camera. Three originally capped settler prisms were rebuilt as separate floor, four walls and rim strips. A recessed inner surface at z≈0.96 is rendered with actual geometry-dependent hatching. The mixer transfer is revised; the two phase manifolds remain illustrative, not an engineering P&ID.

- **Draw Beautiful original pinned renderer:** `kit/intaglio.mjs` at `86d03dd5d722f6bd9b7dda8f0dcf308545f3fa86`.
- Camera: **azimuth −43°, elevation 29°, pad 72**.
- [Actual engraved SVG](renders/a03-2-spatial-open-settler-intaglio.svg) · [PNG preview](renders/a03-2-spatial-open-settler-intaglio.png)
- [Mass study SVG](renders/a03-2-spatial-open-settler-mass.svg) · [PNG preview](renders/a03-2-spatial-open-settler-mass.png)
- [Build script](build.mjs) · [Tests](scene.test.mjs) · [Machine report](renders/report.json)
- [Original A03-2, for comparison](../rare-earth-cascade-a03/renders/a03-2-spatial-intaglio.png)

**QA:** The initial build revealed that the liquid surface did not produce a visible intaglio layer in stage 1. We corrected its physical height and shading, reran the same original renderer; all three stages now produce real vector paths for liquid surfaces. All 3 unit tests passed, both authentic SVG renders parsed and were rasterized successfully for preview. Physical/visual interpretation: the open inner planes and rim are discernible, and the modules keep their spatial cadence. The appearance is still markedly technical rather than a signed-off editorial plate. Do not claim measured separation rates, specific plant dimensions or certified phase routing.

The A06 and original A03 geometry are unchanged when `openSettler` is omitted. This variation is opt-in and kept in an experimental branch; no WSB published engraving was modified.
