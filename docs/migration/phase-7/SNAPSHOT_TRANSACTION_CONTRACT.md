# Phase 7 Snapshot Transaction Contract

## Composition seam

`SnapshotGenerationService` owns one synchronous immediate SQLite transaction. Its dependencies inject the pure versioned selector, secure entropy, clock, UUID creation, seed and code protectors, permission and roster-scope checks, and the safe audit writer. Input identifies the actor, exact template version, existing class roster, and algorithm version. Success returns only `{ examId, rawAccessCode }` after commit.

## Transaction order

The service authorizes `exams.publish` and assigned-roster scope, then loads the exact published/effective template. It verifies aircraft and optional course-type applicability, exact rule totals, mandatory-element quota fit, and current roster state. Candidate loading revalidates published/effective question versions, server-derived `eligible` status, aircraft applicability, approved future links, and published/effective Element, Subtask, Task, and Phase ancestry.

After generating a fresh seed, the selector must produce the configured count exactly or a fixed safe shortage. Unsupported algorithms and invalid inputs fail closed. UUIDs are allocated before inserts. The header records the exact template version, algorithm version, authenticated seed envelope metadata, publication instant, and a half-open start window closing exactly one hour later.

Each selected question records its source version, assigned template rule, optional satisfied mandatory Element, and final position. Alternate prompt selection and answer layout are deterministic from the seed. True/false uses canonical A=True and B=False. Single-choice stores all four final displayed choices. Compound/all/none questions store A–C and derived D; D is the response key and may have no source-option UUID. Stored correctness is the actual response key.

Snapshot prompt, type, position, source association, option text, option position, and response-key fields are protected by database triggers from update or deletion. The separately controlled question invalidation flag and allowed exam status transitions remain mutable for Phase 8. Template content, rules, and mandatory requirements become immutable on publication; referenced identities use restrictive foreign keys.

## Atomic failures and concurrency

Shortage, source revalidation failure, protector failure, write failure, audit failure, SQLite busy, or transaction failure produces no exam or snapshot and no success audit. The service never shortens an exam, substitutes a quota, or returns a partial success. Immediate transactions and direct caller-created UUID association avoid last-row and newest-timestamp races.

Phase 7 creates no attempts, attempt order, answers, grades, recovery grants, roster records, or student-access state. Staff preview reads the immutable snapshot through coordinator-owned authorization and has no transactional attempt side effects.
