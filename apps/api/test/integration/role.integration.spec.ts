import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DatabaseCleaner } from '../utils/database.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserFactory } from '../factories/user.factory';

describe('RoleModule (Integration)', () => {
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

    // Create an Admin user to perform role operations
    const adminRole = await prisma.role.create({
      data: { roleName: 'ADMIN', description: 'Administrator' }
    });
    
    // Assign role:create permission
    const perm = await prisma.permission.create({
      data: { name: 'role:create', description: 'Create Roles' }
    });
    
    await prisma.rolePermission.create({
      data: { roleId: adminRole.id, permissionId: perm.id }
    });

    const admin = await userFactory.create({ roleId: adminRole.id, isEmailVerified: true });
    
    // Login to get token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: admin.email, password: 'Password123!' });
      
    adminToken = loginRes.body.access_token;
  });

  describe('POST /roles', () => {
    it('should create a new role', async () => {
      const response = await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roleName: 'ORGANIZER',
          description: 'Event Organizer'
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.roleName).toBe('ORGANIZER');
      
      const roleInDb = await prisma.role.findUnique({ where: { id: response.body.id } });
      expect(roleInDb).toBeTruthy();
    });

    it('should prevent creating a duplicate role', async () => {
      await prisma.role.create({ data: { roleName: 'DUPLICATE' }});
      
      await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roleName: 'DUPLICATE'
        })
        .expect(409); // Conflict
    });
  });

  describe('GET /roles', () => {
    it('should fetch all roles', async () => {
      await prisma.role.create({ data: { roleName: 'GUEST' }});
      
      const response = await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2); // ADMIN + GUEST
    });
  });
});
