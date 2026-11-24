import { prisma } from '../prisma.js';

interface AuditLogParams {
  actorId?: string | null;
  actorName?: string | null;
  actorRole?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details: Record<string, any> | string;
}

export async function logAudit(params: AuditLogParams) {
  try {
    const detailsStr = typeof params.details === 'string'
      ? params.details
      : JSON.stringify(params.details);

    return await prisma.auditLog.create({
      data: {
        actorId: params.actorId || null,
        actorName: params.actorName || 'System',
        actorRole: params.actorRole || 'SYSTEM',
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        details: detailsStr,
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
