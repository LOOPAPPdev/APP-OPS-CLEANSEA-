// Secrets are not in wrangler.jsonc `vars`; declare them here.
declare namespace Cloudflare {
	interface Env {
		BETTER_AUTH_SECRET: string;
	}
}
