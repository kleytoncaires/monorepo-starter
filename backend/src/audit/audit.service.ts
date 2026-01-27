import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import { PaginatedResponse, createPaginationMeta } from '../common/dto/pagination.dto';
import { AuditAction } from './audit.constants';
import { AuditLogDto, AuditLogQueryDto, CreateAuditLogDto } from './dto';

export { AuditAction };
export type { AuditLogDto as AuditLog, CreateAuditLogDto };

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAuditLogDto): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        metadata: data.metadata as Prisma.InputJsonValue,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async findAll(query: AuditLogQueryDto): Promise<PaginatedResponse<AuditLogDto>> {
    const { page = 1, limit = 10, action, userId, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (action) {
      where.action = action;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: createPaginationMeta(total, page, limit),
    };
  }

  async getActionTypes(): Promise<string[]> {
    return Object.values(AuditAction);
  }
}
