import { Prisma } from '@prisma/client';

export interface AuditLogDto {
  id: string;
  userId: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  metadata: Prisma.JsonValue | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}
