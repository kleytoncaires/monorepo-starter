import { Role } from '@/constants/roles.constants';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string | null;
  role: Role;
  isMaster: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
