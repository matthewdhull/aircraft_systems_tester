# Repository Agent Instructions

## Post-phase workflow

After a phase has passed its acceptance gate and the user authorizes commits:

1. Review tracked, untracked, and ignored files; confirm only approved phase artifacts changed.
2. Split the completed work into several small commits grouped by functionality or ownership.
3. Use short, concise commit messages that describe the functionality added.
4. Stage deliberately and inspect each staged diff before committing.
5. Run the phase's documented verification commands after the final commit.
6. Confirm the branch and require a clean working tree before declaring the phase finished.
7. Commit changes in small groups, using concise commits to indicate features, or purpose, until worktree is clean.
8. Do not merge, push, switch branches, or begin the next phase unless the user explicitly asks.
9. After the acceptance gate passes, whether or not commits have been authorized, build the local preview with `APP_ENV=development`, start it on `http://127.0.0.1:5173` against the existing ignored preview database, run `npm run preview:smoke -- --url http://127.0.0.1:5173`, and leave it running so the user can test it without asking separately. Never replace an existing preview database with a new path without explicit approval.
