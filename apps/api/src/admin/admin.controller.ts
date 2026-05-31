import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permissions, Roles } from 'src/auth/decorator';
import { JwtAuthGuard, PermissionsGuard, RolesGuard } from 'src/auth/guard';
import { AdminService } from './admin.service';
import { AssignRoleDto, ListUserQueryDto } from './dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles('Admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @Permissions('user:read')
  listUsers(@Query() query: ListUserQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Get('users/:id')
  @Permissions('user:read')
  getUser(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:userId/role')
  @Permissions('user:assign-role')
  assignRole(@Param('userId', new ParseUUIDPipe()) userId: string, @Body() dto: AssignRoleDto) {
    return this.adminService.assignRoleToUser(userId, dto);
  }

  @Get('users/:id/effective-permissions')
  @Permissions('user:read')
  getEffectivePermissions(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.adminService.getUserEffectivePermissions(id);
  }

  @Get('stats')
  @Permissions('user:read')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('registrations/recent')
  @Permissions('user:read')
  getRecentRegistrations() {
    return this.adminService.getRecentRegistrations();
  }
}
