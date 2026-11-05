# WSB publication integrity audit — 2026-11-05

## Scope and method

Audited the **assembled GitHub Pages artifact**, not just source files: canonical WSB build → typography installation → project Pages URL rewrite → static integrity scanner. The scan checks internal `href`, `src`, `action`, `poster`, `srcset` and CSS `url(...)` targets against the actual generated files. It verifies localized EN/UA counterparts and reports missing semantic headings, HTML titles, viewports and charsets. It treats URLs in JavaScript string literals as code rather than real HTML attributes.

**Baseline** (PR #78 first audit run, `42021192191`): 566 HTML pages, 7,498 local references, **212 broken internal links**, **79 warnings**.

**After corrections** (PR #78 green run, `42022203738`): **618 HTML pages**, **9,528 checked local references**, **0 broken local targets**, **0 scanner warnings**, **118/118 tests passed**.

## Confirmed problems and corrections

| Severity | Finding | Root cause | Resolution |
|---|---|---|---|
| P1 | Root route bypassed editorial homepage | Meta redirect went straight to most recent READ page | Redirect now targets `/en/` with an accessible document and fallback link |
| P1 | 212 missing internal entity-page targets | Registry entries were linked by claims/dependency diagram although only dated state subjects received biography pages | Generate real bilingual registry pages for entities lacking a dated biography, with related canonical claims and source links, clearly disclosing no published state history; add those entities to the index |
| P1 | Interactive map dynamically generated project-root links without GitHub Pages prefix | Embedded JavaScript constructed `/en/entity/...` and `/ua/entity/...` in the browser | Dynamic link builder detects Pages base and constructs correct entity URLs |
| P2 | Dated entity biography did not display event-level source citations | Enhancement targeted a non-existent `entity-history` wrapper | Match actual canonical biography region, insert original dated claim/source citations, fail on unrecognized structure |
| P2 | POSTER pages lacked semantic H1 | Print title was authored as a styled div | Convert to `h1` with zero margin, preserving fixed-format composition and print dimensions |
| P2 | Root redirect lacked a meaningful title, viewport and charset | Minimal meta-refresh document | Add full valid document shell and accessible link |
| P1 prevention | Green CI did not detect missing published routes | No final-release link integrity gate | Require `release-audit.js dist --strict` in PR validation and Pages deploy, after font and URL rewriting |

## Integrity invariants

- Never invent state biographies or dated events merely to satisfy a link. Registry-only entity pages explicitly distinguish published claims from confirmed state histories.
- Keep physical POSTER layout independent of semantic HTML improvements.
- Check after project-path rewriting; checks run on actual paths that will be uploaded.
- Static CI checks fail on missing local resources, unprefixed project routes, and unsafe paths; warnings flag localization and document semantics.
- Historical source citations must resolve to source entries on the same biography page.

## Open items / unverified dimensions

1. **Browser visual QA (P2, outstanding):** actual Chrome/Firefox screenshots at ~360, 390, 768 and 1440 CSS pixels; typography wrapping, POSTER print preview, contrast, tap targets and diagrams. GitHub Pages domain was not reachable from the assistant's execution environment, so no live-site visual success is claimed.
2. **External sources (P2, outstanding):** the scan validates that internal links have local targets; it does **not** fetch third-party journalistic source URLs or guarantee that external reports remain accessible.
3. **Dynamic browser behaviors (P2, outstanding):** the checker does not execute arbitrary JS, therefore interactive maps, selection/filtering, and clipboard draft generation still require browser-level functional tests. One confirmed dynamic-map project-path defect was fixed and is protected by the source/test suite.
4. **Source content quality (P2, outstanding):** complete editorial verification of every claim-to-evidence relationship, chronology and translations is not equivalent to structural link validity. Apply sampled human review and dedicated claim-evidence assertions.
5. **Accessibility deep audit (P3, outstanding):** semantic H1 and metadata checks are green; automated WCAG evaluation with a rendering browser, screen-reader flows, keyboard-only testing, and full contrast checks were not performed.

**Decision:** the verified P1 local-navigation defects are resolved in this release. Do not claim full visual or third-party-source validation until those separate checks are executed.
