import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../config/prisma.service';
import { MailService } from '../mail/mail.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Role } from '@prisma/client';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let prismaService: {
    refreshToken: {
      create: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
    };
    passwordResetToken: {
      create: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
    };
    emailVerificationToken: {
      create: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
    };
    user: {
      update: jest.Mock;
    };
  };
  let mailService: jest.Mocked<MailService>;

  const mockUser = {
    id: 'user-id-123',
    email: 'test@example.com',
    password: 'hashed-password',
    name: 'Test User',
    phone: null,
    avatarUrl: null,
    role: Role.USER,
    isActive: true,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('7d'),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            refreshToken: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
            },
            passwordResetToken: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
            },
            emailVerificationToken: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
            },
            user: {
              update: jest.fn(),
            },
          },
        },
        {
          provide: MailService,
          useValue: {
            sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
            sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
            sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: AuditService,
          useValue: {
            create: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            create: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    prismaService = module.get(PrismaService);
    mailService = module.get(MailService);
  });

  describe('register', () => {
    it('should register a new user and send verification email', async () => {
      const createdUser = {
        id: 'user-id-123',
        email: 'test@example.com',
        name: 'Test User',
        phone: null,
        avatarUrl: null,
        role: Role.USER,
        isActive: true,
        createdAt: new Date(),
      };
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(createdUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      prismaService.emailVerificationToken.create.mockResolvedValue({});

      await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(usersService.create).toHaveBeenCalled();
      expect(mailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
      prismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'wrong@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for deactivated account', async () => {
      usersService.findByEmail.mockResolvedValue({ ...mockUser, isActive: false });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens for valid refresh token', async () => {
      const storedToken = {
        id: 'token-id',
        token: 'valid-refresh-token',
        userId: 'user-id-123',
        expiresAt: new Date(Date.now() + 86400000),
        createdAt: new Date(),
        user: mockUser,
      };
      prismaService.refreshToken.findUnique.mockResolvedValue(storedToken);
      prismaService.refreshToken.delete.mockResolvedValue({});
      jwtService.sign.mockReturnValueOnce('new-access-token').mockReturnValueOnce('new-refresh-token');
      prismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.refreshTokens('valid-refresh-token');

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const storedToken = {
        id: 'token-id',
        token: 'expired-refresh-token',
        userId: 'user-id-123',
        expiresAt: new Date(Date.now() - 86400000),
        createdAt: new Date(),
        user: mockUser,
      };
      prismaService.refreshToken.findUnique.mockResolvedValue(storedToken);

      await expect(service.refreshTokens('expired-refresh-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should delete refresh token', async () => {
      prismaService.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      await service.logout('refresh-token');

      expect(prismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: 'refresh-token' },
      });
    });
  });
});
