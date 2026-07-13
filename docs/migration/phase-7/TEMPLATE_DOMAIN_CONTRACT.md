# Template Domain Contract

Canonical templates have immutable UUID identities and numbered UUID versions. The lifecycle is `draft → review → published → retired`; review may return a version to draft. An author cannot publish their own version. Published or referenced versions are never edited or hard-deleted: editing creates the next draft and dependencies cause retirement. Only an unreferenced draft may be deleted.

Rules are ordered, have unique published/effective Subtask-version targets, positive counts, and total exactly the configured length. Mandatory requirements are ordered, unique published/effective Element versions, store their owning Subtask version, target a selected rule, and fit within that rule quota.

Capacity uses only currently eligible, published/effective Phase 6 question versions with matching aircraft applicability and approved future links. It returns fixed `CATEGORY_SHORTAGE` and `MANDATORY_ELEMENT_SHORTAGE` codes with IDs/counts, not content. This authoring check is advisory; generation revalidates within its transaction.

Mutations require `templates.manage` at the route and action boundary. Audit events are attributable and contain only identity, version, lifecycle, and fixed status metadata.
