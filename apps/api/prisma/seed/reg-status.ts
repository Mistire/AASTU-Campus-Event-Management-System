import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Registration Statuses...');

  const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

  for (const name of statuses) {
    const exists = await prisma.registrationStatus.findFirst({ where: { name } });
    if (!exists) {
      await prisma.registrationStatus.create({ data: { name } });
    }
  }

  console.log('✅ Registration statuses seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
