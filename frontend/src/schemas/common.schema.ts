import { z } from 'zod';

const NAME_MIN_LENGTH = 2;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 32;

export const nameSchema = z
  .string()
  .min(1, 'Nome é obrigatório')
  .min(NAME_MIN_LENGTH, `Nome deve ter pelo menos ${NAME_MIN_LENGTH} caracteres`);

export const emailSchema = z.string().min(1, 'Email é obrigatório').email('Email inválido');

export const phoneSchema = z.string().refine(
  value => {
    if (!value) return true;
    const numbers = value.replace(/\D/g, '');
    return numbers.length === 10 || numbers.length === 11;
  },
  { message: 'Telefone inválido' },
);

export const passwordSchema = z
  .string()
  .min(1, 'Senha é obrigatória')
  .min(PASSWORD_MIN_LENGTH, `Senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres`)
  .max(PASSWORD_MAX_LENGTH, `Senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres`)
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Senha deve conter pelo menos um caractere especial (!@#$%^&*)');

export const currentPasswordSchema = z.string().min(1, 'Senha atual é obrigatória');
