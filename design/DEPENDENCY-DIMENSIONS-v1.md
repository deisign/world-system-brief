# Dependency dimensions · System Ledger v1

Each recorded directed relation may carry the following **optional, editorially reviewed** fields:

| Field | Interpretation |
|---|---|
| `substitutability` | What can replace the constrained flow or service, under which conditions? |
| `substitution_horizon` | Supported time range to replace it; use qualitative unknown when unverified |
| `leverage_effect` | Which actor's bargaining or operational power changes, in which direction? |
| `rent_distribution` | Which actors plausibly capture or lose economic rents; distinguish inference from measurement |
| `adaptation_route` | Verified or proposed circumvention, diversification, stock release, or rerouting mechanism |

## Editorial rules

- A populated field must be supported by the relation's `source_ids` and `claim_ids`; if evidence is absent, omit the field. The interface displays **Not established / Не встановлено**.
- Never infer substitutability or a quantitative horizon solely from the existence of two connected nodes.
- Distinguish **proposed**, **observed**, and **implemented** adaptation.
- Do not imply that a legal waiver generates more physical capacity until separately verified.
- Changes in flow, dependency, and leverage are distinct observations; do not reuse the same `confirmed_delta` status automatically.
- Use plain-language values intelligible in both languages; future schema revisions should support structured, locale-specific translations and per-field evidence IDs.

This version adds a **view and schema convention**, not speculative backfilled values. Existing source links and dated relation history remain authoritative.
