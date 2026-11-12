# Definition of Done and acceptance gates

## Initial bootstrap gate (C)

- GIVEN a clean repository with committed governance files, WHEN the importer runs in `--dry-run` mode, THEN no tracked file changes.
- GIVEN no collisions, WHEN the importer runs in `--apply` mode, THEN official source files are copied and upstream revision documented without replacing README/CLAUDE/docs.
- GIVEN the imported template and npm prerequisites, WHEN `npm ci`, `npm run typecheck` and `npm run build` run, THEN they all pass or blocking findings are reported truthfully.
- GIVEN the application starts locally, WHEN its UI and an expected API route are requested, THEN they return valid responses.

## Functional gate (E)

- GIVEN an authenticated authorized user, WHEN they view an activity, THEN data from the correct organization is returned.
- GIVEN an unauthorized user, WHEN they request another organization's activity by ID, THEN the API denies access, regardless of the UI state.
- GIVEN an allowed state transition, WHEN the user commits it, THEN new state, updated progress and an audit event persist consistently.
- GIVEN an invalid state transition, WHEN the user requests it, THEN the API returns a validation/conflict error and leaves persisted state unchanged.
- GIVEN a duplicate request, WHEN the operation is retried, THEN the operation does not duplicate external side effects.
- GIVEN an evidence file, WHEN the user uploads or downloads it, THEN type/size/ownership rules protect the private object.

## Security gate

- Validate cookie/session security, CSRF policy, request validation, authorization at object level, secret storage, access logging, failed sign-in behavior, dependency audit and OWASP ASVS controls selected for the app.
- Never use real client credentials or data in test fixtures.
- Distinguish successful authentication from authorization to a specific resource.
- Keep application audit logs separate from mutable UI status histories as required by client policy.

## Delivery gate (G)

- CI runs the actual configured checks for every PR.
- Staging and production resources/configuration are separate.
- Rollback and data restoration have documented steps and at least one tested drill.
- External API retries and idempotency tests pass where applicable.
- An approved human owner authorizes changes to production.

## Verification report template

| Check | Expected | Actual | Status |
| --- | --- | --- | --- |
| Source provenance | commit recorded | not yet run | NOT RUN |
| `npm ci` | succeeds | not yet run | NOT RUN |
| `npm run typecheck` | succeeds | not yet run | NOT RUN |
| `npm run build` | succeeds | not yet run | NOT RUN |
| Local UI/API smoke | valid response | not yet run | NOT RUN |
| Auth/RBAC/evidence audit | acceptance tests pass | not implemented | NOT RUN |

Do not mark a stage COMPLETE if its tests were not executed. Documentation is not proof of runtime behavior.
