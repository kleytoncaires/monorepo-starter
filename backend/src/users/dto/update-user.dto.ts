import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
  Matches,
  IsEnum,
} from 'class-validator';
import { Role } from '@prisma/client';

const PHONE_PATTERN = /^\(\d{2}\) \d{4,5}-\d{4}$/;

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiProperty({ example: '(11) 99999-9999', required: false })
  @IsString()
  @Matches(PHONE_PATTERN, { message: 'Telefone deve estar no formato (XX) XXXXX-XXXX' })
  @IsOptional()
  phone?: string | null;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ enum: Role, required: false })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
