# Bootstrap and Password Reset

No default administrator, default password, hidden account, or legacy credential is created. Run these procedures only from an interactive terminal on the application host. Do not record the terminal, redirect output, paste commands containing secrets, or place credentials/tokens in environment variables, shell history, tickets, chat, reports, or documentation.

## First administrator

1. From the repository root, initialize a new local database through migration `0006`:

   ```sh
   npm run migration:migrate -- "$PWD/.runtime/application.sqlite"
   ```

   For another environment, replace that path with the actual writable database path used by the application. Do not copy an illustrative root path literally.

2. Stop application processes that could create identities concurrently.
3. Run:

   ```sh
   npm run auth:bootstrap -- --database "$PWD/.runtime/application.sqlite" --employee-number 00000 --first-name Synthetic --last-name Operator
   ```

   Replace every illustrative identity value. The command displays the 8-character minimum before prompting for the new password with terminal echo disabled. It refuses piped/non-interactive secret input and has no password argument.

4. Start the application and sign in normally. Verify the `bootstrap.administrator.created` audit event through the protected audit process.

The command seeds the fixed authorization vocabulary idempotently, then succeeds only when both the user table and active role-grant set are empty. User creation, the administrator grant, and the audit record commit together. It refuses missing role vocabulary, invalid input, duplicate/non-empty bootstrap state, or storage/audit failure. There is no force flag. If a partial or unexpected identity exists, preserve the database, investigate it, and use the recovery process below; never delete identities to make bootstrap pass.

## Initialization or reset token

An active effective administrator can issue a one-hour single-use action token:

```sh
npm run auth:password-action -- --database /absolute/path/to/application.sqlite --actor-employee-number 00000 --target-employee-number 00001 --purpose initialize
```

Use `--purpose reset` for an existing initialized account. Replace all illustrative values. The command prompts for the actor's password with echo disabled, refuses piped input, verifies the actor is active and currently has effective administrator capability, and never accepts a password or token argument. It writes the raw action token once to the interactive terminal; only its SHA-256 hash is stored. Transfer it directly to the intended person over an approved confidential channel and do not save the terminal output. No email delivery is implied or implemented.

The recipient opens `/login/password`, types the token, and chooses a new password. Tokens are purpose-bound, superseded by later tokens of the same purpose, expire after one hour, and become used and revoked atomically. A successful change activates a pending initialized user, stores only an Argon2id hash, revokes every active session, and records an audit event in the same transaction. Failures reveal neither account nor token state.

## Recovery

If at least one active effective administrator remains, that administrator issues a reset token using the procedure above.

If no effective administrator remains:

1. Stop every application process and prevent writes to the database.
2. Make an evidence-preserving copy of the database and its WAL/SHM companions under the organization's incident procedure. Do not use that copy as the recovery target.
3. Select the most recent organization-approved backup known to contain an active effective administrator and restore it using the approved database restore procedure.
4. Run the documented migration verification, `PRAGMA foreign_key_check`, and `PRAGMA integrity_check`; both pragmas must return no foreign-key rows and `ok`, respectively.
5. Start the application, verify that the restored administrator can authenticate, and immediately use the normal reset-token procedure above if credential recovery is also needed.
6. Review audit continuity and reconcile any post-backup administrative changes through normal audited application actions before returning the system to service.

Bootstrap intentionally refuses the non-empty database and is not a recovery backdoor. If there is no approved backup, keep the application stopped and escalate through the authorized security/database incident procedure. Phase 4 deliberately provides no force-bootstrap flag, unaudited direct-SQL recipe, destructive identity repair, or secondary credential channel.
