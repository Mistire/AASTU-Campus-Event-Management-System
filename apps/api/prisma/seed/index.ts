import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('🌱 Starting comprehensive seed...');

  // ── PERMISSIONS ──────────────────────────────────────────────────
  const permNames = [
    'user:read',
    'user:assign-role',
    'role:create',
    'role:read',
    'role:update',
    'role:delete',
    'role:assign-permissions',
    'permission:create',
    'permission:read',
    'permission:update',
    'permission:delete',
    'event:create',
    'event:read',
    'event:update',
    'event:delete',
    'event:approve',
    'event:register',
  ];
  for (const name of permNames) {
    await prisma.permission.upsert({ where: { name }, update: {}, create: { name } });
  }
  const allPerms = await prisma.permission.findMany();

  // ── ROLES ────────────────────────────────────────────────────────
  const roleData = [
    { roleName: 'ADMIN', description: 'System Administrator', perms: allPerms.map((p) => p.name) },
    {
      roleName: 'ORGANIZER',
      description: 'Event Organizer',
      perms: ['event:create', 'event:read', 'event:update', 'event:register'],
    },
    {
      roleName: 'STUDENT',
      description: 'Student Participant',
      perms: ['event:read', 'event:register'],
    },
    { roleName: 'STAFF', description: 'Campus Staff', perms: ['event:read', 'user:read'] },
  ];
  for (const r of roleData) {
    const role = await prisma.role.upsert({
      where: { roleName: r.roleName },
      update: {},
      create: { roleName: r.roleName, description: r.description },
    });
    for (const pName of r.perms) {
      const perm = allPerms.find((p) => p.name === pName);
      if (perm) {
        const exists = await prisma.rolePermission.findFirst({
          where: { roleId: role.id, permissionId: perm.id },
        });
        if (!exists)
          await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: perm.id } });
      }
    }
  }
  console.log('✅ Roles & Permissions seeded');

  // ── DEPARTMENTS ──────────────────────────────────────────────────
  const depts = [
    { name: 'Software Engineering', faculty: 'College of Computing' },
    { name: 'Electrical Engineering', faculty: 'College of Engineering' },
    { name: 'Civil Engineering', faculty: 'College of Engineering' },
    { name: 'Mechanical Engineering', faculty: 'College of Engineering' },
    { name: 'Architecture', faculty: 'College of Architecture' },
  ];
  const deptRecords: Record<string, string> = {};
  for (const d of depts) {
    const exists = await prisma.department.findFirst({ where: { name: d.name } });
    const rec = exists ?? (await prisma.department.create({ data: d }));
    deptRecords[d.name] = rec.id;
  }
  console.log('✅ Departments seeded');

  // ── USERS ────────────────────────────────────────────────────────
  const adminRole = await prisma.role.findUnique({ where: { roleName: 'ADMIN' } });
  const studentRole = await prisma.role.findUnique({ where: { roleName: 'STUDENT' } });
  const organizerRole = await prisma.role.findUnique({ where: { roleName: 'ORGANIZER' } });
  const staffRole = await prisma.role.findUnique({ where: { roleName: 'STAFF' } });
  const pwHash = await argon2.hash('Password123!', { type: argon2.argon2id });
  const seDate = new Date();

  const usersData = [
    {
      email: 'admin@aastu.edu.et',
      fullName: 'System Admin',
      roleId: adminRole!.id,
      departmentId: deptRecords['Software Engineering'],
    },
    {
      email: 'organizer@aastu.edu.et',
      fullName: 'Jane Smith',
      roleId: organizerRole!.id,
      departmentId: deptRecords['Software Engineering'],
    },
    {
      email: 'organizer2@aastu.edu.et',
      fullName: 'Kaleb Tesfaye',
      roleId: organizerRole!.id,
      departmentId: deptRecords['Electrical Engineering'],
    },
    {
      email: 'student@aastu.edu.et',
      fullName: 'John Doe',
      roleId: studentRole!.id,
      departmentId: deptRecords['Software Engineering'],
    },
    {
      email: 'student2@aastu.edu.et',
      fullName: 'Abebe Birara',
      roleId: studentRole!.id,
      departmentId: deptRecords['Civil Engineering'],
    },
    {
      email: 'student3@aastu.edu.et',
      fullName: 'Sara Lemma',
      roleId: studentRole!.id,
      departmentId: deptRecords['Architecture'],
    },
    {
      email: 'staff@aastu.edu.et',
      fullName: 'Martha Tadesse',
      roleId: staffRole!.id,
      departmentId: deptRecords['Software Engineering'],
    },
  ];
  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        ...u,
        passwordHash: pwHash,
        isEmailVerified: true,
        emailVerifiedAt: seDate,
        isCampusIdVerified: true,
        campusIdVerifiedAt: seDate,
      },
    });
  }
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@aastu.edu.et' } });
  const organizer = await prisma.user.findUnique({ where: { email: 'organizer@aastu.edu.et' } });
  const organizer2 = await prisma.user.findUnique({ where: { email: 'organizer2@aastu.edu.et' } });
  const student = await prisma.user.findUnique({ where: { email: 'student@aastu.edu.et' } });
  const student2 = await prisma.user.findUnique({ where: { email: 'student2@aastu.edu.et' } });
  const student3 = await prisma.user.findUnique({ where: { email: 'student3@aastu.edu.et' } });
  console.log('✅ Users seeded — Password: Password123!');

  // ── REGISTRATION STATUSES ─────────────────────────────────────────
  for (const name of ['PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED', 'APPROVED']) {
    const ex = await prisma.registrationStatus.findFirst({ where: { name } });
    if (!ex) await prisma.registrationStatus.create({ data: { name } });
  }
  const confirmedReg = await prisma.registrationStatus.findFirst({ where: { name: 'CONFIRMED' } });
  console.log('✅ Registration statuses seeded');

  // ── EVENT STATUSES ────────────────────────────────────────────────
  const eventStatuses = [
    'DRAFT',
    'PENDING',
    'APPROVED',
    'REJECTED',
    'LIVE',
    'CANCELLED',
    'ARCHIVED',
  ];
  for (const statusName of eventStatuses) {
    await prisma.eventStatus.upsert({ where: { statusName }, update: {}, create: { statusName } });
  }

  // ── EVENT TYPES ───────────────────────────────────────────────────
  const eventTypes = [
    'Seminar',
    'Workshop',
    'Guest Lecture',
    'Conference',
    'Hackathon',
    'Exhibition',
    'Competition',
    'Career Fair',
    'Cultural Festival',
    'Sports Event',
  ];
  for (const name of eventTypes) {
    await prisma.eventType.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} event` },
    });
  }

  // ── CATEGORIES ────────────────────────────────────────────────────
  const categories = [
    'Technology',
    'Sports',
    'Seminar',
    'Workshop',
    'Cultural',
    'Career',
    'Innovation',
    'Health',
  ];
  for (const name of categories) {
    const ex = await prisma.category.findFirst({ where: { name } });
    if (!ex)
      await prisma.category.create({ data: { name, description: `Events related to ${name}` } });
  }

  // ── TAGS ──────────────────────────────────────────────────────────
  const tags = [
    '#AI',
    '#MachineLearning',
    '#WebDevelopment',
    '#CyberSecurity',
    '#CloudComputing',
    '#Robotics',
    '#AllStudents',
    '#Freshmen',
    '#Seniors',
    '#CertificateProvided',
    '#FreeFood',
    '#Networking',
    '#InPerson',
    '#HandsOn',
    '#Leadership',
    '#Innovation',
    '#Python',
    '#React',
    '#Flutter',
  ];
  for (const name of tags) {
    await prisma.tag.upsert({ where: { name }, update: {}, create: { name } });
  }

  // ── VENUES ────────────────────────────────────────────────────────
  const venueList = [
    {
      name: 'Red Carpet Hall',
      building: 'Block 40',
      capacity: 300,
      description: 'Main multi-purpose hall',
    },
    {
      name: 'Old Graduation Hall',
      building: 'Block 10',
      capacity: 500,
      description: 'Main campus auditorium',
    },
    {
      name: 'Seminar Room 201',
      building: 'Block 20',
      roomNumber: '201',
      capacity: 80,
      description: 'Medium seminar room',
    },
    {
      name: 'Innovation Lab',
      building: 'Block 30',
      roomNumber: '101',
      capacity: 40,
      description: 'Modern tech lab',
    },
    {
      name: 'Sports Complex',
      building: 'Block 55',
      capacity: 1000,
      description: 'Outdoor sports arena',
    },
  ];
  for (const v of venueList) {
    const ex = await prisma.venue.findFirst({ where: { name: v.name, building: v.building } });
    if (!ex) await prisma.venue.create({ data: v });
  }

  // ── SPEAKERS ──────────────────────────────────────────────────────
  const speakerList = [
    {
      fullName: 'Dr. Abrham Kebede',
      bio: 'AI researcher at AASTU with 15 years of experience in machine learning.',
      organization: 'AASTU',
    },
    {
      fullName: 'Eng. Hanna Girma',
      bio: 'Software architect and founder of a leading Ethiopian tech startup.',
      organization: 'TechEthiopia',
    },
    {
      fullName: 'Prof. Yonas Belay',
      bio: 'Professor of Computer Science specializing in cybersecurity.',
      organization: 'Addis Ababa University',
    },
    {
      fullName: 'Dr. Meron Alemu',
      bio: 'Data scientist with expertise in cloud computing platforms.',
      organization: 'Microsoft Ethiopia',
    },
    {
      fullName: 'Eng. Dawit Haile',
      bio: 'Civil engineer and infrastructure planning expert.',
      organization: 'Ethiopian Roads Authority',
    },
  ];
  const speakerRecords: Record<string, string> = {};
  for (const s of speakerList) {
    const ex = await prisma.speaker.findFirst({ where: { fullName: s.fullName } });
    const rec = ex ?? (await prisma.speaker.create({ data: s }));
    speakerRecords[s.fullName] = rec.id;
  }
  console.log('✅ Speakers seeded');

  const liveStatus = await prisma.eventStatus.findUnique({ where: { statusName: 'LIVE' } });
  const approvedStatus = await prisma.eventStatus.findUnique({ where: { statusName: 'APPROVED' } });
  const archivedStatus = await prisma.eventStatus.findUnique({ where: { statusName: 'ARCHIVED' } });
  const confType = await prisma.eventType.findUnique({ where: { name: 'Conference' } });
  const workshopType = await prisma.eventType.findUnique({ where: { name: 'Workshop' } });
  const hackType = await prisma.eventType.findUnique({ where: { name: 'Hackathon' } });
  const seminarType = await prisma.eventType.findUnique({ where: { name: 'Seminar' } });
  const mainHall = await prisma.venue.findFirst({ where: { name: 'Old Graduation Hall' } });
  const carpetHall = await prisma.venue.findFirst({ where: { name: 'Red Carpet Hall' } });
  const seminarRoom = await prisma.venue.findFirst({ where: { name: 'Seminar Room 201' } });
  const innovationLab = await prisma.venue.findFirst({ where: { name: 'Innovation Lab' } });
  const techCategory = await prisma.category.findFirst({ where: { name: 'Technology' } });

  const now = new Date();
  const past = (d: number) => new Date(now.getTime() - d * 86400000);
  const future = (d: number) => new Date(now.getTime() + d * 86400000);

  // ── EVENTS ────────────────────────────────────────────────────────
  // Event 1: AASTU Tech Summit (LIVE)
  let techSummit = await prisma.event.findFirst({ where: { title: 'AASTU Tech Summit 2026' } });
  if (!techSummit) {
    techSummit = await prisma.event.create({
      data: {
        title: 'AASTU Tech Summit 2026',
        description:
          'The annual gathering of the best minds at AASTU. Featuring AI, cloud computing, cybersecurity talks, and a live product expo by student startups.',
        capacity: 400,
        startTime: future(3),
        endTime: future(5),
        statusId: liveStatus!.id,
        eventTypeId: confType!.id,
        venueId: mainHall!.id,
        createdBy: organizer!.id,
        requiresApproval: true,
      },
    });
    await prisma.eventOrganizers.create({
      data: { eventId: techSummit.id, userId: organizer!.id, role: 'Creator', status: 'ACCEPTED' },
    });
    if (techCategory)
      await prisma.eventCategory.create({
        data: { eventId: techSummit.id, categoryId: techCategory.id },
      });

    const s1 = await prisma.eventSessions.create({
      data: {
        eventId: techSummit.id,
        title: 'Keynote: The Future of AI in Africa',
        startTime: future(3),
        endTime: new Date(future(3).getTime() + 3600000),
        description: 'Opening keynote on AI trends shaping the African tech landscape.',
        location: 'Main Stage',
        sessionType: 'Keynote',
      },
    });
    const s2 = await prisma.eventSessions.create({
      data: {
        eventId: techSummit.id,
        title: 'Workshop: Building LLM Applications',
        startTime: new Date(future(3).getTime() + 3600000 * 2),
        endTime: new Date(future(3).getTime() + 3600000 * 4),
        description: 'Hands-on workshop building AI-powered apps using open-source LLMs.',
        location: 'Innovation Lab',
        sessionType: 'Workshop',
      },
    });
    const s3 = await prisma.eventSessions.create({
      data: {
        eventId: techSummit.id,
        title: 'Panel: Cybersecurity in Ethiopian Fintech',
        startTime: future(4),
        endTime: new Date(future(4).getTime() + 3600000 * 2),
        description: 'Expert panel discussing current threats and best practices.',
        location: 'Seminar Room A',
        sessionType: 'Panel',
      },
    });

    await prisma.sessionSpeakers.create({
      data: { sessionId: s1.id, speakerId: speakerRecords['Dr. Abrham Kebede'] },
    });
    await prisma.sessionSpeakers.create({
      data: { sessionId: s2.id, speakerId: speakerRecords['Eng. Hanna Girma'] },
    });
    await prisma.sessionSpeakers.create({
      data: { sessionId: s2.id, speakerId: speakerRecords['Dr. Meron Alemu'] },
    });
    await prisma.sessionSpeakers.create({
      data: { sessionId: s3.id, speakerId: speakerRecords['Prof. Yonas Belay'] },
    });

    for (const u of [student, student2, student3]) {
      if (u)
        await prisma.registration.create({
          data: { userId: u.id, eventId: techSummit.id, statusId: confirmedReg!.id },
        });
    }
  }

  // Event 2: AI & ML Workshop (APPROVED)
  let mlWorkshop = await prisma.event.findFirst({
    where: { title: 'Practical Machine Learning Workshop' },
  });
  if (!mlWorkshop) {
    mlWorkshop = await prisma.event.create({
      data: {
        title: 'Practical Machine Learning Workshop',
        description:
          'A full-day hands-on workshop covering supervised learning, neural networks, and model deployment using Python and TensorFlow.',
        capacity: 40,
        startTime: future(10),
        endTime: future(10),
        statusId: approvedStatus!.id,
        eventTypeId: workshopType!.id,
        venueId: innovationLab!.id,
        createdBy: organizer2!.id,
        requiresApproval: false,
      },
    });
    await prisma.eventOrganizers.create({
      data: { eventId: mlWorkshop.id, userId: organizer2!.id, role: 'Creator', status: 'ACCEPTED' },
    });
    const ws1 = await prisma.eventSessions.create({
      data: {
        eventId: mlWorkshop.id,
        title: 'Introduction to Python for Data Science',
        startTime: future(10),
        endTime: new Date(future(10).getTime() + 3600000 * 3),
        description: 'Numpy, Pandas, and Matplotlib fundamentals.',
        location: 'Innovation Lab',
        sessionType: 'Lecture',
      },
    });
    const ws2 = await prisma.eventSessions.create({
      data: {
        eventId: mlWorkshop.id,
        title: 'Building & Training Your First Neural Network',
        startTime: new Date(future(10).getTime() + 3600000 * 4),
        endTime: new Date(future(10).getTime() + 3600000 * 7),
        description: 'Practical TensorFlow session with real datasets.',
        location: 'Innovation Lab',
        sessionType: 'Hands-on',
      },
    });
    await prisma.sessionSpeakers.create({
      data: { sessionId: ws1.id, speakerId: speakerRecords['Dr. Meron Alemu'] },
    });
    await prisma.sessionSpeakers.create({
      data: { sessionId: ws2.id, speakerId: speakerRecords['Dr. Abrham Kebede'] },
    });
    if (student)
      await prisma.registration.create({
        data: { userId: student.id, eventId: mlWorkshop.id, statusId: confirmedReg!.id },
      });
  }

  // Event 3: AASTU Hackathon (ARCHIVED)
  let hackathon = await prisma.event.findFirst({ where: { title: 'AASTU Hackathon 2025' } });
  if (!hackathon) {
    hackathon = await prisma.event.create({
      data: {
        title: 'AASTU Hackathon 2025',
        description:
          '48-hour hackathon where student teams build innovative solutions to real-world Ethiopian problems.',
        capacity: 200,
        startTime: past(30),
        endTime: past(28),
        statusId: archivedStatus!.id,
        eventTypeId: hackType!.id,
        venueId: carpetHall!.id,
        createdBy: organizer!.id,
        requiresApproval: false,
      },
    });
    await prisma.eventOrganizers.create({
      data: { eventId: hackathon.id, userId: organizer!.id, role: 'Creator', status: 'ACCEPTED' },
    });
    const hs1 = await prisma.eventSessions.create({
      data: {
        eventId: hackathon.id,
        title: 'Problem Statement Reveal & Team Formation',
        startTime: past(30),
        endTime: new Date(past(30).getTime() + 3600000 * 2),
        description: 'Teams receive their challenge domains and form groups.',
        location: 'Main Hall',
        sessionType: 'Opening',
      },
    });
    const hs2 = await prisma.eventSessions.create({
      data: {
        eventId: hackathon.id,
        title: 'Mentoring Sessions',
        startTime: new Date(past(29).getTime()),
        endTime: new Date(past(29).getTime() + 3600000 * 4),
        description: 'One-on-one mentoring with industry experts.',
        location: 'Innovation Lab',
        sessionType: 'Mentoring',
      },
    });
    await prisma.sessionSpeakers.create({
      data: { sessionId: hs1.id, speakerId: speakerRecords['Eng. Hanna Girma'] },
    });
    await prisma.sessionSpeakers.create({
      data: { sessionId: hs2.id, speakerId: speakerRecords['Dr. Abrham Kebede'] },
    });
    await prisma.sessionSpeakers.create({
      data: { sessionId: hs2.id, speakerId: speakerRecords['Prof. Yonas Belay'] },
    });

    for (const u of [student, student2, student3]) {
      if (u)
        await prisma.registration.create({
          data: { userId: u.id, eventId: hackathon.id, statusId: confirmedReg!.id },
        });
    }

    const feedbackData = [
      {
        userId: student!.id,
        rating: 5,
        comment: 'Absolutely incredible! Best event AASTU has ever organized.',
      },
      { userId: student2!.id, rating: 4, comment: 'Great energy and organization.' },
      { userId: student3!.id, rating: 4, comment: 'Very well organized.' },
    ];
    for (const f of feedbackData) {
      if (f.userId) await prisma.feedback.create({ data: { ...f, eventId: hackathon.id } });
    }
  }

  // Event 4: Infrastructure Seminar (APPROVED)
  let infraSeminar = await prisma.event.findFirst({
    where: { title: 'Ethiopian Infrastructure Development Seminar' },
  });
  if (!infraSeminar) {
    infraSeminar = await prisma.event.create({
      data: {
        title: 'Ethiopian Infrastructure Development Seminar',
        description:
          'A professional seminar exploring current large-scale infrastructure projects in Ethiopia and their engineering challenges.',
        capacity: 80,
        startTime: future(15),
        endTime: future(15),
        statusId: approvedStatus!.id,
        eventTypeId: seminarType!.id,
        venueId: seminarRoom!.id,
        createdBy: organizer2!.id,
        requiresApproval: false,
      },
    });
    await prisma.eventOrganizers.create({
      data: {
        eventId: infraSeminar.id,
        userId: organizer2!.id,
        role: 'Creator',
        status: 'ACCEPTED',
      },
    });
    const is1 = await prisma.eventSessions.create({
      data: {
        eventId: infraSeminar.id,
        title: 'Grand Ethiopian Renaissance Dam: Engineering Insights',
        startTime: future(15),
        endTime: new Date(future(15).getTime() + 3600000 * 2),
        description: 'Deep dive into the engineering feats behind GERD.',
        location: 'Seminar Room 201',
        sessionType: 'Presentation',
      },
    });
    await prisma.sessionSpeakers.create({
      data: { sessionId: is1.id, speakerId: speakerRecords['Eng. Dawit Haile'] },
    });
    if (student2)
      await prisma.registration.create({
        data: { userId: student2.id, eventId: infraSeminar.id, statusId: confirmedReg!.id },
      });
  }

  // ── SUPPORT TICKETS ───────────────────────────────────────────────
  const ticketsData = [
    {
      userId: student!.id,
      subject: 'Cannot register for Tech Summit',
      category: 'TECHNICAL' as any,
      priority: 'HIGH' as any,
      status: 'OPEN' as any,
    },
    {
      userId: student2!.id,
      subject: 'Request for event certificate after Hackathon 2025',
      category: 'OTHER' as any,
      priority: 'MEDIUM' as any,
      status: 'IN_PROGRESS' as any,
    },
    {
      userId: organizer!.id,
      subject: 'Event capacity increase request for Tech Summit',
      category: 'EVENT_ISSUE' as any,
      priority: 'MEDIUM' as any,
      status: 'RESOLVED' as any,
    },
    {
      userId: student3!.id,
      subject: 'Account login issues after password reset',
      category: 'ACCOUNT' as any,
      priority: 'HIGH' as any,
      status: 'OPEN' as any,
    },
  ];
  for (const t of ticketsData) {
    const ex = await prisma.supportTicket.findFirst({ where: { subject: t.subject } });
    if (!ex) await prisma.supportTicket.create({ data: t });
  }
  console.log('✅ Support tickets seeded');

  // ── AUDIT LOGS ────────────────────────────────────────────────────
  const auditData = [
    {
      userId: adminUser!.id,
      action: 'LOGIN',
      entityType: 'USER',
      outcome: 'SUCCESS',
      details: 'Admin logged in successfully',
      role: 'ADMIN',
      ipAddress: '172.20.0.1',
      environment: 'DEVELOPMENT',
    },
    {
      userId: organizer!.id,
      action: 'SIGNUP',
      entityType: 'USER',
      outcome: 'SUCCESS',
      details: 'New user signed up: organizer@aastu.edu.et',
      role: 'ORGANIZER',
      ipAddress: '172.20.0.1',
      environment: 'DEVELOPMENT',
    },
    {
      userId: organizer!.id,
      action: 'EVENT_CREATED',
      entityType: 'EVENT',
      outcome: 'SUCCESS',
      details: 'Event "AASTU Tech Summit 2026" created successfully',
      role: 'ORGANIZER',
      ipAddress: '172.20.0.1',
      environment: 'DEVELOPMENT',
    },
    {
      userId: adminUser!.id,
      action: 'EVENT_APPROVED',
      entityType: 'EVENT',
      outcome: 'SUCCESS',
      details: 'Admin approved the AASTU Tech Summit 2026',
      role: 'ADMIN',
      ipAddress: '172.20.0.1',
      environment: 'DEVELOPMENT',
    },
    {
      userId: student!.id,
      action: 'LOGIN',
      entityType: 'USER',
      outcome: 'FAILURE',
      details: 'Failed login attempt for student@aastu.edu.et (Invalid password)',
      role: 'STUDENT',
      ipAddress: '172.20.0.5',
      environment: 'DEVELOPMENT',
    },
    {
      userId: student!.id,
      action: 'LOGIN',
      entityType: 'USER',
      outcome: 'SUCCESS',
      details: 'User logged in successfully: student@aastu.edu.et',
      role: 'STUDENT',
      ipAddress: '172.20.0.5',
      environment: 'DEVELOPMENT',
    },
    {
      userId: student!.id,
      action: 'REGISTRATION',
      entityType: 'EVENT',
      outcome: 'SUCCESS',
      details: 'Student registered for AASTU Tech Summit 2026',
      role: 'STUDENT',
      ipAddress: '172.20.0.5',
      environment: 'DEVELOPMENT',
    },
    {
      userId: adminUser!.id,
      action: 'USER_ROLE_UPDATED',
      entityType: 'USER',
      outcome: 'SUCCESS',
      details: 'Admin updated user role from STUDENT to ORGANIZER',
      role: 'ADMIN',
      ipAddress: '172.20.0.1',
      environment: 'DEVELOPMENT',
      afterState: { newRole: 'ORGANIZER' },
    },
  ];
  for (const log of auditData) {
    await prisma.auditLogs.create({ data: log as any });
  }
  console.log('✅ Audit logs seeded');

  // ── USER CATEGORY PREFERENCES ─────────────────────────────────────
  if (techCategory && student) {
    const ex = await prisma.userCategoryPreferences.findFirst({
      where: { userId: student.id, categoryId: techCategory.id },
    });
    if (!ex)
      await prisma.userCategoryPreferences.create({
        data: { userId: student.id, categoryId: techCategory.id },
      });
  }

  console.log('\n🎉 Comprehensive seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
