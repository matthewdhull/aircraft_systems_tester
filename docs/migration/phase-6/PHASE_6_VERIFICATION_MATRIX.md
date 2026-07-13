# Phase 6 Verification Matrix

## Acceptance coverage

| Area                            | Evidence                                                      | Result |
| ------------------------------- | ------------------------------------------------------------- | ------ |
| Five shapes and aliases         | domain validation plus all 17 golden cases                    | Pass   |
| Identity/version/lifecycle      | domain and route E2E suites                                   | Pass   |
| Distinct review/publication     | domain, route, and authorization suites                       | Pass   |
| Imported adoption               | domain and UI workflow coverage                               | Pass   |
| Aircraft/future applicability   | domain, UI, and route E2E suites                              | Pass   |
| Explicit future-link review     | proposal/approval/retirement and self-review denials          | Pass   |
| Transactional eligibility       | rollback, publication, link retirement, question retirement   | Pass   |
| Curriculum retirement interlock | active descendant link blocks; explicit retirement unblocks   | Pass   |
| Safe list/detail boundary       | safe DTO, route context, and leakage suites                   | Pass   |
| Authorization inventory         | 2 routes / 11 named mutations                                 | Pass   |
| Accessibility/progressive forms | semantic forms, errors/focus, keyboard/no-drag, narrow layout | Pass   |
| Fixture reconciliation          | 5 accepted + 3 quarantined = 8                                | Pass   |
| Authoritative reconciliation    | 612 accepted + 45 quarantined = 657                           | Pass   |
| Import idempotence/equivalence  | repeat no-op and independent import                           | Pass   |
| Phase 3–5 invariants            | focused prior-phase suites and full suite                     | Pass   |

## Committed-tree command matrix

These are the required results for the clean committed tree. The coordinator
reruns them after the final commit; a mismatch blocks completion.

| Command/check                        | Required recorded result                        |
| ------------------------------------ | ----------------------------------------------- |
| `npm ci`                             | 310 packages installed; prepare succeeds        |
| `npm run format:check`               | all matched files formatted                     |
| `npm run lint`                       | exit 0                                          |
| `npm run check`                      | 0 errors, 0 warnings                            |
| `npm test`                           | 57 files, 364 tests passed                      |
| `npx --no-install drizzle-kit check` | schema valid                                    |
| `npm run build`                      | client and server production build pass         |
| clean migration                      | 65 application tables, 11 migrations            |
| SQLite verification                  | 0 FK violations; integrity `ok`                 |
| `npm run questions:test`             | 12 files, 128 tests passed                      |
| Phase 3 focused regressions          | 5 files, 28 tests passed                        |
| Phase 4 focused regressions          | 21 files, 102 tests passed                      |
| Phase 5 focused regressions          | 11 files, 74 tests passed                       |
| golden suite                         | 17/17 cases executed; manifest references exact |
| question route inventory             | 2 routes, 11 mutations                          |
| fixture reconciliation               | 8 = 5 accepted + 3 quarantined; pass            |
| authoritative reconciliation         | 657 = 612 accepted + 45 quarantined; pass       |
| imported future links / eligible     | 0 / 0                                           |
| Markdown relative links              | 82 files, 0 broken links                        |
| changed-file trailing whitespace     | 0 findings                                      |
| answer/restricted-material tests     | pass; safe reports remain count-only            |
| `git diff --check`                   | exit 0                                          |
| `git status --short`                 | empty after commits                             |

## Reconciliation detail

| Dimension            | Fixture | Authoritative |
| -------------------- | ------: | ------------: |
| True/false           |       1 |            72 |
| Single choice        |       1 |           474 |
| Two-correct compound |       1 |            32 |
| All correct          |       1 |            29 |
| None correct         |       1 |             5 |
| Aircraft A / CRJ     |       3 |           372 |
| Aircraft B / ERJ     |       2 |           240 |
| Legacy links         |       5 |           612 |
| Parent violations    |       0 |             0 |
| Review lifecycle     |       5 |           612 |
| Blocked generation   |       5 |           612 |
| Future links         |       0 |             0 |
| Eligible versions    |       0 |             0 |

## Security matrix

The route/action integration covers anonymous, authenticated without permission,
Instructor, Curriculum Manager, Question Author, Administrator, revoked role,
and suspended user states. It separately exercises safe read, create, review,
publish, records-retire, and answer-key contexts. Direct actions cannot rely on
client visibility. Existing Phase 4 session, revoked-role, suspended-user,
origin/CSRF, cookie, redaction, and audit tests remain in the full suite.

Safe reconciliation rendering has no fields for prompt text, option text,
correctness, semantic answers, derived keys, source identifiers, internal UUID
lists, database paths, SQL, or restricted payloads. The answer-key leakage suite
also rejects those categories from general audit metadata and safe list/search
serialization.

## Preview and browser gate

After the clean committed-tree matrix passes, the coordinator must build with
`APP_ENV=development`, start the preview at `http://127.0.0.1:5173` against the
unchanged `.runtime/phase4-preview.sqlite`, run `npm run preview:smoke -- --url
http://127.0.0.1:5173`, verify migration/user/session preservation, and leave the
process running. Browser coverage is recorded only if an available backend was
actually used; lack of a backend is reported as a limitation rather than a pass.
