import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssignRoleDto, ListUserQueryDto } from './dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(query: ListUserQueryDto) {
    try {
      return this.prisma.user.findMany({
        where: {
          ...(query.roleId ? { roleId: query.roleId } : {}),
          ...(query.search
            ? {
                OR: [
                  {
                    fullName: {
                      contains: query.search,
                      mode: 'insensitive',
                    },
                  },
                  {
                    email: {
                      contains: query.search,
                      mode: 'insensitive',
                    },
                  },
                ],
              }
            : {}),
        },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
          department: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (err) {
      console.error('AdminService.listUsers error:', err);
      throw err;
    }
  }

  async getUserById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          role: {
            include: { permissions: { include: { permission: true } } },
          },
          department: true,
        },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (err) {
      console.error('AdminService.getUserById error:', err);
      throw err;
    }
  }

  async assignRoleToUser(userId: string, dto: AssignRoleDto) {
    try {
      const [user, role] = await Promise.all([
        this.prisma.user.findUnique({ where: { id: userId } }),
        this.prisma.role.findUnique({ where: { id: dto.roleId } }),
      ]);

      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (!role) {
        throw new NotFoundException('Role not found');
      }

      return this.prisma.user.update({
        where: { id: userId },
        data: { roleId: dto.roleId },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
          department: true,
        },
      });
    } catch (err) {
      console.error('AdminService.assignRoleToUser error:', err);
      throw err;
    }
  }

  async getUserEffectivePermissions(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const permissions = [...new Set(user.role.permissions.map((rp) => rp.permission.name))];
      return {
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role.roleName,
        permissions,
      };
    } catch (err) {
      console.error('AdminService.getUserEffectivePermissions error:', err);
      throw err;
    }
  }

  async getStats() {
    try {
      const [userCount, eventCount, registrationCount, venueCount, categoryCount] =
        await Promise.all([
          this.prisma.user.count(),
          this.prisma.event.count(),
          this.prisma.registration.count(),
          this.prisma.venue.count(),
          this.prisma.category.count(),
        ]);

      return {
        users: userCount,
        events: eventCount,
        registrations: registrationCount,
        venues: venueCount,
        categories: categoryCount,
      };
    } catch (err) {
      console.error('AdminService.getStats error:', err);
      throw err;
    }
  }

  async getRecentRegistrations(limit = 10) {
    try {
      return await this.prisma.registration.findMany({
        take: limit,
        orderBy: { registrationDate: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profileImage: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
            },
          },
          status: true,
        },
      });
    } catch (err) {
      console.error('AdminService.getRecentRegistrations error:', err);
      throw err;
    }
  }
}
