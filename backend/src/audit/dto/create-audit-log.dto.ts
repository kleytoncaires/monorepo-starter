import { AuditAction } from '../audit.constants';

export interface CreateAuditLogDto {
  userId?: string;
  action: AuditAction | string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}
