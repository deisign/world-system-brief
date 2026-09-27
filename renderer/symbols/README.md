# WSB SVG primitives v0.1

Canonical graphical layer for the WSB Symbol Standard.

- Semantic meaning lives in issue/Ledger state.
- SVG renders that meaning; it does not invent it.
- Unicode remains the text fallback.
- Flow geometry is generated, not stored as story-specific images.
- Domain and atomic pictograms are a small reusable monochrome family.
- PNG/PDF are exports, never canonical source assets.

Files:
- `../../design/symbols/primitives.svg` — reusable SVG symbols.
- `symbols.css` — shared visual grammar.
- `symbol-renderer.js` — geometry renderer for nodes, flows, constraints, bypasses and rent markers.

Do not add story-specific assets such as `hormuz.svg`. Hormuz is data, not an asset.
