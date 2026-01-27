import {
  Controller,
  Post,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadService } from './upload.service';
import { UploadResponseDto } from './dto';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';
import { UPLOAD_CONSTANTS, UPLOAD_ERROR_MESSAGES } from './upload.constants';

const uploadDir = join(process.cwd(), UPLOAD_CONSTANTS.UPLOAD_DIR, UPLOAD_CONSTANTS.AVATAR_DIR);

@ApiTags('upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Avatar uploaded', type: UploadResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (_req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (UPLOAD_CONSTANTS.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException(UPLOAD_ERROR_MESSAGES.INVALID_FILE_TYPE), false);
        }
      },
      limits: {
        fileSize: UPLOAD_CONSTANTS.MAX_FILE_SIZE,
      },
    }),
  )
  async uploadAvatar(
    @CurrentUser() user: { id: string },
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException(UPLOAD_ERROR_MESSAGES.UPLOAD_FAILED);
    }
    return this.uploadService.uploadAvatar(user.id, file);
  }

  @Delete('avatar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove user avatar' })
  @ApiResponse({ status: 204, description: 'Avatar removed' })
  async removeAvatar(@CurrentUser() user: { id: string }): Promise<void> {
    return this.uploadService.removeAvatar(user.id);
  }
}
