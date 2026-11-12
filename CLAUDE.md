# CLAUDE.md — BPMS Enterprise engineering contract

## Mission

Bootstrap and develop a private enterprise BPMS using the verified Cloudflare official template. Minimize bespoke infrastructure, implement a tested vertical slice, document decisions and maintain reproducibility.

Read `README.md`, `docs/architecture/ADR-0001-cloudflare-stack.md`, `docs/architecture/REPOSITORY-ARCHITECTURE.md`, `docs/implementation/SCAFFOLD-IMPORT.md` and `docs/quality/ACCEPTANCE-GATES.md` before changing code.

## Mandatory execution rules

1. **Inspect first.** Run `git status --short`, inspect the tree, scripts, framework versions and existing documentation. Do not presume the repo is empty or overwrite established files.
2. **Protect governance.** Never overwrite `README.md`, `CLAUDE.md`, `.gitignore`, `docs/`, `scripts/` or `.github/` with template defaults. Keep all repository history; do not create nested `.git` directories.
3. **Source of truth.** Use `https://github.com/cloudflare/react-router-hono-fullstack-template` as the initial application scaffold. Import it using `python3 scripts/import_scaffold.py --dry-run`, then `--apply` only when preflight is clean. Record the upstream commit and review its licensing.
4. **Do not invent installed capabilities.** Mark D1, R2, Better Auth, Drizzle, Workflows, RBAC and integration modules `planned` until configured and tested. Cloudflare Workflows does NOT implement BPMN 2.0 semantics by itself.
5. **Preserve compatibility.** Maintain the upstream npm lockfile and working React Router/Cloudflare Vite/Hono combination for the bootstrap checkpoint. Do not jump to a different framework, React Router major version, package manager or repository layout without an ADR and explicit approval.
6. **Work in small increments.** Each increment must include acceptance criteria, implementation, tests, command output and changed file summary. Avoid mass rewrites.
7. **Security by default.** Validate all inputs; authenticate and authorize on the server; isolate client data; audit state changes; keep files private; protect secrets. Never expose production resources during local testing.
8. **External effects require approval.** Do not create remote D1/R2 resources, change DNS, add billing services, deploy, run production migrations or change GitHub access without explicit approval. Local installs/builds/tests are authorized.
9. **No secrets.** Never read back, echo or commit credentials. Keep `.dev.vars`, `.env` and tokens out of version control. Do not use real client data for test fixtures.
10. **Report verification accurately.** For every command, report `PASS`, `FAIL` or `NOT RUN`. A scaffold copy is not equivalent to a working BPMS.

## Implementation sequence (A–G)

- A. Inspect requirements and confirm the first business workflow. Create traceable acceptance criteria.
- B. Confirm architecture, runtime constraints, roles, data model and ADRs.
- C. Import official starter, run `npm ci`, `npm run typecheck`, `npm run build`, `npm run dev` smoke test; commit snapshot.
- D. Add D1+Drizzle, migrations and Better Auth/RBAC in independent small changes; validate Workers compatibility. Implement user/org separation.
- E. Create the first end-to-end use case: activity list → details → status update → evidence upload → progress recalculation; log audit event; test unauthorized access and invalid transitions.
- F. Add Workflows, Queues or third-party integrations only where justified; validate retry/idempotency and replay behavior.
- G. Set up checks, staging, monitoring, backups/restore drills and deployment runbook. Wait for approval before release.

## Technical boundaries

- Web: `app/`; route UI and reusable components; no credentials or business authorization in the client.
- API: `workers/`, Hono `/api`; thin route handlers; Zod validation + OpenAPI contracts.
- Domain: create `workers/modules/<feature>/` for domain operations and policies; keep business rules independent from HTTP handlers.
- Persistence: Cloudflare D1, Drizzle and versioned migrations. Do not use in-production schema pushes.
- Shared types: use `shared/contracts/` if shared contracts genuinely need it; avoid duplicating request/response interfaces.
- Storage: Cloudflare R2 with private object keys and authorization before download.
- Orchestration: Cloudflare Workflows only for durable programmatic jobs. If executable BPMN 2.0 is required, propose an engine (e.g. Flowable) as a separate ADR, not an unannounced dependency.
- CI: GitHub Actions with least-privilege permissions; never deploy on unreviewed PRs.

## Quality gate commands

Run only commands that exist in `package.json`. Initial official template is known to include:

```bash
npm ci
npm run typecheck
npm run build
```

After integrating the test tools, add documented scripts for lint, unit/integration tests and Playwright E2E. For Workers tests prefer `@cloudflare/vitest-plugin` (not its deprecated predecessor). Verify lockfile and dependency warnings before calling the stack production-ready.

## Required response format for each implementation increment

```text
GOAL: one verifiable change
FILES: created/modified
COMMANDS: exact commands executed
RESULTS: PASS / FAIL / NOT RUN (and relevant output)
RISKS: unresolved issues, security implications, licensing
NEXT GATE: smallest next step
```

## Stop conditions

Stop and report a blocker if a template import would overwrite an existing file, an unverified package/version conflicts with Workers, a migration could affect production data, the client asks for BPMN execution without an approved engine, or a requested external action requires permissions not yet granted.
