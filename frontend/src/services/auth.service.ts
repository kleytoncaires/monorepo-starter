import api from '@/services/api';
import { LoginCredentials, RegisterCredentials, AuthTokens, User } from '@/types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await api.post<AuthTokens>('/auth/login', credentials);
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<void> {
    await api.post('/auth/register', credentials);
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  },

  async resendVerificationEmail(email: string): Promise<void> {
    await api.post('/auth/resend-verification', { email });
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken });
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  saveTokens(tokens: AuthTokens): void {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  },

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  },

  async validateResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
    const response = await api.get<{ valid: boolean; email?: string }>(`/auth/validate-reset-token/${token}`);
    return response.data;
  },

  async validateVerificationToken(token: string): Promise<{ valid: boolean; email?: string }> {
    const response = await api.get<{ valid: boolean; email?: string }>(`/auth/validate-verification-token/${token}`);
    return response.data;
  },
};
