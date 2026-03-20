import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard, RolesGuard } from 'src/auth/guard';
import { RoleService } from './role.service';
import { Permissions, Roles } from 'src/auth/decorator';
import { AssignRolePermissionDto, CreateRoleDto, UpdateRoleDto } from './dto/roles.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('Roles')
@ApiBearerAuth('access-token')
@Controller('role')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles('admin')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Permissions('role:create')
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.createRole(dto);
  }

  @Get()
  @Permissions('role:read')
  findAll() {
    return this.roleService.findAllRoles();
  }

  @Get(':id')
  @Permissions('role:read')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.roleService.findRoleById(id);
  }

  @Patch(':id')
  @Permissions('role:update')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.updateRole(id, dto);
  }

  @Put(':id/permissions')
  @Permissions('role:assign-permissions')
  assignPermissions(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AssignRolePermissionDto,
  ) {
    return this.roleService.assignPermissionsToRole(id, dto);
  }

  @Delete(':id')
  @Permissions('role:delete')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.roleService.deleteRole(id);
  }
}
