import { Module } from '@nestjs/common';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { AuthModule } from '../auth/auth.module';
import { SupportGateway } from './support.gateway';

@Module({
  imports: [AuthModule],
  controllers: [SupportController],
  providers: [SupportService, SupportGateway],
})
export class SupportModule {}
