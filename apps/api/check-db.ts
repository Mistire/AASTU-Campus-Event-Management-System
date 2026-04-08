import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const eventCount = await prisma.event.count();
  const events = await prisma.event.findMany({
    include: {
      status: true,
    },
    take: 5,
  });

  console.log('Total Events:', eventCount);
  console.log('Sample Events:', JSON.stringify(events, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
