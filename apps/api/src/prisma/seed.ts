import * as dotenv from 'dotenv';
import * as path from 'path';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon from 'argon2';
import { Pool } from 'pg';
import { PrismaClient } from 'src/generated/prisma/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const permissions = [
  'role:create',
  'role:read',
  'role:update',
  'role:assign-permissions',
  'role:delete',
  'permission:create',
  'permission:read',
  'permission:update',
  'permission:delete',
  'user:read',
  'user:assign-role',
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to run seed');
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const roleStudent = await prisma.role.upsert({
      where: { roleName: 'student' },
      create: {
        roleName: 'student',
        description: 'Default role for regular users',
      },
      update: {
        description: 'Default role for regular users',
      },
    });

    const roleAdmin = await prisma.role.upsert({
      where: { roleName: 'admin' },
      create: {
        roleName: 'admin',
        description: 'System administrator role',
      },
      update: {
        description: 'System administrator role',
      },
    });

    const permissionRecords = await Promise.all(
      permissions.map((name) =>
        prisma.permission.upsert({
          where: { name },
          create: { name, description: `Allows ${name}` },
          update: { description: `Allows ${name}` },
        }),
      ),
    );

    await prisma.rolePermission.deleteMany({
      where: { roleId: roleAdmin.id },
    });

    await prisma.rolePermission.createMany({
      data: permissionRecords.map((permission) => ({
        roleId: roleAdmin.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });

    const superEmail = process.env.SEED_SUPERUSER_EMAIL ?? 'admin@aastu.edu.et';
    const superPassword = process.env.SEED_SUPERUSER_PASSWORD ?? 'Admin123!';
    const superFullName = process.env.SEED_SUPERUSER_FULL_NAME ?? 'System Administrator';

    const passwordHash = await argon.hash(superPassword);

    await prisma.user.upsert({
      where: { email: superEmail },
      create: {
        fullName: superFullName,
        email: superEmail,
        passwordHash,
        roleId: roleAdmin.id,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
      update: {
        fullName: superFullName,
        passwordHash,
        roleId: roleAdmin.id,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    console.log('Seed complete');
    console.log(`Student role id: ${roleStudent.id}`);
    console.log(`Admin role id: ${roleAdmin.id}`);
    console.log(`Super user: ${superEmail}`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
