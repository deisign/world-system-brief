# WSB SYSTEM renderer v0.1

Purpose: render one language-neutral Issue State into localized SYSTEM HTML.

Contract:

```
issues/<issue>/state.json + locale -> SYSTEM HTML
```

The renderer is presentational. It must not:
- research or fetch sources;
- create or upgrade a delta;
- change confidence/status;
- silently add analytical objects.

Locale text is presentation data. Analytical state remains in `state.json`.

v0.1 supports `en` and `ua` and uses WSB Palette v0.2. It is intentionally narrow: first reproduce Issue 0001, then let Issues 0002–0004 force generalization.

Known pressure point discovered immediately: `dominant_mechanism.assessment` and object state labels are still English strings inside the analytical state. They should become language-neutral codes plus localized presentation text before this renderer can claim true bilingual purity. We keep that defect visible rather than duplicating state.
