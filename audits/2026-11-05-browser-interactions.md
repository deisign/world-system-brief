# WSB browser interaction QA — 2026-11-05

## Artifact and verification boundary

- Source: exact GitHub Pages publication artifact from [deployment run #42025114291](https://github.com/deisign/world-system-brief/actions/runs/42025114291), commit `8b96495175ddc2608cad2d00219bcf1cc7bab57e` (PR #79).
- Engine: Chromium in headless mode, 390 × 844, 768 × 844, and 1440 × 844 CSS-pixel viewports. Interactive tests ran on the **unaltered published HTML** with its inline CSS and scripts, loaded using `page.set_content`. Only the blocked external stylesheet reference was replaced by an empty CSS data URL to avoid navigation restrictions.
- Navigation to `http://127.0.0.1` is blocked by this environment (`ERR_BLOCKED_BY_ADMINISTRATOR`). Neither a real HTTP site load nor arbitrary external-source navigation has been claimed. External webfont fidelity must be assessed separately.
- No runtime JavaScript exceptions were observed in the exercised scenarios. **This is an observed browser smoke test, not a full WCAG audit or an automated production smoke test.**

## Observed results

| Area | Scenario | Observed behavior | Outcome |
|---|---|---|---|
| Review Desk, UA, 390/768/1440 | Search for a nonexistent claim ID | 71 original cards; zero visible cards after filter, restored by clearing search | PASS |
| Review Desk, UA, 390/768/1440 | Filter claims with later sources | 29 candidates from 71 claims | PASS |
| Review Desk, UA/EN, 390 | Generate a draft without choosing evidence or filling both rationales | Localized validation message; no JSON generated | PASS |
| Review Desk, UA/EN, 390 | Open source selector, choose candidate source, choose decision, enter both rationales | JSON draft includes original claim ID, later canonical issue ID/date, decision, bilingual reasons, source IDs | PASS |
| System Map, UA, 390/768/1440 | Select a graph node, then reset | Initially 43 nodes and 28 relations; selected node restricted display to a one-hop relation; reset restored 28 relations | PASS |
| System Map, UA/EN, 390 | Focus map node and activate with Enter; reset with Enter | Localized focus label changes, reset restores “all” / “усі” | PASS |
| Oil Network, UA, 390 | Scroll to the right using browser scroll offset | Diagram area 362 px wide, content 650 px; max scrollLeft 288 px | PASS |
| Oil Network, UA, 390 | Focus scroll region and use End | Keyboard reaches scrollLeft 288 px, scroll region has tabindex=0 | PASS |
| Oil Network, UA, 390 | Dispatch real touchStart/touchMove/touchEnd events (Chromium CDP) | Horizontal scrollLeft ~185 px following a leftward drag | PASS |
| Oil Network, UA, 768/1440 | Layout inspection | No local overflow at these widths; diagram fits (additional visual label readability review outstanding) | PASS (layout) |
| POSTER, UA, 390 | Horizontal diagram scrolling | Region 354 px, content 1,000 px, max horizontal scrollLeft 646 px | PASS |
| POSTER, UA, 390 | Focus diagram, press ArrowRight | ~40 px positive horizontal scroll per initial ArrowRight action | PASS |
| POSTER, UA, 390 | Real touchStart/touchMove/touchEnd events (Chromium CDP) | Horizontal scrollLeft ~194 px following leftward drag | PASS |
| POSTER, UA, 768/1440 | Layout inspection | Diagram width matches available region (no forced horizontal scroll); print-specific CSS remains in stylesheet | PASS (layout) |
| Across 4 interactive pages, 3 widths | Browser runtime | No observed uncaught JavaScript exceptions or document-wide horizontal overflow | PASS |

## Important details

1. The first automated review-draft test could not select a radio button because the **later-evidence `<details>` section was closed**. This was a test-sequence error, **not** an app defect. After opening the evidence section, selection and JSON generation passed for both languages. Do not report this as broken user-facing functionality.
2. First attempts to simulate touch with `Input.synthesizeScrollGesture` yielded zero horizontal movement, while direct `Input.dispatchTouchEvent` event sequences did scroll both diagrams. Record only the successful direct touch-event sequence as observed behavior; device-specific real-world gesture feel is unverified.
3. CSS font assets in this browser exercise were not fetched. Do not use these functional results to claim visual proof of accurate webfont metrics or typographic wrapping.
4. Clipboard permission/persistence behavior was not verified across browsers. JSON was reliably populated in the visible read-only output; automatic clipboard write is a best-effort convenience and should not be conflated with approval or publication.
5. Tablet-sized labels, screen reader navigation, full keyboard tab order, real server project-prefix routing, browser print-preview geometry, and third-party source availability remain independent audit gates.
6. No reproducible P1 interaction failure was found in these scenarios. **No arbitrary code change was made solely to produce a commit.**

## Editorial decision

**Accept this functional smoke-test milestone; keep the remaining browser/network, accessibility and external-source checks open.** The published code was not changed by the interaction audit. The next valuable gate is automated browser smoke testing on a CI artifact hosted in a controlled test server, plus targeted real-device verification of horizontal gestures and tablet labels.
