# Development and Delivery Guide

## Prerequisites

- Node.js 24 LTS (the package contract permits current Node releases through 26)
- npm 11, pinned to `11.16.0` by `package.json`
- Local persistent storage for any non-test SQLite database

Use synthetic data only. Do not copy the protected source export, real questions, answers,
credentials, access codes, or personal records into the Phase 2 application database.

## Local setup

```sh
cp .env.example .env
npm ci
npm run dev
```

SvelteKit reads `.env` during development. `DATABASE_PATH` is required by readiness and defaults
in the example to `.runtime/aircraft-systems-tester.sqlite`. The database initializer creates
the local parent directory, applies infrastructure-only migrations, enables foreign keys, and
uses WAL plus a 5,000 ms busy timeout for persistent files.

Test databases are temporary or in-memory, independently initialized, and contain no production
data. They are removed or closed by the test harness.

## Configuration behavior

| Mode        | Behavior                                                                                                                            |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Development | Loads local `.env`; use `.runtime/` and synthetic data.                                                                             |
| Test/CI     | Tests inject temporary or in-memory database paths; CI uses an ignored local path.                                                  |
| Preview     | Build with `APP_ENV=development`, then `npm run preview` serves a Vite preview for inspection, not the production artifact.         |
| Production  | `npm start` runs the adapter-node artifact. `DATABASE_PATH` must identify persistent local/block storage and may not be `:memory:`. |

`APP_ENV` accepts `development`, `test`, or `production`; `LOG_LEVEL` accepts `debug`, `info`,
`warn`, or `error`. Adapter-node also consumes `HOST`, `PORT`, `ORIGIN`, and `SHUTDOWN_TIMEOUT`.
`ORIGIN` must be the canonical externally visible origin, including scheme and non-default port;
production uses its HTTPS origin. This value lets SvelteKit distinguish same-origin mutations from
CSRF attempts. Environment files contain names and safe placeholders only; deployment secrets
belong in the operator's secret store.

## Verification and build

```sh
npm run format:check
npm run lint
npm run check
npm test
npm run build
npm start
```

## Phase 3 migration commands

Migration commands write only to ignored local storage. Use `.runtime/` for targets and reports.
The authoritative command verifies the fixed approved checksum before parsing and must run only in
the authorized offline environment. Its output is safe counts only.

```sh
# Create and verify an empty migrated target.
npm run migration:migrate -- .runtime/empty.sqlite

# Inspect or import the synthetic Phase 1 fixture.
npm run migration:profile:fixture
npm run migration:import:fixture -- --target .runtime/fixture.sqlite

# Import the protected authoritative source without printing content.
npm run migration:import:authoritative -- --target .runtime/authoritative.sqlite

# Produce safe reconciliation output and verify the migrated database.
npm run migration:reconcile -- --database .runtime/fixture.sqlite \
  --json .runtime/reconciliation.json --markdown .runtime/reconciliation.md
npm run migration:verify -- .runtime/fixture.sqlite

# Compare two independently imported targets.
npm run migration:reconcile -- --database .runtime/first.sqlite \
  --compare .runtime/second.sqlite --json .runtime/comparison.json
```

Do not commit SQLite databases, reconciliation output from the authoritative source, restricted
quarantine artifacts, or temporary MySQL data. CI uses the synthetic fixture only.

After `npm run build`, `npm start` runs `node build`. With the example environment loaded:

- `GET /health` proves the Node process responds.
- `GET /ready` verifies configuration and database initialization/pragma availability.

Both endpoints return generic status only. They never return environment values or filesystem
paths. Adapter-node handles `SIGTERM`/`SIGINT` and dispatches its shutdown event; the readiness
database handle closes during that event.

For the standard local acceptance preview, preserve the existing ignored preview database and use
port 5173. The development-only build trusts the two equivalent loopback browser origins while
production and test builds keep the SvelteKit trusted-origin list empty:

```sh
APP_ENV=development npm run build
APP_ENV=development DATABASE_PATH=.runtime/phase4-preview.sqlite \
  ORIGIN=http://127.0.0.1:5173 npm run preview -- --host 127.0.0.1 --port 5173
npm run preview:smoke -- --url http://127.0.0.1:5173
```

The smoke check proves `127.0.0.1`, `localhost`, and the captured opaque (`Origin: null`) local
preview transport can reach the login action while an unrelated cross-site origin remains
forbidden. The opaque origin is trusted only in an explicit development build, which must remain
bound to loopback and should run only during local acceptance testing. Production and test builds
keep an empty trusted-origin list. Do not disable SvelteKit's origin check to make a preview work.

## Phase 4 authentication and account operations

Phase 4 adds no default account, password, token, or authentication secret to environment files.
The application seeds only the fixed role/permission vocabulary. Create the first administrator
from an interactive terminal using the exact procedure in
[`docs/migration/phase-4/BOOTSTRAP_AND_PASSWORD_RESET.md`](docs/migration/phase-4/BOOTSTRAP_AND_PASSWORD_RESET.md):

```sh
npm run auth:bootstrap -- --database /absolute/path/to/application.sqlite \
  --employee-number 00000 --first-name Synthetic --last-name Operator
```

The command prompts with terminal echo disabled and refuses non-interactive secret input. It has
no password argument and refuses any non-empty identity/bootstrap state. An effective active
administrator issues a one-hour initialization or reset token with `npm run auth:password-action`;
the raw token is shown once, only its digest is stored, and the recipient consumes it at
`/login/password`. No email or other delivery infrastructure is implied.

Passwords use Argon2id with reviewed explicit parameters. Sessions store only SHA-256 token
digests, allow concurrent devices, expire after 30 minutes idle or 12 hours absolute, rotate at
login when an existing cookie is presented, and support explicit/all-account revocation. The
`ast_session` cookie is `HttpOnly`, `SameSite=Lax`, path `/`, and becomes `Secure` when
`APP_ENV=production`. Deactivation/suspension, retirement, and password changes revoke active
sessions transactionally.

Login attempts are limited per normalized account and network over a 15-minute window (five per
account, twenty per network). The bounded 10,000-digest limiter is process-local and matches this
project's required single writable Node process. Any future multi-process ingress must provide
equivalent shared enforcement. Monitor saturation without recording network keys, employee
numbers, credentials, or request bodies.

Never place passwords, raw session/reset/initialization tokens, cookies, password hashes, or
sensitive request bodies in source, fixtures, command arguments, environment variables, logs,
audit metadata, snapshots, tickets, or reports. Tests generate ephemeral credential values at
runtime. Account lifecycle/role/identifier changes and security-sensitive session actions are
audited with allow-listed metadata only.

## Phase 5 curriculum modeling

Applying all ordered migrations creates the Phase → Task → Subtask → Element tables and Bloom
vocabulary with zero rows. This empty state is intentional: the authoritative export contains no
future hierarchy or Bloom records. Do not seed a remembered taxonomy, reuse TPO/SPO/EO identifiers,
or generate legacy-to-future mappings. An active user with the `curriculum.manage` permission can
open `/admin/curriculum` and create the first Phase draft; child drafts are created beneath an
explicit parent version.

Curriculum content uses immutable UUID identities and numbered versions. Creation produces version
1 in draft. Draft content may be edited, reordered, or copied into a later draft without changing a
published version. Submit moves a draft to review. A distinct authorized reviewer records approval
before publication; an author cannot review or publish their own version, including when the author
is an Administrator. Published children require a published/effective parent chain. Published or
referenced content is retired rather than hard-deleted; only an unreferenced draft can be deleted
after a fresh server-derived dependency check.

Sibling positions are zero-based and contiguous. Reorder forms submit the complete sibling order
and a revision; stale orders fail without partial writes. Do not edit position columns manually in
a local database. Use `/admin/curriculum/bloom` to create, publish, and retire controlled Bloom
levels and verbs. The selector contains stored vocabulary only and remains empty until a Curriculum
Manager explicitly authors it.

Legacy TPO/SPO/EO remains read-only under `/admin/curriculum/mappings`. A mapping starts proposed
and becomes approved, rejected, or retired only through an attributable review with rationale.
Approval does not create a question-to-future-curriculum link and does not make a legacy question
generation-eligible; that work belongs to Phase 6.

Run the complete or focused curriculum suites with:

```sh
npm run curriculum:test
npm test
```

Run safe, read-only legacy mapping reconciliation against an ignored local database with:

```sh
npm run curriculum:reconcile -- --database .runtime/fixture.sqlite \
  --json .runtime/curriculum-mapping.json \
  --markdown .runtime/curriculum-mapping.md
```

The report contains counts and check names only. Do not commit SQLite databases or reconciliation
outputs, and do not expose source IDs, internal UUIDs, question/answer content, quarantine payloads,
people, or filesystem paths.

Only the curriculum schema owner may change `src/lib/server/db/schema/curriculum.ts` or generate
Phase 5 Drizzle migrations. Ordered migrations `0007`–`0009` extend the immutable `0000`–`0006`
chain. After a schema change, review the SQL and Drizzle snapshot/journal, then verify a clean
target:

```sh
npx --no-install drizzle-kit check
npm run migration:migrate -- .runtime/phase5-empty.sqlite
npm run curriculum:test
```

All curriculum loads and mutations require the real Phase 4 session, origin/CSRF behavior, and
`curriculum.manage` server guard. Navigation visibility is not authorization. Audit events persist
only safe lifecycle/type/count metadata and never curriculum text, mapping rationale, source IDs,
question content, credentials, tokens, or cookies.

## Phase 6 question bank

An active user with `questions.view` can open `/questions` and search or filter safe summaries;
`questions.create` separately authorizes creation of an immutable UUID identity with version 1 in
draft. Every draft is validated
server-side against one of five canonical types: `true_false`, `single_choice`,
`two_correct_compound`, `all_correct`, or `none_correct`. The accepted legacy/UI aliases are `tf`,
`mc`, `c2`, `ac`, and `nc`. Ordinary single-choice questions always contain one correct and three
incorrect choices; the service never adds a random all/none distractor.

Drafts may be edited and submitted for review. A distinct actor with `questions.review` approves or
returns the version. Publication then requires `questions.publish`, a recorded distinct approval,
valid effective aircraft applicability, and an actor other than the author. Administrator does not
bypass the distinct-reviewer rule. Published or referenced versions are immutable; correction
creates the next draft version. Retirement requires both `questions.publish` and `records.retire`.
Only a safely unreferenced draft may be hard-deleted after a fresh server dependency check.

Future curriculum applicability is separate from Phase 5 legacy mapping. A question link is
explicitly proposed, then separately and attributably reviewed against a published/effective Phase
→ Task → Subtask → optional Element chain. A Phase 5 mapping approval never creates a question link
or changes generation status. Eligibility is server-derived and requires a published/effective
question, valid effective aircraft, and an approved link whose complete target ancestry remains
published/effective. Eligibility, link/lifecycle mutation, and safe audit event commit or roll back
together. Retire active question links before retiring their target curriculum or any ancestor;
the curriculum service blocks that retirement until the audited link-retirement transaction has
removed eligibility.

Phase 3 imported question versions remain provenance-preserving `review`/`blocked` rows. Never edit
or publish an imported row in place. To correct or adopt it, use the protected new-version action;
the service copies it into a new draft attributed to the current author while retaining faithful
legacy TPO/SPO/EO links. The new draft then follows the ordinary distinct-review and explicit
future-link process.

Question list/search payloads never contain option text, correctness, semantic answer values, or
keys. Key-bearing detail requires a server-authorized authoring/review context or
`answer_keys.view`. Correct-answer material must not enter URLs, logs, audit metadata, errors, or
safe reconciliation output. Client visibility and enhanced form state are never authorization or
validation boundaries.

Run the complete or focused question suites with:

```sh
npm run questions:test
npx --no-install vitest run tests/questions/domain tests/questions/database
npx --no-install vitest run tests/questions/ui tests/questions/accessibility
npx --no-install vitest run tests/questions/migration tests/questions/golden
npx --no-install vitest run tests/questions/integration tests/questions/security
```

Run safe, read-only imported-question reconciliation against an ignored migrated database with:

```sh
npm run questions:reconcile -- --database .runtime/fixture.sqlite
npm run questions:reconcile -- --database .runtime/fixture.sqlite --format markdown
```

The command emits count-only JSON or Markdown. It never emits prompts, choices, keys, source IDs,
internal UUIDs, database paths, or restricted payloads. Keep databases and reconciliation output
under ignored `.runtime/`; do not commit them. Ordered Phase 6 migration `0010` extends but never
rewrites migrations `0000`–`0009` and upgrades the existing preview database through ordinary
application startup.

## SQLite deployment contract

Run exactly one writable Node application instance against the database file. Store it on durable
local or block storage with WAL-compatible locking, never on a general network filesystem. Keep
write transactions short. A container deployment must mount persistent storage at `/data`; the
provided image defaults to `/data/aircraft-systems-tester.sqlite` and runs as the non-root `node`
user.

Phase 2 does not provide production backup automation. The owner-approved current exception is
manual operator snapshots; document and rehearse the snapshot procedure before irreplaceable new
data exists. Backup/restore hardening remains later work.

## Troubleshooting

- **Readiness returns 503:** check that `DATABASE_PATH` is present, its parent is writable, and the
  process has exclusive access needed to initialize the database. Logs use only a generic error
  code and intentionally omit paths.
- **SQLite busy/locked:** verify only one writable Node instance uses the file and the storage
  supports WAL locking. Do not reduce the busy timeout as an ad hoc fix.
- **Native driver installation fails:** use supported Node 24 on a platform supported by
  `better-sqlite3`; do not introduce a second SQLite driver.
- **Production start fails:** run `npm run build` first and verify the documented environment.
- **Clean install differs:** use `npm ci`, not an unpinned install command.
