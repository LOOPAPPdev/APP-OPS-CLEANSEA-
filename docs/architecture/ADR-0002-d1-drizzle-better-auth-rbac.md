# ADR-0002 — D1, Drizzle, Better Auth and RBAC foundation

- Status: Accepted (phase D, local only)
- Date: 2026-11-12

## Decisions
1. **Database:** Cloudflare D1 via binding `DB`. Only a **local** D1 is used so far. `wrangler.jsonc` holds a placeholder `database_id`; it MUST be replaced after an approved `wrangler d1 create` and before any deploy.
2. **ORM/migrations:** Drizzle ORM. `drizzle-kit generate` creates versioned SQL in `workers/db/migrations/`; Wrangler applies them (`npm run db:migrate:local`). No `drizzle-kit push`.
3. **Authentication:** Better Auth 1.x with the Drizzle adapter. Email + password, **public sign-up disabled**, min password length 12, 8 h sessions. Users are provisioned by an administrator (provisioning flow: phase E/G, not yet built).
4. **Authorization:** application RBAC. Table `membership(organization_id, user_id, role)`, roles `admin > manager > member > viewer`. `requireAuth` (401) then `requireOrgRole(role)` (403) look up membership in D1 on every request. Tenant isolation is by organization id.
5. **Audit:** append-only table `audit_event` (actor, action, target, correlation id, timestamp). Denied access is audited; the organization id is stored only for actual members, so a probe of another tenant leaves no cross-tenant link.
6. **Tests:** Vitest + `@cloudflare/vitest-plugin` (not the deprecated pool package) against a local D1.

## Consequences / known limits
- Better Auth emits a settled, unobserved promise rejection for expected errors (bad password, sign-up disabled). `vitest.config.ts` ignores only those two error codes.
- CSRF relies on Better Auth's origin check and cookie defaults; not yet reviewed against the ASVS controls chosen for the app.
- No rate limiting on sign-in yet (security gate item still open).
- Organization/user provisioning and admin UI do not exist yet.
