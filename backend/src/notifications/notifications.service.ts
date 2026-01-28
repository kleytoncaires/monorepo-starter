import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import {
  PaginationQueryDto,
  PaginatedResponse,
  createPaginationMeta,
} from '../common/dto/pagination.dto';
import { NotificationType } from './notifications.constants';
import { NotificationDto, CreateNotificationDto } from './dto';

export { NotificationType };
export type { NotificationDto as Notification, CreateNotificationDto };

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateNotificationDto): Promise<NotificationDto> {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
      },
    });
  }

  async findAllForUser(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<NotificationDto>> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = { userId };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: notifications,
      meta: createPaginationMeta(total, page, limit),
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async markAsRead(userId: string, notificationId: string): Promise<NotificationDto> {
    return this.prisma.notification.update({
      where: { id: notificationId, userId },
      data: { read: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
    return result.count;
  }

  async delete(userId: string, notificationId: string): Promise<void> {
    await this.prisma.notification.delete({
      where: { id: notificationId, userId },
    });
  }

  async deleteAllRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.deleteMany({
      where: { userId, read: true },
    });
    return result.count;
  }
}
