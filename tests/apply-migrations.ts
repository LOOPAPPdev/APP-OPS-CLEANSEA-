import { applyD1Migrations, env } from "cloudflare:test";

// env.TEST_MIGRATIONS is injected by vitest.config.ts (test-only binding).
await applyD1Migrations(env.DB, (env as unknown as { TEST_MIGRATIONS: never[] }).TEST_MIGRATIONS);
