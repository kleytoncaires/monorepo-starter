import { IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsNotEmpty({ message: 'Senha atual é obrigatória' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: 'New password', minLength: 8, maxLength: 32 })
  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @MaxLength(32, { message: 'Senha deve ter no máximo 32 caracteres' })
  @Matches(/[A-Z]/, { message: 'Senha deve conter pelo menos uma letra maiúscula' })
  @Matches(/[a-z]/, { message: 'Senha deve conter pelo menos uma letra minúscula' })
  @Matches(/[0-9]/, { message: 'Senha deve conter pelo menos um número' })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, {
    message: 'Senha deve conter pelo menos um caractere especial (!@#$%^&*)',
  })
  newPassword: string;
}
