import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding Events...');

    // 1. Create Categories
    const categories = [
        { name: 'Technology', description: 'Events related to Software, AI, and Engineering' },
        { name: 'Sports', description: 'Campus sports tournaments and athletics' },
        { name: 'Seminar', description: 'Academic talks and guest lectures' },
        { name: 'Workshop', description: 'Hands-on learning sessions' },
        { name: 'Arts & Culture', description: 'Music, drama, and cultural exhibitions' },
        { name: 'Career', description: 'Job fairs and professional development' },
        { name: 'Health & Wellness', description: 'Fitness and mental health sessions' },
        { name: 'Community', description: 'Social gatherings and networking' },
    ];

    for (const cat of categories) {
        const existing = await prisma.category.findFirst({ where: { name: cat.name } });
        if (!existing) {
            await prisma.category.create({ data: cat });
            console.log(`Category "${cat.name}" created.`);
        } else {
            console.log(`Category "${cat.name}" already exists.`);
        }
    }

    const techCategory = await prisma.category.findFirst({ where: { name: 'Technology' } });

    // 2. Create Event Statuses
    const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
    for (const statusName of statuses) {
        await prisma.eventStatus.create({
            data: { statusName, description: `${statusName} status for events` },
        });
    }

    const approvedStatus = await prisma.eventStatus.findFirst({ where: { statusName: 'APPROVED' } });

    // 3. Create Venues
    const venues = [
        { name: 'Red Carpet Hall', building: 'Block 40', capacity: 500 },
        { name: 'ICT Lab 1', building: 'Block 55', capacity: 50 },
    ];

    for (const v of venues) {
        await prisma.venue.create({ data: v });
    }

    const hallVenue = await prisma.venue.findFirst({ where: { name: 'Red Carpet Hall' } });

    // 4. Create an Event
    if (techCategory && approvedStatus && hallVenue) {
        // Check if event exists
        const existingEvent = await prisma.event.findFirst({ where: { title: 'Annual Tech Summit 2026' } });

        if (!existingEvent) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            const dayAfterTomorrow = new Date();
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

            await prisma.event.create({
                data: {
                    title: 'Annual Tech Summit 2026',
                    description: 'A grand summit showcasing student tech projects.',
                    capacity: 300,
                    startTime: tomorrow,
                    endTime: dayAfterTomorrow,
                    categoryId: techCategory.id,
                    statusId: approvedStatus.id,
                    venueId: hallVenue.id,
                },
            });
            console.log('Sample Event "Annual Tech Summit 2026" seeded.');
        } else {
            console.log('Event already exists, skipping.');
        }
    }

    console.log('Events seeded.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
