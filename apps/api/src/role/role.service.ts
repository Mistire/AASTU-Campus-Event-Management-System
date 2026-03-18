import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AssignRolePermissionDto,
  CreatePermissionDto,
  CreateRoleDto,
  UpdatePermissionDto,
  UpdateRoleDto,
} from './dto/roles.dto';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly roleInclude = {
    permissions: {
      include: {
        permission: true,
      },
    },
    users: {
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    },
  } as const;

  private readonly permissionInclude = {
    roles: {
      include: {
        role: true,
      },
    },
  } as const;

  private async validatePermissionIds(permissionIds: string[]) {
    const uniqueIds = [...new Set(permissionIds)];

    if (!uniqueIds.length) {
      return [];
    }

    const permissions = await this.prisma.permission.findMany({
      where: { id: { in: uniqueIds } },
    });

    if (permissions.length !== uniqueIds.length) {
      throw new BadRequestException('One or more permissions not found');
    }

    return uniqueIds;
  }

  async createRole(dto: CreateRoleDto) {
    const existingRole = await this.prisma.role.findFirst({
      where: { roleName: { equals: dto.roleName, mode: 'insensitive' } },
    });

    if (existingRole) {
      throw new ConflictException('Role name already exists');
    }

    const permissionIds = await this.validatePermissionIds(dto.permissionIds ?? []);

    const role = await this.prisma.$transaction(async (tx) => {
      const createdRole = await tx.role.create({
        data: {
          roleName: dto.roleName.trim(),
          description: dto.description?.trim(),
        },
      });
      if (permissionIds.length) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId: createdRole.id,
            permissionId,
          })),
        });
      }

      return tx.role.findUnique({
        where: { id: createdRole.id },
        include: this.roleInclude,
      });
    });

    return role;
  }

  async findAllRoles() {
    return this.prisma.role.findMany({
      include: this.roleInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findRoleById(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: this.roleInclude,
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async updateRole(id: string, dto: UpdateRoleDto) {
    const existingRole = await this.prisma.role.findUnique({ where: { id } });

    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }

    if (dto.roleName) {
      const duplicatedRole = await this.prisma.role.findFirst({
        where: {
          id: { not: id },
          roleName: { equals: dto.roleName, mode: 'insensitive' },
        },
      });
      if (duplicatedRole) {
        throw new ConflictException('Role name already exists');
      }
    }

    const permissionIds =
      dto.permissionIds !== undefined
        ? await this.validatePermissionIds(dto.permissionIds)
        : undefined;
    const role = await this.prisma.$transaction(async (tx) => {
      await tx.role.update({
        where: { id },
        data: {
          roleName: dto.roleName?.trim(),
          description: dto.description?.trim(),
        },
      });

      if (permissionIds !== undefined) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        if (permissionIds.length) {
          await tx.rolePermission.createMany({
            data: permissionIds.map((permissionId) => ({ roleId: id, permissionId })),
          });
        }
      }

      return tx.role.findUnique({ where: { id }, include: this.roleInclude });
    });

    return role;
  }

  async assignPermissionsToRole(id: string, dto: AssignRolePermissionDto) {
    const role = await this.prisma.role.findUnique({ where: { id } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permissionIds = await this.validatePermissionIds(dto.permissionIds);

    return this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      if (permissionIds.length) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({ roleId: id, permissionId })),
        });
      }

      return tx.role.findUnique({
        where: { id },
        include: this.roleInclude,
      });
    });
  }

  async deleteRole(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        users: { select: { id: true } },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.users.length) {
      throw new BadRequestException('Cannot delete role assigned to users');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: { roleId: id },
      });

      await tx.role.delete({
        where: { id },
      });
    });

    return { message: 'Role deleted successfully' };
  }

  async createPermission(dto: CreatePermissionDto) {
    const existingPermission = await this.prisma.permission.findFirst({
      where: {
        name: {
          equals: dto.name,
          mode: 'insensitive',
        },
      },
    });

    if (existingPermission) {
      throw new ConflictException('Permission name already exists');
    }

    return this.prisma.permission.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim(),
      },
      include: this.permissionInclude,
    });
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany({
      include: this.permissionInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPermissionById(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: this.permissionInclude,
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async updatePermission(id: string, dto: UpdatePermissionDto) {
    const existingPermission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!existingPermission) {
      throw new NotFoundException('Permission not found');
    }

    if (dto.name) {
      const duplicatePermission = await this.prisma.permission.findFirst({
        where: {
          id: { not: id },
          name: {
            equals: dto.name,
            mode: 'insensitive',
          },
        },
      });

      if (duplicatePermission) {
        throw new ConflictException('Permission already exists');
      }
    }

    return this.prisma.permission.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        description: dto.description?.trim(),
      },
      include: this.permissionInclude,
    });
  }

  async deletePermission(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: {
        roles: {
          select: { id: true },
        },
      },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    if (permission.roles.length) {
      throw new BadRequestException('Cannot delete permission assigned to roles');
    }

    await this.prisma.permission.delete({
      where: { id },
    });

    return { message: 'Permission deleted successfully' };
  }
}

// export const basePermissions = [
//   'role:create',
//   'role:read',
//   'role:update',
//   'role:delete',
//   'role:assign-permissions',
//   'permission:create',
//   'permission:read',
//   'permission:update',
//   'permission:delete',
//   'user:read',
//   'user:assign-role',
// ];
