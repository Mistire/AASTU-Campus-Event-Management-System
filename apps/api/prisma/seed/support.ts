/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient, TicketCategory, TicketPriority, TicketStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Support Tickets...');

  const student = await prisma.user.findFirst({
    where: { role: { roleName: 'STUDENT' } },
  });

  const organizer = await prisma.user.findFirst({
    where: { role: { roleName: 'ORGANIZER' } },
  });

  if (student && organizer) {
    const tickets = [
      {
        userId: student.id,
        subject: 'Cannot register for Tech Summit',
        description: 'I keep getting an error saying the event is full, but it shows 10 slots left.',
        category: TicketCategory.TECHNICAL,
        priority: TicketPriority.HIGH,
        status: TicketStatus.OPEN,
      },
      {
        userId: organizer.id,
        subject: 'Venue Booking Request',
        description: 'I need to book the Red Carpet Hall for an emergency club meeting.',
        category: TicketCategory.EVENT_ISSUE,
        priority: TicketPriority.MEDIUM,
        status: TicketStatus.OPEN,
      },
      {
        userId: student.id,
        subject: 'Account Verification Issue',
        description: 'My campus ID was rejected even though I uploaded a clear photo.',
        category: TicketCategory.ACCOUNT,
        priority: TicketPriority.URGENT,
        status: TicketStatus.OPEN,
      },
    ];

    for (const t of tickets) {
      const exists = await prisma.supportTicket.findFirst({
        where: { subject: t.subject, userId: t.userId },
      });

      if (!exists) {
        await prisma.supportTicket.create({ data: t });
      }
    }
    console.log('✅ Support Tickets seeded.');
  } else {
    console.log('⚠️  Student or Organizer user not found. Run script_users first.');
  }

  console.log('\n🎉 Support seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
