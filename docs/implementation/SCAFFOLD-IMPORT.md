# Scaffold import and setup runbook

This is an instruction set for Claude Code, not a claim that the full stack is already installed.

## A. Audit existing repository

```bash
git status --short
git log -1 --oneline
python3 --version
node --version
npm --version
python3 scripts/import_scaffold.py --dry-run
```

Record findings. If any file conflicts or the repository is dirty, **stop** and resolve with a small commit or a separate branch. Do not overwrite.

## B. Bring in the official application scaffold

```bash
python3 scripts/import_scaffold.py --apply
npm ci
npm run typecheck
npm run build
npm run dev
```

Verify the application opens locally and `/api` routes behave according to imported source. Read `docs/architecture/SCAFFOLD-PROVENANCE.md` after import. Preserve and review upstream code credits and licensing. Commit the imported baseline **before** adding more technologies.

### What is actually imported?

The source files from the official Cloudflare React Router + Hono template. The importer deliberately skips the upstream `README.md`, `.gitignore`, `CLAUDE.md`, `.git` and governance directories. It never overwrites an existing path.

The script does **not** install Drizzle, Better Auth, Zod OpenAPI, R2, Workflows or testing dependencies, and does not execute deployments or provision resources.

## C. Modernize carefully, after baseline passes

1. Read `package.json`, versions and `package-lock.json` from the imported template.
2. Check `npm audit --omit=dev`. Report vulnerabilities without fabricating remediation.
3. Make compatible dependency updates separately and re-run typecheck/build/test after each group.
4. Check that React Router SPA mode remains supported by the chosen Cloudflare Vite plugin combination. Do not combine a newly created React Router v8 SSR scaffold with this existing SPA starter.
5. Select one lint/formatter tool and add a CI-checkable script.

## D. Data and authentication

1. Design entities: organization/user/role, activity, state transition, evidence metadata and audit event.
2. Add `drizzle-orm` and `drizzle-kit` with supported versions; configure a SQLite/D1 schema.
3. Generate **version-controlled** migrations and test them locally.
4. Ask for approval before running `npx wrangler d1 create <database-name>` or any remote write.
5. Configure the D1 binding in `wrangler.jsonc` (no placeholder ID can be deployed). Generate Worker binding types.
6. Evaluate Better Auth + Drizzle D1 runtime compatibility with a minimal session test; disable public signup and enforce server-side RBAC.
7. Confirm identity and authorization before adding protected business endpoints.

Sources: https://developers.cloudflare.com/d1/get-started/ and https://orm.drizzle.team/docs/sqlite/connect-cloudflare-d1 and https://hono.dev/examples/better-auth-on-cloudflare

## E. Business vertical slice

Implement and test one flow only:

```text
Sign in
  → List accessible activities
  → View activity
  → Change status (valid transition only)
  → Attach private evidence
  → Recalculate parent progress
  → Persist audit event
  → Display result
```

Test success, missing authentication, forbidden object access, invalid transitions, duplicate submission, file policy violations and failed downstream writes.

## F. Integrations and jobs

Only after the vertical slice works, evaluate Cloudflare Workflows, Queues and external API adapters. All external side effects require idempotency keys, timeouts, retry strategy, observability and secure credentials.

BPMN execution requires an engine ADR and a separately deployed compliant runtime. Do not call Cloudflare Workflows a BPMN engine.

## G. Release readiness

Implement Github Actions checks, staging environment, least-privilege secrets, migration review, recovery drill, privacy/data-retention policy, security tests and deploy rollback. Deployment requires client approval.

## Claude Code kickoff prompt

```text
You are the engineering implementation agent for this BPMS repository.
Read README.md, CLAUDE.md and all docs/architecture, docs/implementation and docs/quality files.
Start at phase C (bootstrap), unless phases A/B documentation is missing or contradictory.
Run git status and verify the local prerequisites. Do not overwrite existing files.
Run python3 scripts/import_scaffold.py --dry-run; summarize the collision report and official source.
If preflight passes and no external/deploy action is needed, run --apply, then npm ci, npm run typecheck and npm run build.
Verify localhost app/API with a smoke test if possible. Record upstream commit and license review.
Make the smallest required changes to get the imported template building; do not refactor architecture yet.
Report files changed, commands, PASS/FAIL/NOT RUN, risks and the next gate.
Do not provision cloud resources, alter GitHub access or deploy without explicit approval.
```
