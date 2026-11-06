# A03 three-camera Draw Beautiful study — 2026-11-06

**Status:** experimental; not approved for publication. No ImageGen assets or raster-in-SVG.

## Reproducible input

Reuses the physical geometry in `../rare-earth-cascade-a06/scene.mjs`, vendored original MIT `../rare-earth-cascade-a06/vendor/intaglio.mjs`, pinned to Draw Beautiful commit `86d03dd5d722f6bd9b7dda8f0dcf308545f3fa86`. The variant runner is [build.mjs](build.mjs), validation in [scene.test.mjs](scene.test.mjs), and the GitHub Actions workflow is `.github/workflows/draw-beautiful-a03.yml`.

Three stages, two independent placeholder phase manifolds, same geometry/light/materials/renderer, each camera renders to both mass study and intaglio SVG; PNG/JPEG reviews were rasterized from the actual SVG only.

| Variant | Azimuth | Elevation | Frame padding | Observation |
|---|---:|---:|---:|---|
| A03-1 Linear | −63° | 25° | 72 | Readable individual mixers, but resembles serial industrial boxes |
| A03-2 Spatial | −43° | 29° | 72 | Stronger depth, but mixing drums visually compete with or are partially occluded by adjacent settlers |
| A03-3 Close | −55° | 20° | 35 | Best legibility among the three, particularly motor/mixer/settler separation, still lacks expressive spatial hierarchy |

## Authentic outputs

- [A03-1 intaglio SVG](renders/a03-1-linear-intaglio.svg) · [PNG](renders/a03-1-linear-intaglio.png) · [mass SVG](renders/a03-1-linear-mass.svg)
- [A03-2 intaglio SVG](renders/a03-2-spatial-intaglio.svg) · [PNG](renders/a03-2-spatial-intaglio.png) · [mass SVG](renders/a03-2-spatial-mass.svg)
- [A03-3 intaglio SVG](renders/a03-3-close-intaglio.svg) · [PNG](renders/a03-3-close-intaglio.png) · [mass SVG](renders/a03-3-close-mass.svg)
- [Actual execution report](renders/report.json)

## QA decision

All six true Draw Beautiful SVG exports completed and passed workflow path/format checks and the two geometry test suites. Individual mixer, motor and settler surfaces exist for each physical stage in each output. This proves SVG path generation, **not** technical authenticity or artistic quality.

**Provisional choice A03-3.** Do not add to WSB's approved illustration manifest yet. The settling chambers remain too boxlike and the overall motif is still more industrial demonstration than a definitive illustrated system mechanism. Refine structural differentiation and camera composition, not artificial old-etching texture.

Further engineering caution: the current interstage manifold bars are illustrative and are **not** validated against an industrial P&ID. They should be checked/corrected before any public claim that the rendering depicts technically plausible operating piping. A publication caption must not imply real-world throughput, plant location, reagent identity, or actual operating conditions.

### Follow-on physical geometry test

Replace a fully capped settler with a partially visible settling chamber/rim/open service access while retaining genuine rectangular gravity-settler structure, check two separate phase outlets, model clear mixer-to-settler transfer, and preserve the original process boundaries. Before adjusting line density, compare one-stage views for visual meaning, then rerun A03-3.
