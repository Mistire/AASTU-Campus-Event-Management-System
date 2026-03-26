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
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

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

  @Permissions('VIEW_EVENTS')
  getEffectivePermissions(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.adminService.getUserEffectivePermissions(id);
  }

  @Get('stats')
  @Permissions('VIEW_EVENTS') // Using VIEW_EVENTS temporarily as it is seeded
  getStats() {
    return this.adminService.getDashboardStats();
  }
}
