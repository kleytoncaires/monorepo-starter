export const NAME_MIN_LENGTH = 2
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 32

export const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

export const PASSWORD_PATTERNS = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*(),.?":{}|<>]/,
}

export const validatePasswordStrength = (password: string): string | true => {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres`
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres`
  }
  if (!PASSWORD_PATTERNS.uppercase.test(password)) {
    return 'Senha deve conter pelo menos uma letra maiúscula'
  }
  if (!PASSWORD_PATTERNS.lowercase.test(password)) {
    return 'Senha deve conter pelo menos uma letra minúscula'
  }
  if (!PASSWORD_PATTERNS.number.test(password)) {
    return 'Senha deve conter pelo menos um número'
  }
  if (!PASSWORD_PATTERNS.special.test(password)) {
    return 'Senha deve conter pelo menos um caractere especial (!@#$%^&*)'
  }
  return true
}

export const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: 'Email é obrigatório',
  EMAIL_INVALID: 'Email inválido',
  PASSWORD_REQUIRED: 'Senha é obrigatória',
  PASSWORD_MIN: `Senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres`,
  PASSWORD_MAX: `Senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres`,
  PASSWORD_CONFIRM: 'Confirme sua senha',
  PASSWORD_MISMATCH: 'As senhas não coincidem',
  PASSWORD_CURRENT_REQUIRED: 'Senha atual é obrigatória',
  NAME_REQUIRED: 'Nome é obrigatório',
  NAME_MIN: `Nome deve ter pelo menos ${NAME_MIN_LENGTH} caracteres`,
}
