import { defineConfig } from "drizzle-kit";

// Generates versioned SQL migrations only. Never use `drizzle-kit push` against production.
export default defineConfig({
	dialect: "sqlite",
	schema: "./workers/db/schema.ts",
	out: "./workers/db/migrations",
});
