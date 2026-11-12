import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

// ---- Better Auth core tables (names/columns follow Better Auth's schema) ----
export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
	image: text("image"),
	createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const session = sqliteTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
		token: text("token").notNull().unique(),
		createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = sqliteTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
		refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
		scope: text("scope"),
		password: text("password"),
		createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
	},
	(t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = sqliteTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp_ms" }),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
});

// ---- Application tables: organization, membership (RBAC), audit ----
export const ROLES = ["admin", "manager", "member", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const organization = sqliteTable("organization", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
});

export const membership = sqliteTable(
	"membership",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		role: text("role", { enum: ROLES }).notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.notNull()
			.default(sql`(unixepoch() * 1000)`),
	},
	(t) => [uniqueIndex("membership_org_user_uq").on(t.organizationId, t.userId)],
);

// Append-only by convention: the application exposes no update/delete path.
export const auditEvent = sqliteTable(
	"audit_event",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id").references(() => organization.id),
		actorUserId: text("actor_user_id"),
		action: text("action").notNull(),
		targetType: text("target_type").notNull(),
		targetId: text("target_id"),
		correlationId: text("correlation_id").notNull(),
		metadata: text("metadata"),
		createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
	},
	(t) => [index("audit_org_idx").on(t.organizationId, t.createdAt)],
);
