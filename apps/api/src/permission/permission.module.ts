import { Module } from '@nestjs/common';
import { PermissionController } from './permission.controller';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [RoleModule],
  controllers: [PermissionController],
})
export class PermissionModule {}
