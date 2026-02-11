import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../../../.env') });

const frontendPort = process.env.FRONTEND_PORT || '4200';
export const DEFAULT_FRONTEND_URL = process.env.FRONTEND_URL || `http://localhost:${frontendPort}`;

export const FRONTEND_ROUTES = {
  VERIFY_EMAIL: '/verify-email',
  RESET_PASSWORD: '/reset-password',
} as const;

export const ASSETS = {
  LOGO: '/logo.png',
} as const;
