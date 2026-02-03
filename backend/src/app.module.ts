import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './config/prisma.module';
import { AuditModule } from './audit/audit.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadModule } from './upload/upload.module';
import {
  THROTTLE_SHORT_TTL,
  THROTTLE_SHORT_LIMIT,
  THROTTLE_LONG_TTL,
  THROTTLE_LONG_LIMIT,
} from './common/constants/throttle.constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: THROTTLE_SHORT_TTL,
        limit: THROTTLE_SHORT_LIMIT,
      },
      {
        name: 'long',
        ttl: THROTTLE_LONG_TTL,
        limit: THROTTLE_LONG_LIMIT,
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuditModule,
    NotificationsModule,
    AuthModule,
    UsersModule,
    MailModule,
    UploadModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
