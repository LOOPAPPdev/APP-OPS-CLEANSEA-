import { auditEvent } from "../../db/schema";
import { createDb } from "../identity/auth";

export interface AuditInput {
	organizationId?: string | null;
	actorUserId?: string | null;
	action: string;
	targetType: string;
	targetId?: string | null;
	correlationId: string;
	metadata?: Record<string, unknown>;
}

/** Append-only audit write. Call inside the same request that changes state. */
export async function writeAudit(env: Env, input: AuditInput) {
	const db = createDb(env);
	await db.insert(auditEvent).values({
		id: crypto.randomUUID(),
		organizationId: input.organizationId ?? null,
		actorUserId: input.actorUserId ?? null,
		action: input.action,
		targetType: input.targetType,
		targetId: input.targetId ?? null,
		correlationId: input.correlationId,
		metadata: input.metadata ? JSON.stringify(input.metadata) : null,
		createdAt: new Date(),
	});
}
