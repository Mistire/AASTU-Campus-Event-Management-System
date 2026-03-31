import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Permissions, Roles } from 'src/auth/decorator';
import { JwtAuthGuard, PermissionsGuard, RolesGuard } from 'src/auth/guard';
import { CreatePermissionDto, UpdatePermissionDto } from 'src/role/dto/roles.dto';
import { RoleService } from 'src/role/role.service';

@ApiTags('Permissions')
@ApiBearerAuth('access-token')
@Controller('permission')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles('ADMIN')
export class PermissionController {
  constructor(private readonly roleService: RoleService) { }

  @Post()
  @Permissions('permission:create')
  create(@Body() dto: CreatePermissionDto) {
    return this.roleService.createPermission(dto);
  }

  @Get()
  @Permissions('permission:read')
  findAll() {
    return this.roleService.findAllPermissions();
  }

  @Get(':id')
  @Permissions('permission:read')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.roleService.findPermissionById(id);
  }

  @Patch(':id')
  @Permissions('permission:update')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdatePermissionDto) {
    return this.roleService.updatePermission(id, dto);
  }

  @Delete(':id')
  @Permissions('permission:delete')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.roleService.deletePermission(id);
  }
}
