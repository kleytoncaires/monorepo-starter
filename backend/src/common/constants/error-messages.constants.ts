export const AUTH_ERROR_MESSAGES = {
  EMAIL_ALREADY_REGISTERED: 'Email already registered',
  INVALID_VERIFICATION_TOKEN: 'Invalid or expired verification token',
  INVALID_CREDENTIALS: 'Invalid credentials',
  EMAIL_NOT_VERIFIED: 'Email not verified',
  ACCOUNT_DEACTIVATED: 'Account is deactivated',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  INVALID_RESET_TOKEN: 'Invalid or expired reset token',
  USER_NOT_FOUND: 'User not found',
  CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',
  ACCOUNT_LOCKED:
    'Account temporarily locked due to too many failed attempts. Try again later',
} as const;
