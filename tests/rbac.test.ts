import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "../workers/app";
import { createAuth, createDb } from "../workers/modules/identity/auth";
import { auditEvent, membership, organization } from "../workers/db/schema";
import { eq } from "drizzle-orm";

const BASE = "http://localhost:5173";
const PASSWORD = "correct-horse-battery-staple";

async function call(path: string, init: RequestInit = {}) {
	return app.fetch(new Request(BASE + path, init), env);
}

/** Creates a user directly (sign-up is disabled over HTTP) and returns a session cookie. */
async function seedUser(email: string) {
	const ctx = await createAuth(env).$context;
	const user = await ctx.internalAdapter.createUser({ email, name: email, emailVerified: true });
	await ctx.internalAdapter.linkAccount({
		userId: user.id,
		providerId: "credential",
		accountId: user.id,
		password: await ctx.password.hash(PASSWORD),
	});
	const res = await call("/api/auth/sign-in/email", {
		method: "POST",
		headers: { "content-type": "application/json", origin: BASE },
		body: JSON.stringify({ email, password: PASSWORD }),
	});
	expect(res.status).toBe(200);
	const cookie = (res.headers.getSetCookie() ?? []).map((c) => c.split(";")[0]).join("; ");
	expect(cookie).not.toBe("");
	return { userId: user.id, cookie };
}

async function seedOrg(name: string, members: Array<[string, "admin" | "viewer" | "member" | "manager"]>) {
	const db = createDb(env);
	const orgId = crypto.randomUUID();
	await db.insert(organization).values({ id: orgId, name });
	for (const [userId, role] of members) {
		await db.insert(membership).values({ id: crypto.randomUUID(), organizationId: orgId, userId, role });
	}
	return orgId;
}

describe("authentication", () => {
	it("GIVEN no session WHEN calling /api/me THEN 401", async () => {
		expect((await call("/api/me")).status).toBe(401);
	});

	it("GIVEN public sign-up disabled WHEN posting sign-up THEN it is rejected", async () => {
		const res = await call("/api/auth/sign-up/email", {
			method: "POST",
			headers: { "content-type": "application/json", origin: BASE },
			body: JSON.stringify({ email: "x@example.test", password: PASSWORD, name: "x" }),
		});
		expect(res.status).toBeGreaterThanOrEqual(400);
		const rows = await createDb(env).query.user.findMany();
		expect(rows.find((u) => u.email === "x@example.test")).toBeUndefined();
	});

	it("GIVEN a wrong password WHEN signing in THEN 401 and no cookie", async () => {
		await seedUser("wrongpw@example.test");
		const res = await call("/api/auth/sign-in/email", {
			method: "POST",
			headers: { "content-type": "application/json", origin: BASE },
			body: JSON.stringify({ email: "wrongpw@example.test", password: "not-the-password-123" }),
		});
		expect(res.status).toBe(401);
		expect(res.headers.getSetCookie().length).toBe(0);
	});

	it("GIVEN a valid session WHEN calling /api/me THEN returns the user id", async () => {
		const { userId, cookie } = await seedUser("me@example.test");
		const res = await call("/api/me", { headers: { cookie } });
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ userId });
	});
});

describe("authorization (RBAC, object level)", () => {
	it("GIVEN a member of org A WHEN requesting org B THEN 403 and an audit record", async () => {
		const a = await seedUser("a@example.test");
		const b = await seedUser("b@example.test");
		const orgA = await seedOrg("A", [[a.userId, "admin"]]);
		const orgB = await seedOrg("B", [[b.userId, "admin"]]);

		const ok = await call(`/api/orgs/${orgA}/whoami`, { headers: { cookie: a.cookie } });
		expect(ok.status).toBe(200);
		expect(await ok.json()).toEqual({ organizationId: orgA, role: "admin" });

		const denied = await call(`/api/orgs/${orgB}/whoami`, { headers: { cookie: a.cookie, "x-correlation-id": "corr-123" } });
		expect(denied.status).toBe(403);
		expect(denied.headers.get("x-correlation-id")).toBe("corr-123");

		const audits = await createDb(env).select().from(auditEvent).where(eq(auditEvent.correlationId, "corr-123"));
		expect(audits).toHaveLength(1);
		expect(audits[0]).toMatchObject({ action: "access.denied", actorUserId: a.userId, targetId: orgB });
		// Org id is not recorded for non-members, so the audit trail cannot leak across tenants.
		expect(audits[0].organizationId).toBeNull();
	});

	it("GIVEN no session WHEN requesting an org route THEN 401 (not 403)", async () => {
		const res = await call(`/api/orgs/${crypto.randomUUID()}/whoami`);
		expect(res.status).toBe(401);
	});
});
