/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Users...');

  // Get roles
  const adminRole = await prisma.role.findUnique({ where: { roleName: 'ADMIN' } });
  const studentRole = await prisma.role.findUnique({ where: { roleName: 'STUDENT' } });
  const organizerRole = await prisma.role.findUnique({ where: { roleName: 'ORGANIZER' } });

  if (!adminRole || !studentRole || !organizerRole) {
    throw new Error('Roles not found. Please run `npm run script_roles` first.');
  }

  // Create a Department for users
  const dept = await prisma.department.create({
    data: {
      name: 'Software Engineering',
      faculty: 'College of Computing',
    },
  });

  const passwordHash = await argon2.hash('Password123!', {
    type: argon2.argon2id,
  });

  const users = [
    {
      email: 'admin@aastu.edu.et',
      fullName: 'System Admin',
      passwordHash,
      roleId: adminRole.id,
      departmentId: dept.id,
      phone: '+251900000001',
    },
    {
      email: 'student@aastu.edu.et',
      fullName: 'John Doe',
      passwordHash,
      roleId: studentRole.id,
      departmentId: dept.id,
      phone: '+251900000002',
    },
    {
      email: 'organizer@aastu.edu.et',
      fullName: 'Jane Smith',
      passwordHash,
      roleId: organizerRole.id,
      departmentId: dept.id,
      phone: '+251900000003',
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
  }

  console.log('Users seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
