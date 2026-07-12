# Phase 1D — Data-Handling Controls

## Scope and authority

These controls turn the approved Phase 0 governance decisions into rules for
preservation, characterization, and later migration development. They apply to
tracked files, untracked working files, tool output, screenshots, captures,
backups, and copies made outside Git. They do not authorize production or
external-system access.

The authoritative source is the owner-designated export identified by path,
byte size, and SHA-256 in
[SOURCE_EXPORT_DISPOSITION.md](../phase-0/SOURCE_EXPORT_DISPOSITION.md). The
export remains protected evidence. Phase 0 excludes legacy people, accounts,
credentials, access events, identifiable attempts/results, and generated-test
history; permits only specified privacy-safe aggregates; and requires groups
of at least five. These rules are authoritative even when repository code or a
historical artifact exhibits different behavior.

## Data classes and repository admission

| Class | Examples | Git / ordinary development rule |
| --- | --- | --- |
| Protected source evidence | Authoritative SQL export, other historical dumps, original request/response data | Existing protected artifacts are not copied, edited, quoted, staged anew, or distributed. Access is exceptional and read-only. |
| Secrets and authentication material | Passwords, hashes, API/database credentials, cookies, tokens, exam access or override codes | Prohibited, including revoked or synthetic-looking copies of real values. Synthetic placeholders must be unmistakably artificial and nonfunctional. |
| Personal or individual assessment data | Names, employee identifiers, accounts, roster rows, attempts, responses, scores, generated-test linkage | Prohibited in new repository artifacts and ordinary logs/captures. |
| Protected assessment content | Real prompts, answer wording, answer keys, generated-test snapshots | Prohibited in fixtures and discovery artifacts. Restricted quarantine belongs outside ordinary Git and requires content-review authorization. |
| Historical aggregates | Approved generation, assessment, and question-performance summaries | Allowed only when non-identifying, composed from reliable dimensions, and every released group has at least five members. Record suppression/anomaly counts, never suppressed values. |
| Synthetic fixtures and golden cases | Invented identifiers, prompts, choices, scores, relationships | Allowed after the admission review below. They must not be transformations that remain linkable to a real person or item. |
| Structural metadata | Table/column names, types, counts, dispositions, checksums | Allowed when it contains no row values or sensitive literals. A checksum may identify protected evidence without revealing its contents. |
| Discovery descriptions | Paraphrased behavior, file/line citations, offline limitations | Allowed. Do not quote protected row values, assessment text, or credential-bearing source lines. |

No Phase 1 artifact may contain Phase, Task, Subtask, Element, or Bloom source
rows: the authoritative export has none and the approved target structures
begin empty. Describing that absence is allowed.

## Authoritative export storage and access

1. Keep the authoritative export at its existing protected repository location;
   do not rename, reformat, normalize, patch, or create convenience copies.
2. Identify it in documentation only by the relative protected path, recorded
   byte size, and checksum. Never paste excerpts or values from inside it.
3. Limit direct access to the data owner and specifically authorized migration
   personnel with a defined task. Read access must use a local, offline working
   environment; no upload to chat, hosted analysis, issue trackers, paste
   services, telemetry, or external systems is allowed.
4. Before and after an authorized operation, verify the checksum without
   printing file contents. Treat a mismatch as an incident: stop, preserve the
   differing artifact without overwriting either copy, and escalate to the data
   owner/coordinator.
5. Repository access is not blanket permission to inspect protected row values.
   Prefer schema-only queries, counts, hashed/set-membership comparisons, and
   scripts whose output is aggregate status.

## Approved derived artifacts and sanitization

An admitted derived artifact must be one of the following:

- a wholly synthetic MySQL-shaped fixture;
- synthetic golden behavior cases;
- structural schema, count, relationship, or disposition metadata;
- a privacy-safe aggregate permitted by the Phase 0 aggregate contract; or
- prose characterization that cites code locations without reproducing
  protected literals.

Sanitization is a design process, not search-and-replace. Invent identifiers,
labels, prompts, choices, dates, and outcomes independently. Preserve only the
structural property under test: nullability, a zero sentinel, encoding shape,
relationship cardinality, a malformed relationship, or a disposition. Never
retain recognizable substrings, stable hashes of low-entropy values, row order,
exact timestamps, or combinations that permit re-identification. Use synthetic
groups of at least five for all aggregate examples and tests.

Quarantine examples describe reason codes and synthetic payloads only. Real
quarantined question content is restricted evidence and must not enter ordinary
Git, fixtures, screenshots, test failures, or review comments.

## Output, capture, and temporary-file controls

### Logs and terminal output

- Commands that inspect protected files must emit only schema names, counts,
  checksums, byte sizes, Boolean pass/fail results, or redacted error summaries.
- Do not use commands that echo matching lines. Sensitive-overlap checks return
  only exit status and per-file/per-category counts; on a match, record the
  affected artifact and category, not the value.
- Disable shell tracing and verbose database/client output. Do not include query
  parameters, form bodies, cookies, headers, SQL rows, or environment values in
  logs.
- Test failures must identify a case ID and violated invariant, not serialize a
  protected object. Before sharing a transcript, review it under the same
  admission checklist as a repository artifact.

### Screenshots and request/response captures

The legacy system is offline, so Phase 1 uses repository-backed page/state and
contract catalogs. Do not invent screenshots or claim live traffic. Any future
authorized capture must use a synthetic environment and synthetic session,
crop unrelated applications, exclude browser autofill/history and developer
tool secrets, and redact authorization/cookie headers and protected bodies
before persistence. A capture that began with real data is protected evidence,
not an ordinary development artifact, even after visual redaction.

### Temporary files and backup copies

- Prefer in-memory/streaming inspection. If a temporary derivative is required,
  create it on approved local encrypted storage with owner-only permissions, a
  task identifier, and an explicit deletion deadline.
- Never place protected temporary files in the repository tree, shared `/tmp`,
  cloud-synchronized folders, browser downloads, editor recovery folders, or
  CI artifacts. Do not rely on filename extensions or `.gitignore` as access
  control.
- Do not create backup copies of the authoritative export during Phase 1. A
  required protected archive or backup must be separately owner-approved,
  access-restricted, encrypted, inventoried, integrity-checked, and assigned a
  retention owner.
- Delete temporary derivatives immediately after validation. Use the approved
  secure-deletion mechanism for the actual storage medium; where physical
  overwrite is unreliable (for example SSD snapshots), use cryptographic erase
  or storage-provider deletion and record completion. Never delete the
  authoritative export or other evidence under this procedure.

## Retention

Phase 1 repository artifacts remain only while they are useful and compliant;
normal Git review governs their removal. Protected source evidence follows the
separate repository-remediation/archive decision and is never destroyed by an
individual contributor. Temporary protected derivatives live only for the
authorized task. Generated exports in the future target system have a maximum
24-hour lifetime; access/security events have a one-year lifetime; and new
identity-linked attempts, responses, snapshots, and corrections have a
seven-year lifetime from completion unless a hold applies. At expiry, retain
only permitted non-identifying aggregates. These target retention periods do
not justify importing expired legacy individual history.

## Fixture and discovery artifact admission checklist

The author and a reviewer must record a pass for every applicable item:

- [ ] Path is within the tranche's allowed scope and no protected source file
  was modified.
- [ ] Artifact is wholly synthetic, structural metadata, approved prose, or an
  allowed aggregate; its provenance is documented.
- [ ] All 15 source tables have an explicit disposition where fixture coverage
  is claimed.
- [ ] No real name, employee identifier, account, password/credential, access or
  override code, question/answer wording, answer key, attempt/result, generated
  history, or exact personal date/time appears.
- [ ] No Phase/Task/Subtask/Element/Bloom source rows appear.
- [ ] Every aggregate group contains at least five synthetic or safely grouped
  members; smaller groups are suppressed or coarsened.
- [ ] Relationships, null/zero/encoding/orphan cases, expected counts, and
  quarantine reasons are internally consistent and are no broader than the
  approved disposition.
- [ ] Legacy-observed behavior and target-approved policy are labeled
  separately; suspected defects are not requirements.
- [ ] Relative links resolve; JSON/SQL structure parses with the strongest local
  check; trailing-whitespace and allowed-path checks pass.
- [ ] Sensitive overlap scans ran without printing matches, and any hit was
  manually resolved or escalated before admission.
- [ ] Offline limitations are explicit; no live screenshot, traffic capture, or
  runtime observation is claimed.

## Scanning procedure

Scanning uses categories and protected comparison sources, never sensitive
literals embedded in scripts, command lines, documentation, test cases, or CI
configuration.

1. Enumerate every tracked and untracked candidate Phase 1 file explicitly.
2. Run ordinary secret-pattern and high-entropy scans over those candidates,
   configured to report file, rule ID, and count only. Review placeholder hits.
3. In a local authorized process, extract protected candidate values by data
   class directly from the source evidence, normalize only for comparison, and
   compare in memory against candidate artifacts. Do not persist the extracted
   set. Return only pass/fail and counts by candidate file and category.
4. Detect exact and normalized overlap for credentials/access material,
   identity fields, and assessment text. Use minimum-length and boundary rules
   to avoid disclosing short common tokens; manually review only inside the
   protected environment.
5. Separately inspect fixtures for realistic identifiers, dates, low-entropy
   secrets, and copied prose. Passing an exact-match scan is necessary but not
   sufficient for irreversible sanitization.
6. If a scan finds a possible exposure, stop distribution and staging, restrict
   the artifact, notify the coordinator/data owner, determine whether Git or an
   external service received it, rotate any possibly functional secret, and
   follow an approved history-remediation process. Do not paste the match into
   a ticket or chat.

No scanning script containing protected values may be committed. CI must never
receive the authoritative export merely to perform an overlap scan.

## Review, incidents, and protected references

Pull-request or convergence review must include an allowed-path diff, the
admission checklist, machine-readable parse results, aggregate-size checks, and
a second-person review of sanitization. Review comments identify artifact,
case ID, data category, and required action without quoting the value.

Suspected exposure, checksum mismatch, unauthorized copy/access, accidental
terminal disclosure, or publication of a too-small aggregate is an incident.
Stop further copying, preserve minimal non-content evidence, restrict access,
and notify the coordinator and data owner. Credential exposure additionally
requires rotation/revocation by its system owner. Git history alteration,
evidence destruction, external notification, and legal-hold decisions require
separate owner authorization.

Protected evidence is referenced by a stable repository-relative location,
checksum, byte size, evidence class, owner, and access procedure. Discovery
documents may cite source-code file/line locations when the citation itself is
not sensitive, but must paraphrase sensitive behavior. Never attach the export,
row excerpts, screenshots of rows, or a reversible encoding to a Git artifact.

## Phase 1D verification record

This procedure is derived from the approved handling, retention, aggregate,
credential, and repository decisions in
[OWNER_DECISIONS.md](../phase-0/OWNER_DECISIONS.md), the table/aggregate contract
in [SOURCE_EXPORT_DISPOSITION.md](../phase-0/SOURCE_EXPORT_DISPOSITION.md), and
the repository risks in
[0D-operations-security.md](../phase-0/0D-operations-security.md). It records no
live observation and grants no production access.
