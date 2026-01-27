import type { PaginationParams } from './api';

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface AuditLogParams extends PaginationParams {
  action?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}
