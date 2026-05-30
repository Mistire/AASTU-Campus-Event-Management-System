import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { randomUUID } from 'crypto';

export class UserFactory {
  constructor(private readonly prisma: PrismaService) {}

  async create(overrides?: any) {
    const defaultRoleId = overrides?.roleId || (await this.getOrCreateRole('Student')).id;
    const passwordHash = overrides?.passwordHash || (await argon.hash('Password123!'));
    
    const uniqueSuffix = randomUUID().split('-')[0];
    
    return this.prisma.user.create({
      data: {
        fullName: overrides?.fullName || `Test User ${uniqueSuffix}`,
        email: overrides?.email || `user${uniqueSuffix}@example.com`,
        passwordHash,
        roleId: defaultRoleId,
        isEmailVerified: overrides?.isEmailVerified ?? true,
        phone: overrides?.phone || '+1234567890',
        ...overrides,
      },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });
  }

  async createMany(count: number, overrides?: any) {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push(await this.create(overrides));
    }
    return users;
  }

  private async getOrCreateRole(roleName: string) {
    let role = await this.prisma.role.findUnique({ where: { roleName } });
    if (!role) {
      role = await this.prisma.role.create({
        data: { roleName, description: 'Created by UserFactory' },
      });
    }
    return role;
  }
}
