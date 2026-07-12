# Tranche 2D: Delivery Foundation

## Status and scope

The delivery foundation defines validated server configuration, deliberately narrow structured
logging, liveness/readiness probes, clean-checkout CI, an adapter-node container artifact, and
operator/developer guidance. It is infrastructure only and introduces no authentication, domain
schema, importer, or application feature.

## Configuration contract

`DATABASE_PATH` is the required application value. `APP_ENV` and `LOG_LEVEL` are validated enums;
production rejects an in-memory database. Development uses the ignored `.runtime/` directory,
tests use isolated temporary/in-memory databases, preview is inspection-only, and production
requires persistent local/block storage. Adapter-node owns `HOST`, `PORT`, and
`SHUTDOWN_TIMEOUT`.

`.env.example` contains names and safe local placeholders only. No environment value is included
in endpoint responses or structured logs.

## Logging and probes

Logging emits one JSON record per event using a fixed context field allowlist. It accepts no
request body, headers, cookies, credentials, question/answer content, access codes, personal
records, free-form exception messages, or stack traces. Route query strings are discarded and
token fields are normalized before serialization.

- `/health` returns a cache-disabled generic success response when the Node process can respond.
- `/ready` validates configuration, opens/initializes the foundation database, and verifies its
  required pragmas. Failure returns a generic 503 and a non-sensitive error code in logs.

The database handle is cached for the process and closed on adapter-node's documented
`sveltekit:shutdown` event. Adapter-node stops accepting new connections before dispatching this
event and uses `SHUTDOWN_TIMEOUT` for its graceful-shutdown window.

## CI and deployment artifact

`.github/workflows/ci.yml` uses Node 24 and `npm ci`, then runs formatting, lint, Svelte/TypeScript
checking, the complete Vitest suite, and the production build from a clean checkout.

The multi-stage `Dockerfile` builds with the pinned lockfile on Node 24 Debian, retains only
production dependencies with the native SQLite driver built for the matching runtime family,
runs as a non-root user, and exposes `/data` as persistent storage. The artifact starts with
`node build`, equivalent to `npm start`. It must run as exactly one writable application instance.

## Operational boundaries

- No protected production export or derived production database enters build context, CI, or the
  application image.
- SQLite requires persistent local/block storage and WAL-compatible locking.
- Health responses and logs expose no paths or configuration values.
- Backup automation is deferred under the recorded owner exception; manual snapshot guidance must
  be finalized before irreplaceable records exist.
- Phase 3 owns the canonical schema and importer.

See [DEVELOPMENT.md](../../../DEVELOPMENT.md) for setup, commands, storage requirements, and
troubleshooting.
