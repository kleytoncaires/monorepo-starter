import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PublicUser } from './types/user.types';
import { AUTH_ERROR_MESSAGES } from '../common/constants';
import {
  PaginationQueryDto,
  PaginatedResponse,
  createPaginationMeta,
} from '../common/dto/pagination.dto';

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  phone: true,
  avatarUrl: true,
  role: true,
  isActive: true,
  createdAt: true,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<PublicUser> {
    return this.prisma.user.create({
      data: createUserDto,
      select: USER_SELECT,
    });
  }

  async findAll(): Promise<PublicUser[]> {
    return this.prisma.user.findMany({
      select: USER_SELECT,
    });
  }

  async findAllPaginated(query: PaginationQueryDto): Promise<PaginatedResponse<PublicUser>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const validSortFields = ['name', 'email', 'createdAt', 'role', 'isActive'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: USER_SELECT,
        skip,
        take: limit,
        orderBy: { [orderByField]: sortOrder },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: createPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException(AUTH_ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<PublicUser> {
    await this.findById(id);

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: USER_SELECT,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.prisma.user.delete({ where: { id } });
  }

  async deleteOwnAccount(userId: string): Promise<void> {
    await this.findById(userId);

    await this.prisma.$transaction([
      this.prisma.notification.deleteMany({ where: { userId } }),
      this.prisma.auditLog.deleteMany({ where: { userId } }),
      this.prisma.refreshToken.deleteMany({ where: { userId } }),
      this.prisma.passwordResetToken.deleteMany({ where: { userId } }),
      this.prisma.emailVerificationToken.deleteMany({ where: { userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
  }

  async exportUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(AUTH_ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const [sessions, auditLogs, notifications] = await Promise.all([
      this.prisma.refreshToken.findMany({
        where: { userId },
        select: {
          id: true,
          deviceName: true,
          ipAddress: true,
          lastUsedAt: true,
          createdAt: true,
        },
      }),
      this.prisma.auditLog.findMany({
        where: { userId },
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          ipAddress: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      this.prisma.notification.findMany({
        where: { userId },
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          read: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      user,
      sessions,
      auditLogs,
      notifications,
    };
  }
}
