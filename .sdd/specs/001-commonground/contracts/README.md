# CommonGround API Contracts

This directory holds the Zod schemas that define the request/response shapes for every server-action and API boundary in the CommonGround application. The schemas here are the **source of truth** for:

- **Server Actions** (`app/src/app/.../actions.ts`) — parse their inputs against these schemas.
- **Service layer** (`app/src/server/<module>/`) — receive already-parsed, typed values from actions.
- **Client forms** (`app/src/components/`) — can import the same schemas for client-side validation (progressive enhancement; server re-validates).

## Phase 1 contract files

| File | Responsibility |
|---|---|
| `auth.ts` | Magic-link request / verify, session lookup |
| `spaces.ts` | Space create, rename, invite, accept invitation |
| `issues.ts` | Issue CRUD, status transitions, list/get |
| `perspectives.ts` | Perspective submit, edit, list-by-issue |
| `decisions.ts` | Decision Record draft, finalize, get |
| `delegations.ts` | Delegation grant, revoke, list |
| `referenda.ts` | Referendum initiate, deliberate, vote, close |
| `export.ts` | Own-data export + space-wide export initiation |

## Conventions

- Every file starts with `import { z } from 'zod'`.
- Named exports end with `Schema` (e.g., `CreateSpaceInputSchema`). Inferred types end with no suffix (e.g., `type CreateSpaceInput = z.infer<typeof CreateSpaceInputSchema>`).
- Every response schema is either a success variant or a `Result<Ok, AppError>` discriminated union.
- IDs are always `z.string().length(26)` (ULID).
- Timestamps are server-side only — never in inputs.
- Markdown fields have explicit `min`/`max` length bounds.

## Phase status

These are **stub** schemas. They define the shape of the Phase 1 surface but do not yet capture every field or every validation rule. The tasks phase (`tasks.md`) elaborates each file against the data model and the FRs.

## Sharing with the app

The app at `app/src/contracts/` imports from here. See `plan.md` "Open Questions" for the pending decision between pnpm workspace linking vs. copy-on-commit.

## Phase 2+ deferred

No contract files exist for AI, federation, SSO, or passkey surfaces. Those are added when their features land.
