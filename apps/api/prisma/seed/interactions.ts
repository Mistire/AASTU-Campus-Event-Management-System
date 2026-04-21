import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Interaction Data (Registrations & Feedback)...');

  const users = await prisma.user.findMany({ take: 20 });
  const events = await prisma.event.findMany({ take: 10 });
  const regStatus = await prisma.registrationStatus.findFirst({ where: { name: 'APPROVED' } });

  if (users.length === 0 || events.length === 0 || !regStatus) {
    console.log('Missing users, events, or registration status. Seed those first.');
    return;
  }

  for (const user of users) {
    // Each user registers for 2-5 random events
    const numRegs = Math.floor(Math.random() * 4) + 2;
    const selectedEvents = [...events].sort(() => 0.5 - Math.random()).slice(0, numRegs);

    for (const event of selectedEvents) {
      // Check if registration already exists
      const existingReg = await prisma.registration.findFirst({
        where: { userId: user.id, eventId: event.id }
      });

      if (!existingReg) {
        const reg = await prisma.registration.create({
          data: {
            userId: user.id,
            eventId: event.id,
            statusId: regStatus.id,
            registrationDate: new Date(),
          },
        });

        // 70% chance to leave feedback
        if (Math.random() > 0.3) {
          const existingFeedback = await prisma.feedback.findFirst({
            where: { userId: user.id, eventId: event.id }
          });

          if (!existingFeedback) {
            await prisma.feedback.create({
              data: {
                userId: user.id,
                eventId: event.id,
                rating: Math.floor(Math.random() * 3) + 3, // 3-5 rating
                comment: 'Great event!',
              },
            });
          }
        }
      }
    }
  }

  console.log('✅ Interaction data seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
