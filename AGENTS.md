# Repository Agent Instructions

## Post-phase workflow

After a phase has passed its acceptance gate and the user authorizes commits:

1. Review tracked, untracked, and ignored files; confirm only approved phase artifacts changed.
2. Split the completed work into several small commits grouped by functionality or ownership.
3. Use short, concise commit messages that describe the functionality added.
4. Stage deliberately and inspect each staged diff before committing.
5. Run the phase's documented verification commands after the final commit.
6. Confirm the branch and require a clean working tree before declaring the phase finished.
7. Do not merge, push, switch branches, or begin the next phase unless the user explicitly asks.
