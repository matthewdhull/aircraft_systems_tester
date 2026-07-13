# Phase 4 Authorization Route Matrix

This inventory is binding for every SvelteKit route and server mutation. A
route not listed here must not be added without classifying it and adding direct
authorization coverage. Page links and hidden controls are not authorization.

## Route inventory

| Route                        | Operation                                                                                                                                                  | Classification         | Server enforcement                                                                  | Anonymous behavior     | Insufficient permission |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------- | ---------------------- | ----------------------- |
| `/`                          | page load                                                                                                                                                  | Public                 | None; contains no sensitive data                                                    | Render                 | Render                  |
| `/health`                    | `GET`                                                                                                                                                      | Public liveness        | Fixed liveness response only                                                        | `200`                  | `200`                   |
| `/ready`                     | `GET`                                                                                                                                                      | Public readiness       | Fixed ready/unavailable response; no diagnostics                                    | `200` or `503`         | `200` or `503`          |
| `/login`                     | page load                                                                                                                                                  | Public                 | Redirect authenticated users only to a validated local destination                  | Render                 | Render                  |
| `/login`                     | default login action                                                                                                                                       | Public mutation        | Origin check, login limiter, generic authentication result                          | Generic result         | Generic result          |
| `/login/password`            | page load                                                                                                                                                  | Public                 | No account lookup or token validation on load                                       | Render                 | Render                  |
| `/login/password`            | default password initialization/reset action                                                                                                               | Public mutation        | Origin check, single-use hashed token, generic failure                              | Generic result         | Generic result          |
| `/logout`                    | `POST`                                                                                                                                                     | Authenticated mutation | `requireAuthenticated`; revoke presented session                                    | Non-leaking `401`      | Not applicable          |
| `/admin/instructors`         | page load                                                                                                                                                  | `users.view`           | `requirePermission` in server load                                                  | Safe `/login` redirect | Non-leaking `403`       |
| `/admin/instructors`         | `create` action                                                                                                                                            | `users.create`         | Origin check and `requirePermission` before service call                            | Non-leaking `401`      | Non-leaking `403`       |
| `/admin/instructors/[id]`    | page load                                                                                                                                                  | `users.view`           | `requirePermission` before lookup                                                   | Safe `/login` redirect | Non-leaking `403`       |
| `/admin/instructors/[id]`    | `edit` action                                                                                                                                              | `users.edit`           | Origin check and `requirePermission` before service call                            | Non-leaking `401`      | Non-leaking `403`       |
| `/admin/instructors/[id]`    | `correctEmployeeNumber` action                                                                                                                             | `users.edit`           | Origin check and `requirePermission` before service call                            | Non-leaking `401`      | Non-leaking `403`       |
| `/admin/instructors/[id]`    | `changeStatus` action                                                                                                                                      | `users.lifecycle`      | Origin check and `requirePermission` before service call                            | Non-leaking `401`      | Non-leaking `403`       |
| `/admin/instructors/[id]`    | `grantRole` action                                                                                                                                         | `users.roles.manage`   | Origin check and `requirePermission` before service call                            | Non-leaking `401`      | Non-leaking `403`       |
| `/admin/instructors/[id]`    | `revokeRole` action                                                                                                                                        | `users.roles.manage`   | Origin check and `requirePermission` before service call                            | Non-leaking `401`      | Non-leaking `403`       |
| `/admin/curriculum`          | page load                                                                                                                                                  | `curriculum.manage`    | `requirePermission` before hierarchy/dependency reads                               | Safe `/login` redirect | Non-leaking `403`       |
| `/admin/curriculum`          | `createNode`, `createVersion`, `updateDraft`, `submitReview`, `reviewVersion`, `publishVersion`, `retireVersion`, `deleteDraft`, `reorderSiblings` actions | `curriculum.manage`    | Origin check and `requirePermission` before service call                            | Non-leaking `401`      | Non-leaking `403`       |
| `/admin/curriculum/bloom`    | page load                                                                                                                                                  | `curriculum.manage`    | `requirePermission` before vocabulary reads                                         | Safe `/login` redirect | Non-leaking `403`       |
| `/admin/curriculum/bloom`    | `createLevel`, `updateLevel`, `publishLevel`, `retireLevel`, `deleteLevel`, `createVerb`, `updateVerb`, `publishVerb`, `retireVerb`, `deleteVerb` actions  | `curriculum.manage`    | Origin check and `requirePermission` before service call                            | Non-leaking `401`      | Non-leaking `403`       |
| `/admin/curriculum/mappings` | page load                                                                                                                                                  | `curriculum.manage`    | `requirePermission` before legacy hierarchy, mapping, and safe reconciliation reads | Safe `/login` redirect | Non-leaking `403`       |
| `/admin/curriculum/mappings` | `proposeMapping`, `approveMapping`, `rejectMapping`, `retireMapping` actions                                                                               | `curriculum.manage`    | Origin check and `requirePermission` before explicit review service call            | Non-leaking `401`      | Non-leaking `403`       |

SvelteKit's origin checking remains enabled for every action and non-`GET`
endpoint. Hooks resolve the session but route loads/actions retain their own
explicit policy check. A valid session for an inactive user resolves as
unauthenticated. Redirect destinations accept local paths only and reject
protocol-relative or external URLs.

## Required principal coverage

Every protected operation is exercised as:

1. anonymous;
2. authenticated without the required permission;
3. instructor;
4. administrator;
5. a multi-role principal;
6. a principal whose grant has been revoked; and
7. an inactive user presenting an otherwise valid session.

Mutation tests issue direct requests and do not rely on missing UI controls.
The instructor role receives only permissions explicitly assigned by the
baseline seed; the role name itself is never checked in route code.

## Phase 5 extension

Phase 5 adds three protected route patterns and 23 named mutations. All reads and
mutations require the granular `curriculum.manage` permission. The
Curriculum Manager baseline role and Administrator baseline role receive that
permission through the existing seed policy; Instructor and Report Viewer do
not. Distinct-reviewer, parent-chain, dependency, and mapping-review rules remain
domain invariants after the route guard succeeds.

The executable `ROUTE_POLICIES` inventory now contains 11 route patterns and 32
mutations total. Phase 5 coordinator integration tests cover direct loads/actions
and the real cookie/session/hook path for anonymous, insufficient permission,
Curriculum Manager, Administrator, Instructor-only, revoked-grant, and suspended
principals. Cross-origin behavior remains SvelteKit-owned and is rechecked
against the built application.

## Phase 4 verification state

The Phase 4 baseline contained 8 concrete route patterns and 9 mutations (login, password
initialization/reset, logout, create, edit, employee-number correction,
lifecycle change, role grant, and role revocation). It has been reconciled to
the Phase 4 route filenames, named actions, and shared `ROUTE_POLICIES`.

Direct real-handler tests cover both administrator page loads, all six
administrator actions, and logout for every applicable principal class.
Cookie-to-hook-to-route integration separately resolves all seven principal
classes from real users, seeded grants, sessions, cookies, grant revocation,
and inactive status before calling the list load and create action. Public
login and password-action mutations were exercised through the built
adapter-node server. Cross-origin POSTs to those mutations and representative
protected mutations returned `403`; matched same-origin requests reached the
application. Open redirect tests reject external, protocol-relative, malformed,
and missing destinations.

Phase 4 coverage totals were **8/8 route patterns inventoried, 9/9 mutations classified,
7/7 protected operations directly exercised, and 9/9 mutations covered by
authorization or public-origin integration evidence**. The focused
security/audit suite passes 53 tests, including 20 direct route-matrix cases and
7 real hook-to-route principal cases.
