# Selection Engine Contract

`selectQuestions` is a pure, deterministic constraint solver. Its only supported algorithm is `ast-selection-v1`. Inputs are the algorithm version, nonempty seed bytes, ordered positive quota rules, ordered mandatory Element requirements, and eligibility-filtered candidate facts. The engine still rejects candidates marked ineligible.

External collections and identifier arrays are canonicalized. Duplicate question-version rows are accepted only when their canonical facts are identical; conflicting duplicates fail as `INVALID_SELECTION_INPUT`. Rules require unique Subtasks, contiguous positions, and positive counts. Mandatory Elements are unique, contiguous, owned by a rule Subtask, and cannot outnumber that quota.

Mandatory requirements are assigned to distinct questions before remaining quota slots. A complete depth-first constraint search backtracks across mandatory and multi-category choices, so candidate overlap does not cause a greedy false shortage. Success contains exactly one category assignment per selected version, exact rule counts, and one distinct assignment per mandatory Element. Failure contains no partial assignments.

Shortages use only `CATEGORY_SHORTAGE` and `MANDATORY_ELEMENT_SHORTAGE`, fixed identifiers, and integer needed/available counts. Errors and outputs never contain seed bytes. Database state, clocks, global randomness, filesystems, and networks are outside this module.

The public seam is `src/lib/server/generation/selection/index.ts`: `selectQuestions(input): SelectionResult`, `SelectionInput`, `SelectionCandidate`, assignments, shortages, and the seeded random interface.
