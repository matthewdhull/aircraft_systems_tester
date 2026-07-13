# Template UI Contract

`/test-models` lists the latest canonical versions, exposes the draft editor, and separately lists legacy source records. `/test-models/[id]?version=…` provides lifecycle actions, current capacity, dependency-aware deletion, rules, and mandatory requirements.

The editor uses progressive SvelteKit forms and native labeled controls. Rule and mandatory rows may be added, removed, and reordered with keyboard-operable buttons. The live rule total, server error summary, shortage state, and advisory-capacity warning are textual rather than color-only. Layout collapses to a single control column on narrow screens.

Published content is rendered read-only. Publication, retirement, deletion, and new-version creation are explicit server actions. UI visibility is never an authorization boundary.
