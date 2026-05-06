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
    'Panel Discussion',
    'Graduation',
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
  const exhibType = await prisma.eventType.findUnique({ where: { name: 'Exhibition' } });
  const compType = await prisma.eventType.findUnique({ where: { name: 'Competition' } });
  const careerType = await prisma.eventType.findUnique({ where: { name: 'Career Fair' } });
  const cultType = await prisma.eventType.findUnique({ where: { name: 'Cultural Festival' } });
  const sportsType = await prisma.eventType.findUnique({ where: { name: 'Sports Event' } });
  const gradType = await prisma.eventType.findUnique({ where: { name: 'Graduation' } });
  const mainHall = await prisma.venue.findFirst({ where: { name: 'Old Graduation Hall' } });
  const carpetHall = await prisma.venue.findFirst({ where: { name: 'Red Carpet Hall' } });
  const seminarRoom = await prisma.venue.findFirst({ where: { name: 'Seminar Room 201' } });
  const innovationLab = await prisma.venue.findFirst({ where: { name: 'Innovation Lab' } });
  const sportsComplex = await prisma.venue.findFirst({ where: { name: 'Sports Complex' } });
  const techCategory = await prisma.category.findFirst({ where: { name: 'Technology' } });
  const careerCategory = await prisma.category.findFirst({ where: { name: 'Career' } });
  const cultCategory = await prisma.category.findFirst({ where: { name: 'Cultural' } });

  const now = new Date();
  const past = (d: number) => new Date(now.getTime() - d * 86400000);
  const future = (d: number) => new Date(now.getTime() + d * 86400000);
  const hr = (base: Date, h: number) => new Date(base.getTime() + h * 3600000);

  // ── 18 EVENTS (June – July 2026) ──────────────────────────────────
  type EventDef = {
    title: string;
    desc: string;
    cap: number;
    start: Date;
    end: Date;
    statusId: string;
    typeId: string;
    venueId: string;
    creator: string;
    approval: boolean;
    catId?: string;
  };
  const eventDefs: EventDef[] = [
    {
      title: 'AASTU Tech Summit 2026',
      desc: 'Annual gathering featuring AI, cloud computing, cybersecurity talks and a live student startup expo.',
      cap: 400,
      start: future(30),
      end: future(31),
      statusId: liveStatus!.id,
      typeId: confType!.id,
      venueId: mainHall!.id,
      creator: organizer!.id,
      approval: true,
      catId: techCategory?.id,
    },
    {
      title: 'AI & Machine Learning Bootcamp',
      desc: 'Full-day hands-on bootcamp covering supervised learning, neural networks and model deployment with Python & TensorFlow.',
      cap: 40,
      start: future(35),
      end: future(35),
      statusId: liveStatus!.id,
      typeId: workshopType!.id,
      venueId: innovationLab!.id,
      creator: organizer2!.id,
      approval: false,
      catId: techCategory?.id,
    },
    {
      title: 'AASTU Hackathon 2026',
      desc: '48-hour hackathon where student teams build innovative solutions to real-world Ethiopian problems. Prizes worth 50,000 ETB.',
      cap: 200,
      start: future(39),
      end: future(41),
      statusId: liveStatus!.id,
      typeId: hackType!.id,
      venueId: carpetHall!.id,
      creator: organizer!.id,
      approval: false,
      catId: techCategory?.id,
    },
    {
      title: 'Cybersecurity Awareness Week',
      desc: 'A week-long seminar series covering ethical hacking, digital forensics, and enterprise security best practices.',
      cap: 100,
      start: future(45),
      end: future(45),
      statusId: approvedStatus!.id,
      typeId: seminarType!.id,
      venueId: seminarRoom!.id,
      creator: organizer2!.id,
      approval: false,
      catId: techCategory?.id,
    },
    {
      title: 'Ethiopian Career Fair 2026',
      desc: 'Connects graduating students with 30+ leading Ethiopian and international employers across tech, engineering and finance.',
      cap: 500,
      start: future(50),
      end: future(50),
      statusId: liveStatus!.id,
      typeId: careerType!.id,
      venueId: mainHall!.id,
      creator: organizer!.id,
      approval: true,
      catId: careerCategory?.id,
    },
    {
      title: 'Flutter & Mobile Dev Workshop',
      desc: 'Build your first cross-platform mobile app using Flutter and Dart. Tools, UI patterns and backend integration covered.',
      cap: 40,
      start: future(53),
      end: future(53),
      statusId: approvedStatus!.id,
      typeId: workshopType!.id,
      venueId: innovationLab!.id,
      creator: organizer2!.id,
      approval: false,
      catId: techCategory?.id,
    },
    {
      title: 'AASTU Innovation Exhibition 2026',
      desc: 'Showcase of 50+ final-year student projects and club innovations judged by industry professionals and faculty.',
      cap: 300,
      start: future(57),
      end: future(58),
      statusId: liveStatus!.id,
      typeId: exhibType!.id,
      venueId: carpetHall!.id,
      creator: organizer!.id,
      approval: true,
    },
    {
      title: 'Data Science & Analytics Seminar',
      desc: 'Expert-led seminar covering big data pipelines, business intelligence dashboards and real-world Ethiopian case studies.',
      cap: 80,
      start: future(60),
      end: future(60),
      statusId: approvedStatus!.id,
      typeId: seminarType!.id,
      venueId: seminarRoom!.id,
      creator: organizer2!.id,
      approval: false,
      catId: techCategory?.id,
    },
    {
      title: 'AASTU Inter-Department Sports Day',
      desc: 'Annual inter-departmental sports tournament featuring football, basketball, athletics and volleyball competitions.',
      cap: 800,
      start: future(65),
      end: future(66),
      statusId: liveStatus!.id,
      typeId: sportsType!.id,
      venueId: sportsComplex!.id,
      creator: organizer!.id,
      approval: false,
    },
    {
      title: 'Cloud Computing & DevOps Masterclass',
      desc: 'Hands-on masterclass covering AWS, Docker, Kubernetes and CI/CD pipelines. Certificate provided upon completion.',
      cap: 40,
      start: future(67),
      end: future(67),
      statusId: approvedStatus!.id,
      typeId: workshopType!.id,
      venueId: innovationLab!.id,
      creator: organizer2!.id,
      approval: false,
      catId: techCategory?.id,
    },
    {
      title: 'AASTU Cultural Festival 2026',
      desc: 'Campus-wide celebration of Ethiopian cultural diversity featuring traditional music, food, art and performances.',
      cap: 1000,
      start: future(70),
      end: future(71),
      statusId: liveStatus!.id,
      typeId: cultType!.id,
      venueId: mainHall!.id,
      creator: organizer!.id,
      approval: true,
      catId: cultCategory?.id,
    },
    {
      title: 'Entrepreneurship & Startup Panel',
      desc: 'Panel discussion with successful Ethiopian founders sharing lessons on building startups, fundraising and scaling.',
      cap: 150,
      start: future(73),
      end: future(73),
      statusId: approvedStatus!.id,
      typeId: confType!.id,
      venueId: carpetHall!.id,
      creator: organizer2!.id,
      approval: false,
      catId: careerCategory?.id,
    },
    {
      title: 'Open Source Contribution Day',
      desc: 'Collaborative coding day where students contribute to major open-source projects under mentor guidance.',
      cap: 60,
      start: future(75),
      end: future(75),
      statusId: approvedStatus!.id,
      typeId: workshopType!.id,
      venueId: innovationLab!.id,
      creator: organizer!.id,
      approval: false,
      catId: techCategory?.id,
    },
    {
      title: 'IEEE AASTU Student Branch Conference',
      desc: 'Annual IEEE student conference featuring research presentations, industry talks and networking sessions.',
      cap: 200,
      start: future(77),
      end: future(78),
      statusId: liveStatus!.id,
      typeId: confType!.id,
      venueId: mainHall!.id,
      creator: organizer2!.id,
      approval: true,
      catId: techCategory?.id,
    },
    {
      title: 'Green Engineering & Sustainability Seminar',
      desc: 'Seminar exploring renewable energy, sustainable construction and eco-friendly engineering practices in Ethiopia.',
      cap: 80,
      start: future(80),
      end: future(80),
      statusId: approvedStatus!.id,
      typeId: seminarType!.id,
      venueId: seminarRoom!.id,
      creator: organizer!.id,
      approval: false,
    },
    {
      title: 'AASTU Robotics Challenge 2026',
      desc: 'Teams design and program autonomous robots to navigate obstacle courses. Open to all engineering departments.',
      cap: 120,
      start: future(82),
      end: future(83),
      statusId: liveStatus!.id,
      typeId: compType!.id,
      venueId: carpetHall!.id,
      creator: organizer2!.id,
      approval: false,
      catId: techCategory?.id,
    },
    {
      title: 'Mental Health & Student Wellbeing Workshop',
      desc: 'Interactive workshop covering stress management, study-life balance, and mental health resources available on campus.',
      cap: 60,
      start: future(84),
      end: future(84),
      statusId: approvedStatus!.id,
      typeId: workshopType!.id,
      venueId: seminarRoom!.id,
      creator: organizer!.id,
      approval: false,
    },
    {
      title: 'AASTU Graduation Ceremony 2026',
      desc: 'The 18th annual graduation ceremony celebrating the class of 2026. Families and guests are invited to witness this milestone.',
      cap: 2000,
      start: future(86),
      end: future(86),
      statusId: liveStatus!.id,
      typeId: gradType!.id,
      venueId: mainHall!.id,
      creator: organizer!.id,
      approval: true,
    },
  ];

  for (const def of eventDefs) {
    const ex = await prisma.event.findFirst({ where: { title: def.title } });
    if (!ex) {
      const ev = await prisma.event.create({
        data: {
          title: def.title,
          description: def.desc,
          capacity: def.cap,
          startTime: def.start,
          endTime: def.end,
          statusId: def.statusId,
          eventTypeId: def.typeId,
          venueId: def.venueId,
          createdBy: def.creator,
          requiresApproval: def.approval,
        },
      });
      await prisma.eventOrganizers.create({
        data: { eventId: ev.id, userId: def.creator, role: 'Creator', status: 'ACCEPTED' },
      });
      if (def.catId)
        await prisma.eventCategory.create({ data: { eventId: ev.id, categoryId: def.catId } });
      for (const u of [student, student2, student3]) {
        if (u)
          await prisma.registration
            .create({ data: { userId: u.id, eventId: ev.id, statusId: confirmedReg!.id } })
            .catch(() => {});
      }
    }
  }
  console.log('✅ 18 Events seeded (June – July 2026)');

  // ── SESSIONS & SPEAKERS ───────────────────────────────────────────
  type SessionDef = {
    eventTitle: string;
    sessions: {
      title: string;
      type: string;
      loc: string;
      offsetH: number;
      durH: number;
      desc: string;
      speakers: string[];
    }[];
  };
  const addSession = async (
    eventId: string,
    title: string,
    type: string,
    loc: string,
    base: Date,
    offsetH: number,
    durH: number,
    desc: string,
    spks: string[],
  ) => {
    const ex = await prisma.eventSessions.findFirst({ where: { eventId, title } });
    if (ex) return ex;
    const start = new Date(base.getTime() + offsetH * 3600000);
    const end = new Date(start.getTime() + durH * 3600000);
    const s = await prisma.eventSessions.create({
      data: {
        eventId,
        title,
        sessionType: type,
        location: loc,
        startTime: start,
        endTime: end,
        description: desc,
      },
    });
    for (const spk of spks) {
      const sp = speakerRecords[spk];
      if (sp)
        await prisma.sessionSpeakers
          .create({ data: { sessionId: s.id, speakerId: sp } })
          .catch(() => {});
    }
    return s;
  };

  const sessionDefs: SessionDef[] = [
    {
      eventTitle: 'AASTU Tech Summit 2026',
      sessions: [
        {
          title: 'Keynote: The Future of AI in Africa',
          type: 'Keynote',
          loc: 'Main Stage',
          offsetH: 0,
          durH: 2,
          desc: 'Opening keynote on AI trends shaping the African tech landscape.',
          speakers: ['Dr. Abrham Kebede'],
        },
        {
          title: 'Cloud Architectures for Ethiopian Startups',
          type: 'Talk',
          loc: 'Hall A',
          offsetH: 3,
          durH: 2,
          desc: 'Practical cloud deployment strategies using AWS and Azure.',
          speakers: ['Dr. Meron Alemu'],
        },
        {
          title: 'Cybersecurity in Ethiopian Fintech',
          type: 'Panel',
          loc: 'Seminar Room A',
          offsetH: 6,
          durH: 2,
          desc: 'Expert panel on threats and best practices in fintech security.',
          speakers: ['Prof. Yonas Belay', 'Eng. Hanna Girma'],
        },
      ],
    },
    {
      eventTitle: 'AI & Machine Learning Bootcamp',
      sessions: [
        {
          title: 'Python for Data Science',
          type: 'Lecture',
          loc: 'Innovation Lab',
          offsetH: 0,
          durH: 3,
          desc: 'Numpy, Pandas and Matplotlib fundamentals.',
          speakers: ['Dr. Meron Alemu'],
        },
        {
          title: 'Training Your First Neural Network',
          type: 'Hands-on',
          loc: 'Innovation Lab',
          offsetH: 4,
          durH: 3,
          desc: 'Practical TensorFlow session with real datasets.',
          speakers: ['Dr. Abrham Kebede'],
        },
      ],
    },
    {
      eventTitle: 'AASTU Hackathon 2026',
      sessions: [
        {
          title: 'Problem Statement Reveal & Team Formation',
          type: 'Opening',
          loc: 'Main Hall',
          offsetH: 0,
          durH: 2,
          desc: 'Teams receive challenge domains and form groups.',
          speakers: ['Eng. Hanna Girma'],
        },
        {
          title: 'Mentor Office Hours',
          type: 'Mentoring',
          loc: 'Innovation Lab',
          offsetH: 24,
          durH: 4,
          desc: 'One-on-one mentoring with industry experts.',
          speakers: ['Dr. Abrham Kebede', 'Prof. Yonas Belay'],
        },
        {
          title: 'Project Demos & Judging',
          type: 'Presentation',
          loc: 'Main Hall',
          offsetH: 44,
          durH: 3,
          desc: 'Teams present their solutions to judges.',
          speakers: ['Dr. Meron Alemu'],
        },
      ],
    },
    {
      eventTitle: 'Cybersecurity Awareness Week',
      sessions: [
        {
          title: 'Ethical Hacking Fundamentals',
          type: 'Workshop',
          loc: 'Seminar Room 201',
          offsetH: 0,
          durH: 3,
          desc: 'Introduction to penetration testing concepts and tools.',
          speakers: ['Prof. Yonas Belay'],
        },
        {
          title: 'Digital Forensics & Incident Response',
          type: 'Lecture',
          loc: 'Seminar Room 201',
          offsetH: 4,
          durH: 2,
          desc: 'How to detect, respond to and recover from cyber incidents.',
          speakers: ['Prof. Yonas Belay'],
        },
      ],
    },
    {
      eventTitle: 'Ethiopian Career Fair 2026',
      sessions: [
        {
          title: 'Resume & LinkedIn Masterclass',
          type: 'Workshop',
          loc: 'Hall A',
          offsetH: 0,
          durH: 2,
          desc: 'Build a standout resume and professional online presence.',
          speakers: ['Eng. Hanna Girma'],
        },
        {
          title: 'Mock Interview Practice',
          type: 'Interactive',
          loc: 'Seminar Room 201',
          offsetH: 3,
          durH: 2,
          desc: 'Practice technical and HR interviews with industry mentors.',
          speakers: ['Dr. Meron Alemu'],
        },
      ],
    },
    {
      eventTitle: 'Flutter & Mobile Dev Workshop',
      sessions: [
        {
          title: 'Dart Language Crash Course',
          type: 'Lecture',
          loc: 'Innovation Lab',
          offsetH: 0,
          durH: 2,
          desc: 'Dart syntax, async/await, and null safety essentials.',
          speakers: ['Eng. Hanna Girma'],
        },
        {
          title: 'Building Your First Flutter App',
          type: 'Hands-on',
          loc: 'Innovation Lab',
          offsetH: 3,
          durH: 3,
          desc: 'Step-by-step UI building, state management and API integration.',
          speakers: ['Eng. Hanna Girma'],
        },
      ],
    },
    {
      eventTitle: 'AASTU Innovation Exhibition 2026',
      sessions: [
        {
          title: 'Opening Ceremony & Project Showcase',
          type: 'Opening',
          loc: 'Main Hall',
          offsetH: 0,
          durH: 2,
          desc: 'Welcoming remarks and tour of 50+ student project booths.',
          speakers: ['Dr. Abrham Kebede'],
        },
        {
          title: 'Best Project Awards & Closing',
          type: 'Closing',
          loc: 'Main Hall',
          offsetH: 6,
          durH: 1,
          desc: 'Award ceremony for top innovations judged by industry panel.',
          speakers: ['Eng. Hanna Girma'],
        },
      ],
    },
    {
      eventTitle: 'Data Science & Analytics Seminar',
      sessions: [
        {
          title: 'Big Data Pipelines in Practice',
          type: 'Lecture',
          loc: 'Seminar Room 201',
          offsetH: 0,
          durH: 2,
          desc: 'Apache Spark, Kafka and real-time data processing.',
          speakers: ['Dr. Meron Alemu'],
        },
        {
          title: 'Business Intelligence Dashboards',
          type: 'Demo',
          loc: 'Seminar Room 201',
          offsetH: 3,
          durH: 2,
          desc: 'Power BI and Tableau case studies using Ethiopian datasets.',
          speakers: ['Dr. Abrham Kebede'],
        },
      ],
    },
    {
      eventTitle: 'AASTU Inter-Department Sports Day',
      sessions: [
        {
          title: 'Football Tournament — Group Stage',
          type: 'Competition',
          loc: 'Sports Complex Field A',
          offsetH: 0,
          durH: 4,
          desc: 'Inter-department football group matches.',
          speakers: [],
        },
        {
          title: 'Athletics & Relay Races',
          type: 'Competition',
          loc: 'Sports Complex Track',
          offsetH: 0,
          durH: 3,
          desc: '100m, 200m and relay events.',
          speakers: [],
        },
        {
          title: 'Championship Finals & Award Ceremony',
          type: 'Closing',
          loc: 'Sports Complex',
          offsetH: 5,
          durH: 2,
          desc: 'Championship finals across all sports and trophy presentation.',
          speakers: [],
        },
      ],
    },
    {
      eventTitle: 'Cloud Computing & DevOps Masterclass',
      sessions: [
        {
          title: 'AWS Core Services Deep Dive',
          type: 'Lecture',
          loc: 'Innovation Lab',
          offsetH: 0,
          durH: 3,
          desc: 'EC2, S3, RDS, Lambda — hands-on lab walkthrough.',
          speakers: ['Dr. Meron Alemu'],
        },
        {
          title: 'Docker & Kubernetes in Production',
          type: 'Hands-on',
          loc: 'Innovation Lab',
          offsetH: 4,
          durH: 3,
          desc: 'Containerise and orchestrate a full-stack application.',
          speakers: ['Dr. Meron Alemu'],
        },
      ],
    },
    {
      eventTitle: 'AASTU Cultural Festival 2026',
      sessions: [
        {
          title: 'Traditional Attire Parade',
          type: 'Performance',
          loc: 'Main Stage',
          offsetH: 0,
          durH: 2,
          desc: 'Students showcase traditional dress from across Ethiopia.',
          speakers: [],
        },
        {
          title: 'Cultural Music & Dance Performances',
          type: 'Performance',
          loc: 'Main Stage',
          offsetH: 3,
          durH: 3,
          desc: 'Live music and dance from Amhara, Oromo, Tigray and other regions.',
          speakers: [],
        },
        {
          title: 'Ethiopian Food & Art Exhibition',
          type: 'Exhibition',
          loc: 'Campus Grounds',
          offsetH: 1,
          durH: 5,
          desc: 'Traditional cuisine and student artwork displays.',
          speakers: [],
        },
      ],
    },
    {
      eventTitle: 'Entrepreneurship & Startup Panel',
      sessions: [
        {
          title: 'From Idea to MVP in 90 Days',
          type: 'Talk',
          loc: 'Red Carpet Hall',
          offsetH: 0,
          durH: 2,
          desc: 'Practical framework for validating and building your first product.',
          speakers: ['Eng. Hanna Girma'],
        },
        {
          title: 'Fundraising & Investor Relations',
          type: 'Panel',
          loc: 'Red Carpet Hall',
          offsetH: 3,
          durH: 2,
          desc: 'How to pitch to investors and navigate the Ethiopian startup ecosystem.',
          speakers: ['Eng. Hanna Girma', 'Dr. Meron Alemu'],
        },
      ],
    },
    {
      eventTitle: 'IEEE AASTU Student Branch Conference',
      sessions: [
        {
          title: 'Research Paper Presentations — Track A',
          type: 'Presentation',
          loc: 'Hall A',
          offsetH: 0,
          durH: 3,
          desc: 'Student research presentations in AI, Embedded Systems and Networking.',
          speakers: ['Dr. Abrham Kebede'],
        },
        {
          title: 'Keynote: IEEE Global Initiatives',
          type: 'Keynote',
          loc: 'Main Hall',
          offsetH: 4,
          durH: 2,
          desc: 'Overview of IEEE programs available to Ethiopian student members.',
          speakers: ['Prof. Yonas Belay'],
        },
      ],
    },
    {
      eventTitle: 'AASTU Robotics Challenge 2026',
      sessions: [
        {
          title: 'Robot Design & Safety Inspection',
          type: 'Opening',
          loc: 'Red Carpet Hall',
          offsetH: 0,
          durH: 2,
          desc: 'Teams submit designs; judges verify safety compliance.',
          speakers: [],
        },
        {
          title: 'Obstacle Course Competition',
          type: 'Competition',
          loc: 'Red Carpet Hall',
          offsetH: 3,
          durH: 4,
          desc: 'Autonomous robots navigate timed obstacle courses.',
          speakers: [],
        },
        {
          title: 'Awards & Technical Debrief',
          type: 'Closing',
          loc: 'Red Carpet Hall',
          offsetH: 8,
          durH: 1,
          desc: 'Winners announced and judges provide technical feedback.',
          speakers: ['Dr. Abrham Kebede'],
        },
      ],
    },
    {
      eventTitle: 'AASTU Graduation Ceremony 2026',
      sessions: [
        {
          title: 'Academic Procession',
          type: 'Ceremony',
          loc: 'Old Graduation Hall',
          offsetH: 0,
          durH: 1,
          desc: 'Academic staff and graduates march into the hall.',
          speakers: [],
        },
        {
          title: 'Keynote Address & Degree Conferral',
          type: 'Keynote',
          loc: 'Old Graduation Hall',
          offsetH: 1,
          durH: 3,
          desc: 'Guest speaker address followed by individual degree conferral.',
          speakers: ['Dr. Abrham Kebede'],
        },
        {
          title: 'Reception & Photography',
          type: 'Social',
          loc: 'Campus Grounds',
          offsetH: 5,
          durH: 2,
          desc: 'Post-ceremony reception with refreshments and graduation photos.',
          speakers: [],
        },
      ],
    },
  ];

  for (const sd of sessionDefs) {
    const ev = await prisma.event.findFirst({ where: { title: sd.eventTitle } });
    if (!ev) continue;
    for (const s of sd.sessions) {
      await addSession(
        ev.id,
        s.title,
        s.type,
        s.loc,
        ev.startTime,
        s.offsetH,
        s.durH,
        s.desc,
        s.speakers,
      );
    }
  }
  console.log('✅ Sessions & speakers seeded');

  // Archived past event
  const pastHack = await prisma.event.findFirst({ where: { title: 'AASTU Hackathon 2025' } });
  if (!pastHack) {
    const ph = await prisma.event.create({
      data: {
        title: 'AASTU Hackathon 2025',
        description: '48-hour hackathon — previous edition. Archived for historical reference.',
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
      data: { eventId: ph.id, userId: organizer!.id, role: 'Creator', status: 'ACCEPTED' },
    });
    for (const u of [student, student2, student3]) {
      if (u)
        await prisma.registration
          .create({ data: { userId: u.id, eventId: ph.id, statusId: confirmedReg!.id } })
          .catch(() => {});
    }
    for (const f of [
      { userId: student!.id, rating: 5, comment: 'Best event AASTU has ever organized!' },
      { userId: student2!.id, rating: 4, comment: 'Great energy and organization.' },
    ]) {
      await prisma.feedback.create({ data: { ...f, eventId: ph.id } });
    }
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
