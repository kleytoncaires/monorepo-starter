import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ example: 'abc123...' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
