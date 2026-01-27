import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8, maxLength: 32 })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @MaxLength(32, { message: 'Senha deve ter no máximo 32 caracteres' })
  @Matches(/[A-Z]/, { message: 'Senha deve conter pelo menos uma letra maiúscula' })
  @Matches(/[a-z]/, { message: 'Senha deve conter pelo menos uma letra minúscula' })
  @Matches(/[0-9]/, { message: 'Senha deve conter pelo menos um número' })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, {
    message: 'Senha deve conter pelo menos um caractere especial (!@#$%^&*)',
  })
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name: string;
}
