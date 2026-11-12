import { Hono } from "hono";
import { createRequestHandler } from "react-router";
import { createAuth } from "./modules/identity/auth";
import { type AppEnv, correlation, requireAuth, requireOrgRole } from "./modules/identity/rbac";

const app = new Hono<AppEnv>();

app.use("/api/*", correlation);

// Better Auth endpoints (sign-in, sign-out, session). Sign-up is disabled.
app.on(["GET", "POST"], "/api/auth/*", (c) => createAuth(c.env).handler(c.req.raw));

app.get("/api/me", requireAuth, (c) => c.json({ userId: c.get("userId") }));

// Example RBAC-protected route; replaced by real domain routes in phase E.
app.get("/api/orgs/:orgId/whoami", requireAuth, requireOrgRole("viewer"), (c) =>
	c.json({ organizationId: c.get("organizationId"), role: c.get("role") }),
);

app.all("/api/*", (c) => c.json({ error: "not_found" }, 404));

app.get("*", (c) => {
	const requestHandler = createRequestHandler(
		() => import("virtual:react-router/server-build"),
		import.meta.env.MODE,
	);

	return requestHandler(c.req.raw, {
		cloudflare: { env: c.env, ctx: c.executionCtx },
	});
});

export default app;
