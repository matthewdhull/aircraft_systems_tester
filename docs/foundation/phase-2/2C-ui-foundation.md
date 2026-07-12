# Tranche 2C: UI Foundation

## Status

Pass. The SvelteKit application has a restrained, responsive shell, an authorization-ready
navigation model, reusable accessible UI primitives, consistent state presentation, and
component-level tests. This tranche is presentation infrastructure only and implements no
authentication, authorization, or application-domain workflow.

## Scope basis

The shell follows the approved Phase 0 decisions and Phase 1 workflow catalog. It reserves
destinations for public exam access, staff sign-in, the staff dashboard, curriculum, questions,
test models, generated tests, reports, and instructor administration. It deliberately excludes
the duplicate question/template pages, daily and predefined quiz prototypes, FAQ, mail, demos,
and offline-analysis surfaces rejected by the approved scope.

The visual treatment keeps the legacy application's useful directness and blue institutional
identity while replacing table-based layout, image controls, browser-only privilege flags, and
jQuery behavior. The foundation uses a compact navy navigation rail, strong section boundaries,
plain language, and a restrained gold accent.

## Navigation and authorization boundary

`src/lib/navigation/navigation.ts` is typed configuration rather than an access-control list.
Items carry a public-or-staff audience hint and stable identifier. `visibleNavigation` can apply
a future server-provided presentation decision, but its contract explicitly states that it never
grants access. Every future route, server action, endpoint, query, export, and record lookup must
independently enforce authentication, permission, assignment, and record scope on the server.

The Phase 2 layout intentionally renders the complete static foundation menu so reviewers can
inspect the intended information architecture. It does not infer a user, role, permission, or
session. Destination pages remain future-phase work.

## Accessible application shell

The shell provides:

- a first-focus skip link and focusable main content target;
- semantic header, navigation, main, and footer landmarks;
- a native button controlling the mobile navigation with `aria-controls` and `aria-expanded`;
- Escape-key menu dismissal and ordinary keyboard-operable links;
- visible high-contrast focus treatment;
- responsive navigation rail and content layout;
- current-page navigation semantics;
- reduced-motion handling that also disables smooth scrolling;
- a generic application error page that reports only HTTP status and safe guidance; and
- an always-visible foundation warning against protected or production data.

The global style foundation defines color, typography, spacing, focus, form, status, panel,
table-container, loading, and empty-state behavior. No external font, image, script, or design
system dependency is required.

## Reusable primitives

The component index exports:

| Component                 | Foundation contract                                                                                |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| `Button` and `LinkButton` | Consistent primary, secondary, quiet, and destructive actions using native elements.               |
| `TextField`               | Explicit labels, optional instructions, required indication, linked error text, and invalid state. |
| `ErrorSummary`            | Alert summary with links to invalid fields.                                                        |
| `StatusMessage`           | Information, success, warning, and error announcements.                                            |
| `Panel`                   | Semantic section/card container with optional heading and introduction.                            |
| `DataContainer`           | Named, horizontally responsive region for future semantic tables.                                  |
| `LoadingState`            | Polite loading announcement with a reduced-motion-safe indicator.                                  |
| `EmptyState`              | Consistent no-results/no-content presentation.                                                     |

These primitives provide presentation and semantics only. They do not contain domain fields,
question content, answer values, access codes, identities, permissions, or network behavior.

## Tests and verification

UI tests use the scaffold's jsdom Vitest project and Testing Library. They verify field label,
description, and error associations; error-summary focus targets; loading announcements; the
approved navigation inventory; and non-mutating server-provided visibility filtering.

Commands run from the project root:

```sh
npm run check
npm run lint
npm test -- --project ui
npm run build
```

Full-repository outcomes can temporarily reflect concurrent 2B or 2D work. Final integrated
results and clean-checkout evidence belong in the coordinator's Phase 2 verification matrix.

## Future ownership

- Authentication and route authorization remain later-phase server work.
- Domain pages and workflows remain their respective later migration phases.
- Real navigation visibility must be derived by a server load function after authorization
  exists; hiding a link must never substitute for a server access check.
- Accessibility must be retested with complete workflows, validation, real data density, and
  supported browsers as those features are implemented.
