import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DatabaseCleaner } from '../utils/database.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserFactory } from '../factories/user.factory';
import * as argon from 'argon2';

describe('AuthModule (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let dbCleaner: DatabaseCleaner;
  let userFactory: UserFactory;

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
  });

  describe('POST /auth/login', () => {
    it('should login a verified user successfully', async () => {
      await userFactory.create({
        email: 'testlogin@example.com',
        passwordHash: await argon.hash('StrongPass123!'),
        isEmailVerified: true
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'testlogin@example.com',
          password: 'StrongPass123!'
        })
        .expect(201); // NestJS POST default is 201

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
      expect(response.body.user).toHaveProperty('email', 'testlogin@example.com');
      
      // Verify session was created
      const session = await prisma.authSession.findFirst({
        where: { userId: response.body.user.id }
      });
      expect(session).toBeTruthy();
    });

    it('should reject login if email is not verified', async () => {
      await userFactory.create({
        email: 'unverified@example.com',
        passwordHash: await argon.hash('StrongPass123!'),
        isEmailVerified: false
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'unverified@example.com',
          password: 'StrongPass123!'
        })
        .expect(401);

      expect(response.body.message).toContain('verify your email first');
    });

    it('should reject login with incorrect password', async () => {
      await userFactory.create({
        email: 'wrongpass@example.com',
        passwordHash: await argon.hash('StrongPass123!'),
        isEmailVerified: true
      });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'wrongpass@example.com',
          password: 'WrongPassword!'
        })
        .expect(401);
    });
  });

  describe('Security Testing', () => {
    it('should prevent access to protected routes without JWT', async () => {
      await request(app.getHttpServer())
        .get('/users/profile') // Assuming /users/profile is protected
        .expect(401);
    });

    it('should prevent access with tampered JWT', async () => {
      const tamperedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid_signature_here';
      
      await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${tamperedToken}`)
        .expect(401);
    });
  });
});
