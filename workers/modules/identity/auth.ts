import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../db/schema";

export function createDb(env: Env) {
	return drizzle(env.DB, { schema });
}

/** Builds a Better Auth instance for this request. Public sign-up is disabled (invite-only). */
export function createAuth(env: Env) {
	return betterAuth({
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		database: drizzleAdapter(createDb(env), { provider: "sqlite", schema }),
		emailAndPassword: {
			enabled: true,
			disableSignUp: true,
			minPasswordLength: 12,
		},
		session: { expiresIn: 60 * 60 * 8 },
		advanced: { useSecureCookies: env.BETTER_AUTH_URL.startsWith("https://") },
	});
}

export type Auth = ReturnType<typeof createAuth>;
