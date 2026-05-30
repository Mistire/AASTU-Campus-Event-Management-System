import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DatabaseCleaner } from '../utils/database.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserFactory } from '../factories/user.factory';

describe('Events & Departments Module (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let dbCleaner: DatabaseCleaner;
  let userFactory: UserFactory;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    dbCleaner = new DatabaseCleaner(prisma);
    userFactory = new UserFactory(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await dbCleaner.cleanDatabase();

    const adminRole = await prisma.role.create({
      data: { roleName: 'ADMIN', description: 'Administrator' }
    });

    const admin = await userFactory.create({ roleId: adminRole.id, isEmailVerified: true });
    
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: admin.email, password: 'Password123!' });
      
    adminToken = loginRes.body.access_token;
  });

  describe('Departments API', () => {
    it('should create and retrieve a department', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Computer Science',
          faculty: 'Computing'
        })
        .expect(201);

      expect(createRes.body).toHaveProperty('id');
      expect(createRes.body.name).toBe('Computer Science');

      const getRes = await request(app.getHttpServer())
        .get('/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(getRes.body)).toBe(true);
      expect(getRes.body.some((d: any) => d.id === createRes.body.id)).toBe(true);
    });
  });

  describe('Events API', () => {
    it('should create an event in DRAFT status', async () => {
      // Setup prerequisites: Venue, EventType
      const venue = await prisma.venue.create({ data: { name: 'Main Hall', capacity: 500 } });
      const eventType = await prisma.eventType.create({ data: { name: 'Seminar' } });
      const draftStatus = await prisma.eventStatus.create({ data: { statusName: 'DRAFT' } });

      const createRes = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Integration Test Seminar',
          description: 'A great seminar',
          venueId: venue.id,
          eventTypeId: eventType.id,
          startTime: new Date(Date.now() + 86400000).toISOString(),
          endTime: new Date(Date.now() + 90000000).toISOString(),
          capacity: 100,
        })
        .expect(201);

      expect(createRes.body).toHaveProperty('id');
      expect(createRes.body.statusId).toBe(draftStatus.id);
    });
  });
});
