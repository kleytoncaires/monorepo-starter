import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { AUTH_ERROR_MESSAGES } from '../common/constants';
import {
  PaginatedResponse,
  PaginationQueryDto,
  createPaginationMeta,
} from '../common/dto/pagination.dto';
import { PrismaService } from '../config/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PublicUser } from './types/user.types';

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  phone: true,
  avatarUrl: true,
  role: true,
  isMaster: true,
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

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<PublicUser> {
    const targetUser = await this.findById(id);
    const isUpdatingSelf = id === currentUserId;
    const isAdmin = currentUserRole === 'ADMIN';

    if (targetUser.isMaster) {
      if (updateUserDto.role !== undefined && updateUserDto.role !== targetUser.role) {
        throw new ForbiddenException('Não é possível alterar a role do usuário master');
      }
      if (updateUserDto.isActive === false) {
        throw new ForbiddenException('Não é possível desativar o usuário master');
      }
    }

    if (!isAdmin) {
      if (!isUpdatingSelf) {
        throw new ForbiddenException('Você só pode editar seu próprio perfil');
      }
      delete updateUserDto.role;
      delete updateUserDto.isActive;
    }

    if (
      isUpdatingSelf &&
      updateUserDto.role !== undefined &&
      updateUserDto.role !== targetUser.role
    ) {
      throw new ForbiddenException('Você não pode alterar sua própria role');
    }

    const roleChanged = updateUserDto.role !== undefined && updateUserDto.role !== targetUser.role;
    const deactivated = updateUserDto.isActive === false && targetUser.isActive === true;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: USER_SELECT,
    });

    if (roleChanged || deactivated) {
      await this.prisma.refreshToken.deleteMany({ where: { userId: id } });
    }

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);

    if (user.isMaster) {
      throw new ForbiddenException('Não é possível excluir o usuário master');
    }

    await this.prisma.user.delete({ where: { id } });
  }

  async transferMaster(currentMasterId: string, newMasterId: string): Promise<PublicUser> {
    const newMaster = await this.findById(newMasterId);

    if (newMaster.role !== 'ADMIN') {
      throw new ForbiddenException('O novo master deve ser um administrador');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: currentMasterId },
        data: { isMaster: false },
      }),
      this.prisma.user.update({
        where: { id: newMasterId },
        data: { isMaster: true },
      }),
    ]);

    return this.findById(newMasterId);
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
