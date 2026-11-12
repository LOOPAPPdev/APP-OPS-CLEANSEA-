# ADR-0001 — Cloudflare-native BPMS starter stack

**Status:** Accepted for local scaffold bootstrap; deferred infrastructure decisions remain open.  
**Date:** 2026-11-12  
**Owners:** Project maintainer / client approval for production.

## Context

The project is the first full-stack enterprise operations application for a client. It needs web UX, typed APIs, workflows, storage, integrations, auditability and secure operation. Primary objective is to reduce bespoke code and deployment complexity without suggesting that a scaffold already implements a BPMS.

## Decision

- Import the official `cloudflare/react-router-hono-fullstack-template` at its observed commit.
- Keep its single Worker deployment with React + React Router SPA, Hono API, Vite and Tailwind/shadcn.
- Preserve `npm` and the template lockfile until the first clean build, then address dependency updates in reviewed increments.
- Organize business logic by feature within `workers/modules`; prefer a modular monolith over a premature microservice split.
- Plan Cloudflare D1 + Drizzle for SQL data. Use migrations committed to version control. Re-evaluate PostgreSQL/Hyperdrive if requirements demand capabilities beyond D1.
- Plan Better Auth + Drizzle for invite-only identities, subject to verification in Cloudflare Workers+D1. Implement resource-level RBAC independently from UI permissions.
- Plan R2 for private business evidence and Cloudflare Workflows for durable, **code-defined** orchestration.
- Use Zod + Hono OpenAPI and automated tests via Cloudflare Vitest plugin / Playwright.
- Document architecture with arc42 and C4; apply security acceptance requirements from NIST SSDF and OWASP ASVS.

## Critical distinction: workflow vs BPMN

Cloudflare Workflows is a durable execution product. It does **not** claim BPMN 2.0 modelling or execution compliance. If the business requires BPMN diagrams, user tasks, gateways, process versions and executable BPMN semantics, evaluate Flowable (Java service + relational storage), Camunda and commercial/licensing constraints in **ADR-0002** before choosing an engine. Do not hand-build a BPMN engine inside a Cloudflare Worker.

## Alternatives considered

| Alternative | Decision | Reason |
| --- | --- | --- |
| Next.js + OpenNext on Cloudflare | Deferred | Viable but unnecessary for an internal SPA; requires adapter and different scaffold. |
| React + Hono + Workers (official template) | Selected | Already provides frontend/backend paths in one deployment unit. |
| PostgreSQL + Hyperdrive | Conditional | Stronger portability/advanced SQL; additional infrastructure and operations. |
| Cloudflare D1 | Selected initially | Native Workers binding and simple first deployment. Validate scale, data locality and regulatory needs. |
| Custom BPMN engine | Rejected | High implementation risk and standards burden. |
| Flowable / Camunda engine | Pending | Needed only if executable BPMN requirements are confirmed. |
| Multiple Workers and microservices | Deferred | Extra operational complexity for the first vertical slice. |

## Consequences and risks

- The selected template is a React Router SPA, not an out-of-the-box enterprise BPMS, nor necessarily aligned with newest React Router major releases. Do not blindly upgrade.
- SPA authorization is ineffective unless enforced by Hono/server-side domain services.
- Better Auth, D1, R2 and Workflows will require explicit bindings, configuration and integration tests.
- Remote infrastructure requires account access, cost review and approval.
- The project MUST confirm client requirements for tenant isolation, audit retention, data jurisdiction, access policy and RPO/RTO before any production deployment.
- License/commercial use checks remain required for upstream and any subsequent libraries.

## References

- Template: https://github.com/cloudflare/react-router-hono-fullstack-template
- Hono Cloudflare guide: https://developers.cloudflare.com/workers/framework-guides/web-apps/more-web-frameworks/hono/
- Drizzle D1: https://orm.drizzle.team/docs/sqlite/connect-cloudflare-d1
- D1 migrations: https://developers.cloudflare.com/d1/reference/migrations/
- Workflows: https://developers.cloudflare.com/workflows/get-started/guide/
- Better Auth Hono integration: https://hono.dev/examples/better-auth-on-cloudflare
- BPMN 2.0: https://www.omg.org/spec/BPMN/
- arc42: https://arc42.org/overview/
