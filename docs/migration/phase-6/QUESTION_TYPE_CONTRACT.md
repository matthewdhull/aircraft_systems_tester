# Phase 6 Question Type Contract

## Authority and vocabulary

Phase 6 recognizes exactly `true_false`, `single_choice`,
`two_correct_compound`, `all_correct`, and `none_correct`. Server input is
trimmed and lower-cased. The only accepted aliases are `tf`, `mc`, `c2`, `ac`,
and `nc`, respectively. Unknown values return `invalid_question_type`.

`validateQuestionContent` in `src/lib/server/questions/validation.ts` is the
authoritative validator shared by authoring, persisted-detail reconstruction,
preview, and migration verification. Components may improve interaction but do
not replace this validation boundary.

## Persisted representation

Every version has at least one distinct, nonblank, ordered prompt. Prompt and
option text is trimmed. Prompt text is limited to 4,000 characters. Positions
are zero-based and contiguous when written by the service.

The representation deliberately remains compatible with the Phase 3 importer:

| Type                   | Persisted option rows     | Correctness and semantic values                       |
| ---------------------- | ------------------------- | ----------------------------------------------------- |
| `true_false`           | Canonical `True`, `False` | One key; semantic values `true`, `false`              |
| `single_choice`        | Four source choices       | One correct, three incorrect; null semantic value     |
| `two_correct_compound` | Three A–C statements      | Two correct, one incorrect; `compound` semantic value |
| `all_correct`          | Three A–C statements      | All correct; `all` semantic value                     |
| `none_correct`         | Three A–C statements      | All incorrect; `none` semantic value                  |

The compound D choice is not stored as a question-option row. Imported versions
are never rewritten merely to add it.

## Deterministic display

`buildCanonicalDisplay` assigns source rows to A–D in persisted position order.
True/false always displays A as True and B as False. Single choice displays its
four rows unchanged and never gains a random all/none distractor.

For compound types D is deterministic:

- two-correct: the alphabetically ordered correct A–C letters, in the fixed
  sentence `[first] and [second] are correct.`;
- all-correct: `All of the above.`; and
- none-correct: `None of the above.`.

D is the keyed display choice for all three compound types. A non-key display
omits both `keyLetter` and per-choice `isCorrect`. Privileged authoring/review
detail contains the key only after the route establishes the required context.

## Rejection rules

The server rejects missing or duplicate prompts, blank or duplicate choices,
wrong option cardinality, wrong key cardinality, and missing, duplicated, or
ambiguous true/false semantics. Errors contain fixed field/position messages;
they never echo assessment content or answer material.

All documentation and automated examples use synthetic content.
