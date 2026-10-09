# World System Brief — editorial and publishing brain

## Lessons from WSB-0011 (2026-10-08), recorded 2026-10-09

### 1. Atomic issue publication
- Never push an incomplete issue directory. Required files: `state.json`, `evidence.json`, `claims.json`, `relations.json`, `locale/en.json`, `locale/ua.json`, `read/en.md`, `read/ua.md`.
- Stage all issue files and required registry changes together; run `npm run build` before committing.
- A partial GitHub write caused Cloudflare Pages to fail with `missing state.json`. Verify actual repository state after any failed or blocked API operation; some writes may have succeeded.
- Do not infer that a successful GitHub push means Cloudflare deployment succeeded. Confirm the public site shows the new issue.

### 2. Entity identity and graph integrity
- Never reuse an existing entity ID or slug for a different physical object. WSB-0010 mistakenly linked US Gulf of Mexico hurricane risk to ENT-000042 (Forties pipeline in Scotland). Correct entity: ENT-000048, `us-gulf-offshore-output`.
- Before assigning ENT IDs, inspect `knowledge/entities.json` and prior issues. New entities must have unique ID, slug, type, EN and UA labels.
- Semantic review is mandatory even when JSON validation and unit tests pass. Validators did not catch the Forties/Gulf conflation.
- When correcting an entity, inspect `state`, `claims`, `evidence`, `relations`, and both locales; don't blindly replace genuine references in other issues.

### 3. Evidence and temporal discipline
- Distinguish **event/observation date**, **source publication date**, and **issue date**.
- An observation reported later can confirm yesterday's developing risk. Mark it explicitly as late-evidence Δ; never invent a new onset date.
- Confirmed Δ means an evidenced physical, institutional, or structural state transition; not just a new headline, price reaction, forecast, talks, or implementation of an already-recorded decision.
- Keep developing, persistent, evidence update, and reversal distinct. Use `NO SYSTEM CHANGE DETECTED` when warranted.
- Verify source URLs, quotations, measurements, denominators and dates before publication. A percentage of US Gulf offshore production is not a percentage of all US production.

### 4. Release checklist
1. Review candidate events and prior ledger state; identify potential Δ and evidence gaps.
2. Validate independent sources and dates; determine day type and dominant mechanism.
3. Check canonical entities, claims, sources, relations and graph semantics.
4. Complete all eight issue files and both languages; check prose and translations.
5. Run `npm run build` (validation, tests, publication generation).
6. Inspect `git diff` and `git status`; exclude generated `dist/`.
7. Commit and push a coherent issue.
8. Confirm Cloudflare Pages deployment and actual public visibility.

### 5. Terminal collaboration
- Work on Circus in small, verifiable steps: exactly **one terminal command block per turn**, then inspect output.
- Never assume a local checkout exists. Discover the path before `cd` or clone into an explicitly chosen path.
- Never issue commands that close Tilix/the user's shell. Avoid `exit`, `exec` shell replacement, or terminal-closing behavior.
- A failed or garbled pasted heredoc requires checking resulting files and command output rather than assuming success.

## Lessons from WSB-0012 (2026-10-09), recorded 2026-10-09

### 6. GitHub API writes are not atomic
- GitHub Contents API `create_file` / `update_file` creates **one commit per file**. Even on an editorial branch, Cloudflare Pages may build an intermediate commit; WSB-0012 preview build at `09883f4` failed because `issues/0012/locale/en.json` had not yet been written. The later completed branch and main are distinct states.
- For a complete issue, use **one Git tree + one commit + one ref update** (Git Data API), or create the issue in a disposable staging branch and squash into a single commit on the deploy-triggering branch. Do not mistake multiple sequential Contents API writes for atomic publication.
- Cloudflare preview branch builds may fail while the staging branch is incomplete. Avoid triggering preview builds from intermediate commits where possible; use one-commit staging and CI gates.
- Never merge a PR until a build has passed against the **exact head SHA** to be merged. A successful validator alone is insufficient; run the full `npm run build` including 20 tests and all generators.
- GitHub `mergeable: true` indicates a conflict-free merge, **not** successful build or editorial verification. Do not use it as a quality gate.
- For main, confirm the production deployment refers to the merged commit and that the new issue is publicly visible. A failing preview log for an earlier SHA does not prove the final production deploy failed.

### 7. Release protection to implement
- Add GitHub Actions workflow to run `npm ci` (if lockfile exists, otherwise `npm install`) and `npm run build` on pull requests and pushes to main.
- Enable repository ruleset / branch protection requiring the build check before merging to main. This **requires repository administration permissions** and cannot be assumed configured merely because a workflow file exists.
- Require a single coherent commit for the issue on any branch configured for Cloudflare preview builds, or configure Cloudflare previews to avoid incomplete staging branches.
- Do not merge or publish when build status is unknown or failing. If verification cannot be run, report the block explicitly rather than overriding it.
