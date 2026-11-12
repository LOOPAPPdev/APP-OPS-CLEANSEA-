import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig(async () => {
	const migrations = await readD1Migrations("./workers/db/migrations");
	return {
		plugins: [
			cloudflareTest({
				wrangler: { configPath: "./wrangler.jsonc" },
				miniflare: {
					bindings: {
						TEST_MIGRATIONS: migrations,
						BETTER_AUTH_SECRET: "test-only-secret-0123456789abcdef0123456789",
					},
				},
			}),
		],
		test: {
			include: ["tests/**/*.test.ts"],
			setupFiles: ["./tests/apply-migrations.ts"],
			// Better Auth leaves a settled-but-unobserved rejection for expected API errors
			// (sign-up disabled, bad password). The HTTP response is still correct and asserted
			// in tests. Ignore ONLY these known Better Auth APIError codes; all others fail the run.
			onUnhandledError(error) {
				const code = (error as { body?: { code?: string } })?.body?.code;
				const expected = ["EMAIL_PASSWORD_SIGN_UP_DISABLED", "INVALID_EMAIL_OR_PASSWORD"];
				if (code && expected.includes(code)) return false;
			},
		},
	};
});
