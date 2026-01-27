import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ example: 'abc123.jpg' })
  filename: string;

  @ApiProperty({ example: '/uploads/avatars/abc123.jpg' })
  url: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimetype: string;

  @ApiProperty({ example: 102400 })
  size: number;
}
