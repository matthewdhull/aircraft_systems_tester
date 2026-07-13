# Phase 3A — Canonical Schema

## Result

The canonical target schema is implemented as 64 application/infrastructure
tables with ordered Drizzle migrations. It covers future identity and roles,
effective vocabularies, an empty versioned task hierarchy, faithful legacy
curriculum, versioned questions/templates, immutable future exam snapshots and
attempt support, audit/correction/retention metadata, deterministic import
provenance, isolated quarantine, and privacy-safe historical aggregates.

The stable importer contract is [SCHEMA_CONTRACT.md](SCHEMA_CONTRACT.md); design
rationale is [SCHEMA_DECISIONS.md](SCHEMA_DECISIONS.md).

## Scope safeguards

- No service or feature behavior was implemented.
- No legacy person, credential, access, attempt, response, result, or generated
  history is represented as importable operational data.
- Future Phase/Task/Subtask/Element/Bloom rows and reviewed legacy mappings start
  empty.
- TPO/SPO/EO source IDs stay explicit and are never target hierarchy IDs.
- Imported question versions default to generation-blocked. Future task-based
  generation additionally requires a published version and approved future
  curriculum link.
- Both template formats retain their source-table identity with no inferred
  lineage.
- Quarantine is structurally disconnected from active content and historical
  aggregates are structurally disconnected from current attempts.

## Verification

Focused tests cover empty migration, required tables, empty future hierarchy,
foreign-key and integrity checks, deterministic source uniqueness, restrictive
parent deletion, version retention, generation eligibility, stable quarantine
reasons, restricted snapshot payloads, minimum-five aggregate publication, and
leading-zero employee identifiers.

Run from the repository root:

```sh
npx --no-install vitest run tests/migration/schema/schema.test.ts
npx --no-install drizzle-kit check
npx --no-install tsc --noEmit --pretty false
```

The schema test opens a fresh in-memory SQLite database through the production
foundation, applies every ordered migration, and requires both
`foreign_key_check` and `integrity_check`/`quick_check` to pass.
