/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Roles and Permissions...');

  // 1. Create permissions in the same format used by @Permissions('resource:action')
  const permissions = [
    { name: 'user:read', description: 'Can read platform users' },
    { name: 'user:assign-role', description: 'Can assign roles to users' },
    { name: 'role:create', description: 'Can create roles' },
    { name: 'role:read', description: 'Can read roles' },
    { name: 'role:update', description: 'Can update roles' },
    { name: 'role:delete', description: 'Can delete roles' },
    { name: 'role:assign-permissions', description: 'Can assign permissions to roles' },
    { name: 'permission:create', description: 'Can create permissions' },
    { name: 'permission:read', description: 'Can read permissions' },
    { name: 'permission:update', description: 'Can update permissions' },
    { name: 'permission:delete', description: 'Can delete permissions' },
    { name: 'event:create', description: 'Can create events' },
    { name: 'event:read', description: 'Can read events' },
    { name: 'event:update', description: 'Can update events' },
    { name: 'event:delete', description: 'Can delete events' },
    { name: 'event:approve', description: 'Can approve or reject events' },
    { name: 'event:register', description: 'Can register for events' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }
  console.log('Permissions seeded.');

  // Fetch all permissions to link them
  const allPerms = await prisma.permission.findMany();

  // 2. Create Roles
  const roles = [
    {
      roleName: 'ADMIN',
      description: 'System Administrator',
      perms: allPerms.map((p) => p.name), // All permissions
    },
    {
      roleName: 'ORGANIZER',
      description: 'Event Organizer',
      perms: ['event:create', 'event:read', 'event:update', 'event:register'],
    },
    {
      roleName: 'STUDENT',
      description: 'Standard Student Participant',
      perms: ['event:read', 'event:register'],
    },
  ];

  for (const r of roles) {
    const roleRecord = await prisma.role.upsert({
      where: { roleName: r.roleName },
      update: {},
      create: {
        roleName: r.roleName,
        description: r.description,
      },
    });

    // Link permissions to role
    for (const pName of r.perms) {
      const permRecord = allPerms.find((p) => p.name === pName);
      if (permRecord) {
        // Find existing to avoid unique constraint error
        const existingRp = await prisma.rolePermission.findFirst({
          where: { roleId: roleRecord.id, permissionId: permRecord.id },
        });

        if (!existingRp) {
          await prisma.rolePermission.create({
            data: {
              roleId: roleRecord.id,
              permissionId: permRecord.id,
            },
          });
        }
      }
    }
  }

  console.log('Roles and RolePermissions seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
