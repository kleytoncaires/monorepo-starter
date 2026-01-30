import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Get,
  Delete,
  Param,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokensDto } from './dto/tokens.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, RealIp } from '../common/decorators';
import {
  THROTTLE_AUTH_TTL,
  THROTTLE_AUTH_REGISTER_LIMIT,
  THROTTLE_AUTH_LOGIN_LIMIT,
  THROTTLE_AUTH_FORGOT_PASSWORD_LIMIT,
  THROTTLE_AUTH_VALIDATE_TOKEN_LIMIT,
} from '../common/constants/throttle.constants';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ short: { limit: THROTTLE_AUTH_REGISTER_LIMIT, ttl: THROTTLE_AUTH_TTL } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 204, description: 'User registered, verification email sent' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async register(@Body() registerDto: RegisterDto): Promise<void> {
    await this.authService.register(registerDto);
  }

  @Post('verify-email')
  @Throttle({ short: { limit: THROTTLE_AUTH_FORGOT_PASSWORD_LIMIT, ttl: THROTTLE_AUTH_TTL } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiResponse({ status: 204, description: 'Email verified successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<void> {
    await this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Post('resend-verification')
  @Throttle({ short: { limit: THROTTLE_AUTH_FORGOT_PASSWORD_LIMIT, ttl: THROTTLE_AUTH_TTL } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 204, description: 'Verification email sent if account exists' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async resendVerification(@Body() resendDto: ResendVerificationDto): Promise<void> {
    await this.authService.resendVerificationEmail(resendDto.email);
  }

  @Post('login')
  @Throttle({ short: { limit: THROTTLE_AUTH_LOGIN_LIMIT, ttl: THROTTLE_AUTH_TTL } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful', type: TokensDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials or email not verified' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async login(
    @Body() loginDto: LoginDto,
    @RealIp() ip: string,
    @Req() req: Request,
  ): Promise<TokensDto> {
    const userAgent = req.headers['user-agent'];
    return this.authService.login(loginDto, ip, userAgent);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed', type: TokensDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokensDto> {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 204, description: 'Logged out successfully' })
  async logout(
    @Body() refreshTokenDto: RefreshTokenDto,
    @CurrentUser() user: { id: string },
  ): Promise<void> {
    await this.authService.logout(refreshTokenDto.refreshToken, user.id);
  }

  @Post('forgot-password')
  @Throttle({ short: { limit: THROTTLE_AUTH_FORGOT_PASSWORD_LIMIT, ttl: THROTTLE_AUTH_TTL } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 204, description: 'Reset email sent if account exists' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    await this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Get('validate-reset-token/:token')
  @Throttle({ short: { limit: THROTTLE_AUTH_VALIDATE_TOKEN_LIMIT, ttl: THROTTLE_AUTH_TTL } })
  @ApiOperation({ summary: 'Validate password reset token' })
  @ApiResponse({ status: 200, description: 'Token validation result' })
  async validateResetToken(@Param('token') token: string) {
    return this.authService.validateResetToken(token);
  }

  @Get('validate-verification-token/:token')
  @Throttle({ short: { limit: THROTTLE_AUTH_VALIDATE_TOKEN_LIMIT, ttl: THROTTLE_AUTH_TTL } })
  @ApiOperation({ summary: 'Validate email verification token' })
  @ApiResponse({ status: 200, description: 'Token validation result' })
  async validateVerificationToken(@Param('token') token: string) {
    return this.authService.validateVerificationToken(token);
  }

  @Post('reset-password')
  @Throttle({ short: { limit: THROTTLE_AUTH_FORGOT_PASSWORD_LIMIT, ttl: THROTTLE_AUTH_TTL } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 204, description: 'Password reset successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change password for authenticated user' })
  @ApiResponse({ status: 204, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  async changePassword(
    @CurrentUser() user: { id: string },
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    await this.authService.changePassword(
      user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
      changePasswordDto.refreshToken,
    );
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active sessions for current user' })
  @ApiResponse({ status: 200, description: 'List of active sessions' })
  async getSessions(@CurrentUser() user: { id: string }) {
    return this.authService.getSessions(user.id);
  }

  @Post('sessions/check')
  @ApiOperation({ summary: 'Check if refresh token is still valid' })
  @ApiResponse({ status: 200, description: 'Session validity status' })
  async checkSession(@Body() body: RefreshTokenDto): Promise<{ valid: boolean }> {
    const valid = await this.authService.isSessionValid(body.refreshToken);
    return { valid };
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiResponse({ status: 204, description: 'Session revoked' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async revokeSession(
    @CurrentUser() user: { id: string },
    @Param('id') sessionId: string,
  ): Promise<void> {
    await this.authService.revokeSession(user.id, sessionId);
  }

  @Delete('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all sessions except current' })
  @ApiResponse({ status: 200, description: 'Sessions revoked' })
  async revokeAllSessions(
    @CurrentUser() user: { id: string },
    @Body() body: RefreshTokenDto,
  ): Promise<{ count: number }> {
    const count = await this.authService.revokeAllSessions(user.id, body.refreshToken);
    return { count };
  }
}
