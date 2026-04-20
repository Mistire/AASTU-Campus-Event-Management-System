import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany({
    include: { status: true }
  });
  console.log('--- ALL EVENTS IN DB ---');
  events.forEach(e => {
    console.log(`[${e.status.statusName}] ${e.title} | End: ${e.endTime.toISOString()}`);
  });
  
  const now = new Date();
  console.log('--- CURRENT SERVER TIME ---');
  console.log(now.toISOString());
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
