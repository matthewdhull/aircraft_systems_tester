# Phase 7 Summary

## Result

Phase 7 adds attributable versioned test templates, deterministic exact selection, atomic generated-exam publication, immutable canonical snapshots, secure replay metadata, one-time access codes, and authorized staff detail/preview/print experiences. Phase 8 delivery and grading remain out of scope.

## Tranches

- 7A: template draft/review/publish/retire lifecycle, distinct reviewer for non-administrators with attributable administrator override, exact rule and mandatory validation, advisory capacity, dependency handling, explicit legacy adoption, and accessible list/editor UI.
- 7B: `ast-selection-v1`, a SHA-256 counter random source with rejection-sampled bounded integers and complete mandatory-first constraint solving across overlapping inventory.
- 7C: migrations `0011_phase7_test_modeling` through `0013_administrator_review_override`, AES-256-GCM seed envelopes, keyed HMAC code protection, transactional inventory revalidation/snapshot persistence, safe rollback, direct UUID association, and immutability triggers.
- 7D: shared configuration/authorization/audit composition; generated-test list/generation/detail/preview/print UI; bounded SQLite busy retries at 50/150/450 ms; golden, rollback, concurrency, authorization, leakage, accessibility, and Chrome/axe verification.

## Security and immutability

Production requires explicit generation key configuration and fails closed when it is absent or invalid. The encrypted seed envelope binds exam, template version, and algorithm version as authenticated context. Only an explicitly authorized replay boundary decrypts it. Access codes use unbiased cryptographic generation and a keyed HMAC representation; the raw code is returned in the committed generation response only.

Snapshot prompt, type, position, displayed option text, and response-key fields are protected from update/delete. Source changes cannot rewrite an exam. The future invalidation field and permitted exam status lifecycle remain available for Phase 8.

## Data and routes

Migration count is 14 (`0000`–`0013`) and the application table count remains 65. Migrations 0012–0013 permit attributable administrator publication/review while services retain distinct-reviewer enforcement for every non-administrator. A true administrator may publish a valid draft directly; audits record `administrator_direct_publish`. The authorization inventory contains 19 route patterns and 53 mutations. Template management requires `templates.manage`; generation requires `exams.publish`; detail/preview/ordinary print require `exams.preview`; answer-key print additionally requires `answer_keys.view`. Assigned-roster scope is checked in the transaction, with only explicit organization-wide administrative policy bypass.

## Phase 8 boundary

No student access, attempts, attempt ordering, answers, autosave, recovery, submission, grading, remediation, retakes, or roster CRUD were added. Preview reads the immutable snapshot and creates none of those records.
