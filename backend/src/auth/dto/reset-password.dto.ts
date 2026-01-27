import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'reset-token-here' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewSecurePass123!', minLength: 8, maxLength: 32 })
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
}
