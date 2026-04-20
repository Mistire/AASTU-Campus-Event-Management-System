const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('--- SYSTEM INSPECTION ---');
  
  // 1. Check Roles
  const roles = await prisma.role.findMany();
  console.log('Roles:', roles.map(r => r.roleName));

  // 2. Check Event Statuses
  const statuses = await prisma.eventStatus.findMany();
  console.log('Event Statuses:', statuses.map(s => s.statusName));

  // 3. Check target event 'Test Event 1'
  const event = await prisma.event.findFirst({
    where: { title: { contains: 'Test Event 1', mode: 'insensitive' } },
    include: { status: true }
  });

  if (event) {
    console.log('Found Event:', {
      title: event.title,
      status: event.status.statusName,
      startTime: event.startTime,
      endTime: event.endTime,
      createdBy: event.createdBy
    });
  } else {
    console.log('Event "Test Event 1" not found!');
  }

  // 4. Try the exact query logic from the service
  const now = new Date();
  console.log('Current Server Time:', now);

  const studentRole = roles.find(r => r.roleName.toUpperCase() === 'STUDENT');
  // Mocking student user logic
  const studentViewWhere = {
    OR: [
      { status: { statusName: { in: ['APPROVED', 'LIVE'] } } }
    ],
    endTime: { gte: now }
  };

  const results = await prisma.event.findMany({
    where: studentViewWhere,
    select: { title: true, status: { select: { statusName: true } } }
  });

  console.log('Query results for simulated Student view:', results);
}

run().catch(console.error).finally(() => prisma.$disconnect());
