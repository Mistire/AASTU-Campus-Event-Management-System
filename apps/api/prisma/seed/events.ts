import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Events Module Data...');

  const statuses = [
    {
      statusName: 'DRAFT',
      description:
        'The event is currently being prepared by the Organizer and has not been submitted yet.',
    },
    {
      statusName: 'PENDING',
      description:
        'The organizer has submitted the event, and it is waiting for an Admin decision.',
    },
    {
      statusName: 'APPROVED',
      description: 'The event meets all requirements and is cleared to be published.',
    },
    {
      statusName: 'REJECTED',
      description: 'The Admin has denied the event, and it is permanently stored as rejected.',
    },
    { statusName: 'LIVE', description: 'The event is now live and visible to attendees.' },
    {
      statusName: 'CANCELLED',
      description: 'The organizer has cancelled the event, and it is no longer active.',
    },
    {
      statusName: 'ARCHIVED',
      description:
        "The event's scheduled lifetime has ended; stored for historical data and analytics.",
    },
  ];

  for (const s of statuses) {
    await prisma.eventStatus.upsert({
      where: { statusName: s.statusName },
      update: { description: s.description },
      create: s,
    });
  }
  console.log(`✅ ${statuses.length} Event Statuses seeded.`);

  const eventTypes = [
    { name: 'Seminar', description: 'A formal academic presentation or lecture.' },
    {
      name: 'Workshop',
      description: 'A hands-on, interactive session where students learn a specific skill.',
    },
    {
      name: 'Guest Lecture',
      description: 'A talk given by an invited industry expert or visiting professor.',
    },
    {
      name: 'Conference',
      description:
        'A large-scale academic gathering with multiple speakers and paper presentations.',
    },
    { name: 'Hackathon', description: 'An intensive coding or engineering competition.' },
    {
      name: 'Exhibition',
      description: 'A showcase of student projects, innovations, or club achievements.',
    },
    {
      name: 'Competition',
      description: 'General contests (e.g., robotics challenges, math Olympiads).',
    },
    {
      name: 'Career Fair',
      description: 'An event where companies set up booths to recruit students.',
    },
    {
      name: 'Networking Event',
      description: 'An informal gathering for students to meet alumni or industry professionals.',
    },
    {
      name: 'Panel Discussion',
      description: 'A moderated conversation with multiple experts on a specific topic.',
    },
    { name: 'Club Meeting', description: 'Regular gatherings for student associations or clubs.' },
    {
      name: 'Cultural Festival',
      description: 'Campus-wide celebrations, music, art, or food events.',
    },
    { name: 'Sports Event', description: 'Inter-departmental or campus-wide tournaments.' },
  ];

  for (const t of eventTypes) {
    await prisma.eventType.upsert({
      where: { name: t.name },
      update: { description: t.description },
      create: t,
    });
  }
  console.log(`✅ ${eventTypes.length} Event Types seeded.`);

  const tags = [
    // Technology & Skills
    '#WebDevelopment',
    '#AppDevelopment',
    '#AI',
    '#MachineLearning',
    '#DataScience',
    '#CyberSecurity',
    '#CloudComputing',
    '#IoT',
    '#Robotics',
    '#UIUX',
    '#Python',
    '#Java',
    '#JavaScript',
    '#Flutter',
    '#React',
    '#AutoCAD',
    '#CivilEngineering',
    '#ElectricalEngineering',
    // Target Audience & Eligibility
    '#AllStudents',
    '#Freshmen',
    '#Sophomores',
    '#Juniors',
    '#Seniors',
    '#PostGrads',
    '#WomenInTech',
    '#BeginnerFriendly',
    '#AdvancedLevel',
    // Perks & Incentives
    '#FreeFood',
    '#CertificateProvided',
    '#PrizeMoney',
    '#FreeSwag',
    '#Networking',
    '#CareerOpportunity',
    '#Internship',
    // Event Format & Vibe
    '#InPerson',
    '#Online',
    '#Hybrid',
    '#HandsOn',
    '#Interactive',
    '#Lecture',
    '#QandA',
    // Campus Life & Extracurriculars
    '#Sports',
    '#E_Sports',
    '#Music',
    '#Art',
    '#Volunteering',
    '#Charity',
    '#MentalHealth',
    '#Leadership',
    '#Innovation',
  ];

  for (const name of tags) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`✅ ${tags.length} Tags seeded.`);

  const categoryNames = ['Technology', 'Sports', 'Seminar', 'Workshop', 'Cultural', 'Career'];
  for (const name of categoryNames) {
    const exists = await prisma.category.findFirst({ where: { name } });
    if (!exists) {
      await prisma.category.create({
        data: { name, description: `Events related to ${name}` },
      });
    }
  }
  console.log(`✅ Categories seeded.`);

  const venues = [
    {
      name: 'Red Carpet Hall',
      building: 'Block 40',
      capacity: 80,
      description: 'Large multi-purpose hall',
    },
    {
      name: 'Red Carpet Hall B',
      building: 'Block 55',
      capacity: 80,
      description: 'Large multi-purpose hall',
    },
    {
      name: 'Old Graduation Hall',
      building: 'Block 10',
      capacity: 300,
      description: 'Main campus auditorium',
    },
    {
      name: 'Seminar Room 201',
      building: 'Block 20',
      roomNumber: '201',
      capacity: 80,
      description: 'Medium seminar room',
    },
  ];

  for (const v of venues) {
    const exists = await prisma.venue.findFirst({ where: { name: v.name, building: v.building } });
    if (!exists) {
      await prisma.venue.create({ data: v });
    }
  }
  console.log(`✅ Venues seeded.`);

  const draftStatus = await prisma.eventStatus.findUnique({ where: { statusName: 'DRAFT' } });
  const seminarType = await prisma.eventType.findUnique({ where: { name: 'Seminar' } });
  const hallVenue = await prisma.venue.findFirst({ where: { name: 'Red Carpet Hall' } });

  if (draftStatus && seminarType && hallVenue) {
    const existingEvent = await prisma.event.findFirst({
      where: { title: 'Coding Bootcamp 2026' },
    });

    if (!existingEvent) {
      // Get an organizer user (if seeded)
      const organizer = await prisma.user.findFirst({
        where: { role: { roleName: 'ORGANIZER' } },
      });

      if (organizer) {
        const liveStatus = await prisma.eventStatus.findUnique({ where: { statusName: 'LIVE' } });
        const approvedStatus = await prisma.eventStatus.findUnique({
          where: { statusName: 'APPROVED' },
        });
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 7);
        const dayAfter = new Date(tomorrow);
        dayAfter.setDate(dayAfter.getDate() + 1);

        // Event 1: Draft
        const event1 = await prisma.event.create({
          data: {
            title: 'Annual Tech Summit 2026',
            description: 'A grand summit showcasing student tech projects and innovations.',
            capacity: 300,
            startTime: tomorrow,
            endTime: dayAfter,
            statusId: draftStatus.id,
            eventTypeId: seminarType.id,
            venueId: hallVenue.id,
            createdBy: organizer.id,
            requiresApproval: false,
          },
        });

        // Event 2: Live
        await prisma.event.create({
          data: {
            title: 'Coding Bootcamp 2026',
            description: 'Intensive 2-day coding workshop for beginners.',
            capacity: 50,
            startTime: new Date(),
            endTime: dayAfter,
            statusId: liveStatus?.id || draftStatus.id,
            eventTypeId: seminarType.id, // Should be Workshop but seminarType is available
            venueId: hallVenue.id,
            createdBy: organizer.id,
            requiresApproval: false,
          },
        });

        // Event 3: Approved
        await prisma.event.create({
          data: {
            title: 'AI Ethics Seminar',
            description: 'Discussion on the future of AI and its ethical implications.',
            capacity: 100,
            startTime: tomorrow,
            endTime: dayAfter,
            statusId: approvedStatus?.id || draftStatus.id,
            eventTypeId: seminarType.id,
            venueId: hallVenue.id,
            createdBy: organizer.id,
            requiresApproval: true,
          },
        });

        console.log('Sample Events seeded.');
      } else {
        console.log('No organizer user found. Run script_users first to seed users.');
      }
    } else {
      console.log('Sample events already exist, skipping.');
    }
  }

  console.log('\nEvents module data seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
