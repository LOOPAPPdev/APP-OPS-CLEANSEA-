# Scaffold provenance

- Imported at UTC: 2026-11-12
- Method: manual import (importer `scripts/import_scaffold.py` not used: its default source repo was not fetched; the scaffold was copied from the monorepo directory below)
- Upstream source: https://github.com/cloudflare/templates, directory `react-router-hono-fullstack-template`
- Last upstream commit touching that directory: `b1c138230907c63c8f98d1a420d3e53e698eb4b7` (2026-11-04)
- Upstream README preserved at `docs/upstream/TEMPLATE-README.md`; package name changed to `app-ops-cleansea`
- Local changes: `workers/load-context.d.ts` (AppLoadContext typing) and `new Hono<{ Bindings: Env }>()` in `workers/app.ts`, to make `npm run typecheck` pass
- Upstream repo license: see https://github.com/cloudflare/templates/blob/main/LICENSE
- License status: **NOT VERIFIED**; review upstream and dependencies before commercial release
- Checks: `npm ci` PASS (with audit warnings) · `npm run typecheck` PASS · `npm run build` PASS · `npm run dev` PASS (GET / returns 200 with the Hono value rendered)
