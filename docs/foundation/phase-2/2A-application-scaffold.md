# Tranche 2A: Application Scaffold

## Status

Pass. The repository contains a minimal SvelteKit application, a pinned npm toolchain,
strict TypeScript settings, formatting and linting, Vitest conventions, and an
`@sveltejs/adapter-node` production build.

This tranche is infrastructure only. It does not define application-domain data or implement
authentication, curriculum, questions, exams, grading, reporting, or import behavior.

## Runtime and package decisions

- **Node baseline:** Node 24 LTS, expressed as `>=24 <27`. Node 24 is the active LTS line at the
  time of the Phase 2 scaffold, and the selected dependencies support it. Production should use
  an up-to-date Node 24 release. Node 26 remains a permitted current runtime for forward clean
  checkout verification.
- **Package manager:** npm, pinned as `npm@11.16.0` in the `packageManager` field. This matches
  the package manager used to generate `package-lock.json` with lockfile version 3.
- **Install convention:** `npm ci`. Dependency changes use `npm install` only through the
  tranche 2A package owner; other tranches request exact changes through the coordinator.
- **Production database packages:** `drizzle-orm` and `better-sqlite3` are runtime dependencies.
  `drizzle-kit` and the driver typings are development dependencies. This keeps a single
  production SQLite driver and uses the stable Drizzle release line.
- **Additional foundation dependencies:** no runtime validation or logging package was added.
  Node and SvelteKit capabilities are sufficient for the Phase 2 delivery foundation. jsdom and
  Testing Library support lightweight Svelte component tests without a downloaded browser.

Primary references consulted:

- [Node.js release schedule](https://nodejs.org/en/about/previous-releases)
- [Svelte CLI `sv create`](https://svelte.dev/docs/cli/sv-create)
- [SvelteKit Node adapter](https://svelte.dev/docs/kit/adapter-node)
- [Drizzle SQLite drivers](https://orm.drizzle.team/docs/sqlite/get-started-sqlite)
- [better-sqlite3 project](https://github.com/WiseLibs/better-sqlite3)

## Safe scaffold method

The official Svelte CLI 0.16.3 was invoked in a new temporary directory with the minimal
TypeScript template and the Prettier, ESLint, Vitest unit-test, and Node-adapter add-ons. It was
run with `--no-install`. Generated files were reviewed and only the explicitly assigned 2A
paths were transferred into this non-empty repository. No legacy file was overwritten or
deleted.

The application uses Svelte 5 runes conventions. `svelte.config.js` owns the Svelte compiler and
Node-adapter contract, while `vite.config.ts` owns the standard SvelteKit Vite plugin. The Node
adapter writes the production artifact to `build/`, started with
`node build` or `npm start` after `npm run build`.

## TypeScript and test conventions

`tsconfig.json` enables `strict`, `noUncheckedIndexedAccess`, and
`exactOptionalPropertyTypes`. JavaScript checking remains enabled for framework configuration.

Vitest has two projects:

- `server` uses the Node environment for TypeScript unit and integration tests under `src/` and
  `tests/`, excluding UI-owned tests.
- `ui` uses jsdom for Svelte component tests under `src/` and `tests/foundation/ui/`.

Test files use `.test.ts` or `.spec.ts`; colocated Svelte tests use `.svelte.test.ts` or
`.svelte.spec.ts`. Tests must contain at least one assertion. `npm test` runs once and permits an
empty suite during the serial scaffold milestone; later tranche tests run normally as soon as
they exist.

## Commands

```sh
npm ci
npm run dev
npm run format:check
npm run lint
npm run check
npm test
npm run build
npm start
```

`npm run test:unit` starts Vitest in watch mode. `npm run preview` uses Vite's preview server for
local build inspection; the production start contract is `npm start`.

## Source ownership contract

### 2A application scaffold

- `package.json`, `package-lock.json`, and package-manager declaration
- `svelte.config.js`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`
- ESLint and Prettier configuration
- `src/app.html`, `src/app.d.ts`, `src/routes/+page.svelte`
- framework assets under `static/`
- this document

### 2B data foundation

- `src/lib/server/db/`
- `drizzle/` and `drizzle.config.*`
- `tests/foundation/database/`
- the 2B foundation and SQLite-driver decision documents

Database code must remain under the server-only `$lib/server` boundary. It may not be imported
by client-rendered modules.

### 2C UI foundation

- `src/lib/components/`, `src/lib/styles/`, and `src/lib/navigation/`
- `src/routes/+layout.svelte` and `src/routes/+error.svelte`
- `tests/foundation/ui/`
- the 2C foundation document

The landing page remains 2A-owned. Navigation may model future visibility but may not act as an
authorization boundary.

### 2D delivery foundation and coordinator

- `.github/workflows/`, deployment artifact files, `.env.example`, and `.gitignore`
- `src/lib/server/config/` and `src/lib/server/logging/`
- `src/routes/health/` and `src/routes/ready/`
- `tests/foundation/config/` and `tests/foundation/health/`
- `DEVELOPMENT.md`, the 2D document, and convergence documents

Only 2A may change package manifests, the lockfile, or shared framework build configuration.
Requested dependency changes must be routed through the coordinator and installed serially.

## Initial verification

The serial milestone requires `npm run format:check`, `npm run lint`, `npm run check`,
`npm test`, and `npm run build` to pass before parallel tranches start. Final clean-checkout and
runtime endpoint evidence is recorded by the coordinator during convergence.
