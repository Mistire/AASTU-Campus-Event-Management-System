import { Module } from '@nestjs/common';
import { GraduationService } from './graduation.service';
import { GraduationController } from './graduation.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ConfigModule,
    JwtModule.register({}),
    MulterModule.register({ storage: memoryStorage() }),
  ],
  controllers: [GraduationController],
  providers: [GraduationService],
  exports: [GraduationService],
})
export class GraduationModule {}
