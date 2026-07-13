# Future Quarantine Review Workflow

## Phase 3 boundary

Quarantine is restricted migration evidence, not operational content. Phase 3
records stable reason codes and safe counts only. It does not provide an
administrative UI, approve records, repair relationships, or publish content.

Quarantine has no foreign key into active questions, templates, curriculum,
generation, exams, attempts, or reports. Operational services must never query it
as an eligible content source.

## Future review sequence

An authorized future workflow may:

1. Select a restricted record inside an audited, least-privilege review surface.
2. Review the payload without copying it into logs, URLs, exports, analytics, or
   ordinary error messages.
3. Record one of: reject, retain pending review, or
   `approved_for_future_reconciliation`.
4. Require reviewer identity and review time for any review decision.
5. For an approved candidate, open a separate authorized transaction that creates
   a new canonical identity/version and explicit mapping under the then-current
   domain rules.
6. Run duplicate, parent, applicability, five-type, authorship, and publication
   validation as new content; never infer a repair from the legacy row.
7. Preserve the quarantine record as provenance according to the protected
   evidence retention policy.

`approved_for_future_reconciliation` is not publication, generation eligibility,
or acceptance. The quarantine row itself never becomes operational.

## Snapshot-only content

Unique content recoverable only from `usedQuestions` requires reason code
`restricted_snapshot_only_content`. Before storage, the importer removes source
row identity and all generated-test, person, date, access, attempt, and result
linkage. The database record must:

- use source table `usedQuestions`;
- have no source ID;
- contain a restricted payload and non-reversible comparison fingerprint;
- remain excluded from current-content and historical-report queries.

If safe unlinking cannot be proven, the record is excluded instead of
quarantined.

## Suppression and other anomalies

`aggregate_group_suppression` records that a group below five was suppressed or
safely rolled up; it is never a request to reveal the small cell. Missing parents,
parent mismatches, sentinels, invalid variants, ambiguous templates, malformed
questions, duplicates, encoding failures, and unreliable joins remain unresolved
until a separately authorized future workflow evaluates them.

## Audit and reporting

Future review audit records may contain internal actor and quarantine references,
but general reconciliation reports expose only stable reason/status counts. No
report may include payloads, prompts, choices, answers, people, access values,
generated-test identifiers, exact individual dates, or sensitive paths.
