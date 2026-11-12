import { and, eq } from "drizzle-orm";
import type { MiddlewareHandler } from "hono";
import { membership, type Role } from "../../db/schema";
import { writeAudit } from "../audit/audit";
import { createAuth, createDb } from "./auth";

export type AppVariables = {
	userId: string;
	correlationId: string;
	organizationId: string;
	role: Role;
};
export type AppEnv = { Bindings: Env; Variables: Partial<AppVariables> };

// Higher number = more privilege.
const RANK: Record<Role, number> = { viewer: 0, member: 1, manager: 2, admin: 3 };
export const hasRole = (actual: Role, required: Role) => RANK[actual] >= RANK[required];

/** Attaches a correlation id to every request (reused for audit records). */
export const correlation: MiddlewareHandler<AppEnv> = async (c, next) => {
	const id = c.req.header("x-correlation-id") ?? crypto.randomUUID();
	c.set("correlationId", id);
	c.header("x-correlation-id", id);
	await next();
};

/** 401 unless a valid server-side session exists. */
export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
	const session = await createAuth(c.env).api.getSession({ headers: c.req.raw.headers });
	if (!session) return c.json({ error: "unauthenticated" }, 401);
	c.set("userId", session.user.id);
	await next();
};

/**
 * 403 unless the user belongs to the organization named in `:orgId` with at least `required` role.
 * Authentication is NOT authorization: membership is looked up in the database on every call.
 */
export const requireOrgRole =
	(required: Role): MiddlewareHandler<AppEnv> =>
	async (c, next) => {
		const orgId = c.req.param("orgId");
		const userId = c.get("userId");
		if (!orgId || !userId) return c.json({ error: "unauthenticated" }, 401);
		const rows = await createDb(c.env)
			.select({ role: membership.role })
			.from(membership)
			.where(and(eq(membership.organizationId, orgId), eq(membership.userId, userId)))
			.limit(1);
		const role = rows[0]?.role;
		if (!role || !hasRole(role, required)) {
			await writeAudit(c.env, {
				organizationId: role ? orgId : null,
				actorUserId: userId,
				action: "access.denied",
				targetType: "organization",
				targetId: orgId,
				correlationId: c.get("correlationId") ?? "n/a",
				metadata: { required },
			});
			return c.json({ error: "forbidden" }, 403);
		}
		c.set("organizationId", orgId);
		c.set("role", role);
		await next();
	};
