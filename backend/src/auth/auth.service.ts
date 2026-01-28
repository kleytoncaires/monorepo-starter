import {
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../config/prisma.service';
import { MailService } from '../mail/mail.service';
import { AuditService, AuditAction } from '../audit/audit.service';
import { NotificationsService, NotificationType } from '../notifications/notifications.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokensDto } from './dto/tokens.dto';
import { AUTH_ERROR_MESSAGES, DEFAULT_FRONTEND_URL, FRONTEND_ROUTES } from '../common/constants';

const SALT_ROUNDS = 10;
const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1;
const EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
const TOKEN_BYTES = 32;
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const REFRESH_TOKEN_REMEMBER_ME_EXPIRY_DAYS = 30;
const DEFAULT_JWT_REFRESH_EXPIRES_IN = '7d' as JwtSignOptions['expiresIn'];
const REMEMBER_ME_JWT_REFRESH_EXPIRES_IN = '30d' as JwtSignOptions['expiresIn'];

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async register(registerDto: RegisterDto): Promise<void> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException(AUTH_ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED);
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, SALT_ROUNDS);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    await this.sendVerificationEmail(user.id, user.email, user.name);
  }

  async verifyEmail(token: string): Promise<void> {
    const verificationToken = await this.prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.INVALID_VERIFICATION_TOKEN);
    }

    await this.prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true },
    });

    await this.prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    await this.auditService.create({
      userId: verificationToken.userId,
      action: AuditAction.EMAIL_VERIFIED,
      entity: 'User',
      entityId: verificationToken.userId,
    });

    await this.notificationsService.create({
      userId: verificationToken.userId,
      type: NotificationType.SUCCESS,
      title: 'Email verificado',
      message: 'Seu email foi verificado com sucesso. Bem-vindo!',
    });
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.emailVerified) {
      return;
    }

    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    await this.sendVerificationEmail(user.id, user.email, user.name);
  }

  private async sendVerificationEmail(userId: string, email: string, name: string): Promise<void> {
    const token = crypto.randomBytes(TOKEN_BYTES).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS);

    await this.prisma.emailVerificationToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', DEFAULT_FRONTEND_URL);
    const verifyLink = `${frontendUrl}${FRONTEND_ROUTES.VERIFY_EMAIL}?token=${token}`;

    this.mailService.sendVerificationEmail(email, name, verifyLink).catch((error: Error) => {
      this.logger.error(`Failed to send verification email to ${email}: ${error.message}`);
    });
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<TokensDto> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.EMAIL_NOT_VERIFIED);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCOUNT_DEACTIVATED);
    }

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      loginDto.rememberMe,
      ipAddress,
      userAgent,
    );

    await this.auditService.create({
      userId: user.id,
      action: AuditAction.LOGIN,
      entity: 'User',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    return tokens;
  }

  async refreshTokens(refreshToken: string): Promise<TokensDto> {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

    return this.generateTokens(storedToken.user.id, storedToken.user.email);
  }

  async logout(refreshToken: string, userId?: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    if (userId) {
      await this.auditService.create({
        userId,
        action: AuditAction.LOGOUT,
        entity: 'User',
        entityId: userId,
      });
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return;
    }

    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    const token = crypto.randomBytes(TOKEN_BYTES).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + PASSWORD_RESET_TOKEN_EXPIRY_HOURS);

    await this.prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', DEFAULT_FRONTEND_URL);
    const resetLink = `${frontendUrl}${FRONTEND_ROUTES.RESET_PASSWORD}?token=${token}`;

    this.mailService
      .sendPasswordResetEmail(user.email, user.name, resetLink)
      .catch((error: Error) => {
        this.logger.error(`Failed to send password reset email to ${user.email}: ${error.message}`);
      });
  }

  async validateResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: { select: { email: true } } },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return { valid: false };
    }

    const email = this.maskEmail(resetToken.user.email);
    return { valid: true, email };
  }

  async validateVerificationToken(token: string): Promise<{ valid: boolean; email?: string }> {
    const verificationToken = await this.prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: { select: { email: true } } },
    });

    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      return { valid: false };
    }

    const email = this.maskEmail(verificationToken.user.email);
    return { valid: true, email };
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    const maskedLocal =
      local.length > 2
        ? `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`
        : local[0] + '*';
    return `${maskedLocal}@${domain}`;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.INVALID_RESET_TOKEN);
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    await this.prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    await this.auditService.create({
      userId: resetToken.userId,
      action: AuditAction.PASSWORD_RESET,
      entity: 'User',
      entityId: resetToken.userId,
    });

    await this.notificationsService.create({
      userId: resetToken.userId,
      type: NotificationType.WARNING,
      title: 'Senha alterada',
      message:
        'Sua senha foi redefinida com sucesso. Se você não fez isso, entre em contato conosco.',
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(AUTH_ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT);
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await this.auditService.create({
      userId,
      action: AuditAction.PASSWORD_CHANGE,
      entity: 'User',
      entityId: userId,
    });

    await this.notificationsService.create({
      userId,
      type: NotificationType.INFO,
      title: 'Senha alterada',
      message: 'Sua senha foi alterada com sucesso.',
    });
  }

  async getSessions(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        deviceName: true,
        ipAddress: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { lastUsedAt: 'desc' },
    });
  }

  async revokeSession(
    userId: string,
    sessionId: string,
    currentRefreshToken?: string,
  ): Promise<void> {
    const session = await this.prisma.refreshToken.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Sessão não encontrada');
    }

    if (currentRefreshToken && session.token === currentRefreshToken) {
      throw new UnauthorizedException('Você não pode revogar a sessão atual');
    }

    await this.prisma.refreshToken.delete({ where: { id: sessionId } });

    await this.auditService.create({
      userId,
      action: AuditAction.SESSION_REVOKE,
      entity: 'RefreshToken',
      entityId: sessionId,
      metadata: { deviceName: session.deviceName, ipAddress: session.ipAddress },
    });
  }

  async revokeAllSessions(userId: string, currentRefreshToken: string): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: { not: currentRefreshToken },
      },
    });

    if (result.count > 0) {
      await this.auditService.create({
        userId,
        action: AuditAction.SESSION_REVOKE,
        entity: 'RefreshToken',
        metadata: { count: result.count, revokedAll: true },
      });
    }

    return result.count;
  }

  async isSessionValid(refreshToken: string): Promise<boolean> {
    const session = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      select: { expiresAt: true },
    });

    if (!session) return false;
    return session.expiresAt > new Date();
  }

  private async generateTokens(
    userId: string,
    email: string,
    rememberMe?: boolean,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokensDto> {
    const payload = { sub: userId, email };

    const expiryDays = rememberMe
      ? REFRESH_TOKEN_REMEMBER_ME_EXPIRY_DAYS
      : REFRESH_TOKEN_EXPIRY_DAYS;
    const jwtExpiresIn = rememberMe
      ? REMEMBER_ME_JWT_REFRESH_EXPIRES_IN
      : DEFAULT_JWT_REFRESH_EXPIRES_IN;

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ||
        jwtExpiresIn) as JwtSignOptions['expiresIn'],
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const deviceName = this.parseUserAgent(userAgent);

    if (ipAddress && userAgent) {
      await this.prisma.refreshToken.deleteMany({
        where: { userId, ipAddress, userAgent },
      });
    }

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
        ipAddress,
        userAgent,
        deviceName,
      },
    });

    return { accessToken, refreshToken };
  }

  private parseUserAgent(userAgent?: string): string {
    if (!userAgent) return 'Dispositivo desconhecido';

    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('iPad')) return 'iPad';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux';

    return 'Navegador Web';
  }
}
