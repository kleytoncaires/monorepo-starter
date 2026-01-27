import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { UploadResponseDto } from './dto';
import { UPLOAD_CONSTANTS, UPLOAD_ERROR_MESSAGES } from './upload.constants';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly uploadDir: string;

  constructor(private readonly prisma: PrismaService) {
    this.uploadDir = path.join(
      process.cwd(),
      UPLOAD_CONSTANTS.UPLOAD_DIR,
      UPLOAD_CONSTANTS.AVATAR_DIR,
    );
  }

  async onModuleInit(): Promise<void> {
    await fs.mkdir(this.uploadDir, { recursive: true });
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException(UPLOAD_ERROR_MESSAGES.UPLOAD_FAILED);
    }

    await this.validateImageMagicBytes(file.path);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    if (user?.avatarUrl) {
      await this.deleteFileIfExists(path.join(process.cwd(), user.avatarUrl));
    }

    const url = `/${UPLOAD_CONSTANTS.UPLOAD_DIR}/${UPLOAD_CONSTANTS.AVATAR_DIR}/${file.filename}`;

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: url },
    });

    return {
      filename: file.filename,
      url,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  async removeAvatar(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    if (user?.avatarUrl) {
      await this.deleteFileIfExists(path.join(process.cwd(), user.avatarUrl));

      await this.prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: null },
      });
    }
  }

  private async validateImageMagicBytes(filePath: string): Promise<void> {
    const { fromFile } = await import('file-type');
    const fileType = await fromFile(filePath);

    if (!fileType || !UPLOAD_CONSTANTS.ALLOWED_IMAGE_TYPES.includes(fileType.mime)) {
      await this.deleteFileIfExists(filePath);
      throw new BadRequestException(UPLOAD_ERROR_MESSAGES.INVALID_FILE_TYPE);
    }
  }

  private async deleteFileIfExists(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch {
      // File doesn't exist, ignore
    }
  }
}
