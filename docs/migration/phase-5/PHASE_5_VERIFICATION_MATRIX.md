# Phase 5 Verification Matrix

Verification date: 2026-07-13

## Acceptance coverage

| Area                                    | Result  | Evidence                                                                                                                                          |
| --------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Four-level hierarchy read/create/edit   | PASS    | Domain creation tests and protected route-action CRUD integration                                                                                 |
| UUID identity and version history       | PASS    | Injected UUID/version tests; published source rows remain unchanged                                                                               |
| Review, publish, effective parent chain | PASS    | Lifecycle, distinct-reviewer, distinct-publisher, range, and parent-chain tests                                                                   |
| Retirement versus safe deletion         | PASS    | Dependency previews, published retirement, draft delete, and delete-restriction tests                                                             |
| Transactional contiguous ordering       | PASS    | First/middle/last reorder, stale conflict, mixed-lifecycle rejection, parent move, collision constraint, and rollback tests                       |
| Bloom vocabulary                        | PASS    | Empty start; level/verb draft, publish, retire, dependency, and selection tests                                                                   |
| Explicit legacy mapping decisions       | PASS    | Proposal, approve, reject, retire, attribution, rationale, invalid target, broken-chain, and conflict tests                                       |
| No inference or question eligibility    | PASS    | Mapping and importer regression tests plus reconciliation checks                                                                                  |
| Authorization                           | PASS    | 3 Phase 5 routes and 23 mutations; real cookie/session/hook and direct-action matrices                                                            |
| Legacy characterization                 | PASS    | Approved behavior and rejected-defect catalog tests                                                                                               |
| UI and accessibility                    | PASS    | Native disclosure, named reorder buttons, focus restoration, error association/summary, live warning/status, empty state, and narrow-layout tests |
| Browser automation                      | NOT RUN | Browser runtime was present but reported zero available browser backends                                                                          |
| Phase 3 and Phase 4 regression          | PASS    | Focused prior-phase suites and full suite                                                                                                         |

## Final command results

| Command or check                                         | Result                                                             |
| -------------------------------------------------------- | ------------------------------------------------------------------ |
| `npm ci`                                                 | PASS                                                               |
| `npm run format:check`                                   | PASS                                                               |
| `npm run lint`                                           | PASS                                                               |
| `npm run check`                                          | PASS — 0 errors, 0 warnings                                        |
| `npm test`                                               | PASS — 45 files, 236 tests                                         |
| `npx --no-install drizzle-kit check`                     | PASS                                                               |
| `npm run build`                                          | PASS                                                               |
| Live preview-origin smoke                                | PASS — captured local origins allowed; unrelated origin rejected   |
| `npm run curriculum:test`                                | PASS — 11 files, 74 tests                                          |
| Curriculum domain/database                               | PASS — 2 files, 21 tests                                           |
| Curriculum UI/component                                  | PASS — 1 file, 6 tests                                             |
| Curriculum accessibility                                 | PASS — 1 file, 6 tests                                             |
| Curriculum mapping                                       | PASS — 1 file, 15 tests                                            |
| Protected authorization/CRUD integration                 | PASS                                                               |
| Task-modeling characterization                           | PASS                                                               |
| Clean initialization through `0009`                      | PASS — 10 migration records, 65 application tables                 |
| `PRAGMA foreign_key_check`                               | PASS — empty result                                                |
| `PRAGMA integrity_check`                                 | PASS — `ok`                                                        |
| Failed-migration rollback                                | PASS — prior DDL and migration record absent                       |
| Mapping reconciliation CLI                               | PASS — deterministic report, zero violations on empty future state |
| Phase 3 fixture importer/reconciliation regression       | PASS                                                               |
| Phase 3 focused migration regression                     | PASS — 5 files, 28 tests                                           |
| Phase 4 authentication/authorization/security regression | PASS — 23 files, 111 tests                                         |
| Markdown relative-link validation                        | PASS                                                               |
| Trailing-whitespace check                                | PASS                                                               |
| Sensitive-value scan                                     | PASS                                                               |
| `git diff --check`                                       | PASS                                                               |
| Allowed-path and ownership review                        | PASS                                                               |

## Database invariants

- Foreign keys cover identity/version parents, authors, reviewers, Bloom
  selections, legacy parents, and source import runs.
- Check constraints reject invalid lifecycle values, invalid date ranges,
  incomplete publication fields, self-review, and inconsistent mapping decisions.
- Unique indexes enforce identity-local version numbers and final editable
  sibling positions.
- Published and referenced version deletion is restricted; the service permits
  hard deletion only after a fresh dependency revision identifies a safe draft.
- Service reorder and parent-move operations use one immediate transaction and
  roll back on persistence or audit failure.

## Authorization inventory

| Inventory                       | Route patterns | Named mutations | Required permission        |
| ------------------------------- | -------------: | --------------: | -------------------------- |
| Phase 5                         |              3 |              23 | `curriculum.manage`        |
| Application total after Phase 5 |             11 |              32 | Per-route Phase 4/5 policy |

Covered principal states are anonymous, authenticated without permission,
Curriculum Manager, Administrator, Instructor without curriculum permission,
revoked role, and suspended user. Coverage includes browser loads and direct
POST/action attempts.

## Security and privacy

- Every curriculum mutation performs server authorization, validation,
  transaction ownership, and audit persistence.
- Existing hook-level origin/CSRF, session, secure-cookie, and route behavior is
  unchanged.
- Curriculum audit metadata is restricted to allow-listed type, lifecycle,
  version, ordering, count, decision, and changed-field information. Curriculum
  names, descriptions, mapping rationales, source IDs, quarantine payloads, and
  restricted import details are not recorded.
- Scans found no tracked runtime database, authoritative import output, private
  key, credential, token, password, or quarantine payload in the Phase 5 diff.

## Browser and accessibility disclosure

No browser backend was available, so this phase does not claim browser or manual
verification. The following did run: production build; jsdom component tests;
keyboard-focusability and named reorder control checks; focus restoration after
successful form actions; focused error summaries and field associations;
dependency live-region announcements; lifecycle text; empty state; and
narrow-screen CSS contract assertions. A live HTTP preview smoke also proved
that login POSTs from `127.0.0.1:5173`, `localhost:5173`, and the captured opaque
local preview transport reach the application while an unrelated origin remains
blocked by SvelteKit CSRF checks. Production and test builds trust none of these
exceptions.
