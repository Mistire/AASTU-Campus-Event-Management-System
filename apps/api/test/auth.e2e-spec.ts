/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { request, spec } from 'pactum';
import * as argon from 'argon2';
import type { AddressInfo } from 'net';

import { AppConfigModule } from '../src/config/config.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthModule } from '../src/auth/auth.module';
import { EmailService } from '../src/auth/email.service ';

describe('Auth Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testEmailCounter = Date.now();

  const makeEmail = (prefix: string) => `${prefix}-${testEmailCounter++}@aastu.edu.et`;

  const seedAuthRoleData = async () => {
    const permissions = [
      { name: 'event:read', description: 'Can read events' },
      { name: 'event:register', description: 'Can register for events' },
    ];

    for (const perm of permissions) {
      await prisma.permission.upsert({
        where: { name: perm.name },
        update: { description: perm.description },
        create: perm,
      });
    }

    const studentRole = await prisma.role.upsert({
      where: { roleName: 'Student' },
      update: {},
      create: {
        roleName: 'Student',
        description: 'Standard Student Participant',
      },
    });

    const allPerms = await prisma.permission.findMany({
      where: { name: { in: permissions.map((p) => p.name) } },
    });

    for (const perm of allPerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: studentRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: studentRole.id,
          permissionId: perm.id,
        },
      });
    }

    return studentRole;
  };

  const cleanAuthTables = async () => {
    await prisma.oneTimeToken.deleteMany();
    await prisma.authSession.deleteMany();
    await prisma.user.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.role.deleteMany();
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppConfigModule, PrismaModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    await app.listen(0);

    const address = app.getHttpServer().address() as AddressInfo;
    request.setBaseUrl(`http://127.0.0.1:${address.port}`);

    prisma = app.get(PrismaService);

    const emailService = app.get(EmailService);
    jest.spyOn(emailService, 'sendVerificationEmail').mockResolvedValue();
    jest.spyOn(emailService, 'sendPasswordResetEmail').mockResolvedValue();
  });

  beforeEach(async () => {
    await cleanAuthTables();
    await seedAuthRoleData();
  });

  afterAll(async () => {
    await cleanAuthTables();
    await app.close();
  });

  it('signs up a user and creates session + verification token', async () => {
    const email = makeEmail('signup');

    const response = await spec()
      .post('/api/auth/signup')
      .withBody({
        fullName: 'Test Student',
        email,
        password: 'Password123!',
      })
      .expectStatus(201);

    const body = response.body as {
      access_token: string;
      refresh_token: string;
      user: { email: string; isEmailVerified: boolean; isCampusIdVerified: boolean };
    };

    expect(body.access_token).toBeDefined();
    expect(body.refresh_token).toBeDefined();
    expect(body.user.email).toBe(email);
    expect(body.user.isEmailVerified).toBe(false);
    expect(body.user.isCampusIdVerified).toBe(false);

    const createdUser = await prisma.user.findUnique({ where: { email } });
    expect(createdUser).not.toBeNull();

    const sessions = await prisma.authSession.findMany({ where: { userId: createdUser!.id } });
    expect(sessions).toHaveLength(1);

    const emailTokens = await prisma.oneTimeToken.findMany({
      where: {
        userId: createdUser!.id,
        type: 'EMAIL_VERIFICATION',
      },
    });

    expect(emailTokens).toHaveLength(1);
  });

  it('rejects login when email is not verified', async () => {
    const studentRole = await prisma.role.findUniqueOrThrow({ where: { roleName: 'Student' } });

    const email = makeEmail('email-unverified');

    const passwordHash = await argon.hash('Password123!');
    await prisma.user.create({
      data: {
        fullName: 'Email Unverified',
        email,
        passwordHash,
        roleId: studentRole.id,
        isEmailVerified: false,
        isCampusIdVerified: true,
      },
    });

    await spec()
      .post('/api/auth/login')
      .withBody({ email, password: 'Password123!' })
      .expectStatus(401)
      .expectBodyContains('Please verify your email first');
  });

  it('supports campus verification, login, refresh, verify-session, and logout', async () => {
    const signupEmail = makeEmail('full-flow');

    const signupResponse = await spec()
      .post('/api/auth/signup')
      .withBody({
        fullName: 'Flow Student',
        email: signupEmail,
        password: 'Password123!',
      })
      .expectStatus(201);

    const signupBody = signupResponse.body as { access_token: string };

    await spec()
      .post('/api/auth/verify-campus-id')
      .withHeaders({ Authorization: `Bearer ${signupBody.access_token}` })
      .withBody({
        qrPayload: 'Flow Student (ETS9999/17) - Software Engineering',
      })
      .expectStatus(201)
      .expectBodyContains('Campus ID verified successfully');

    await spec()
      .post('/api/auth/login')
      .withBody({
        email: signupEmail,
        password: 'Password123!',
      })
      .expectStatus(401)
      .expectBodyContains('Please verify your email first');

    await prisma.user.update({
      where: { email: signupEmail },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    const loginResponse = await spec()
      .post('/api/auth/login')
      .withBody({
        email: signupEmail,
        password: 'Password123!',
      })
      .expectStatus(201);

    const loginBody = loginResponse.body as { access_token: string; refresh_token: string };

    await spec()
      .get('/api/auth/verify-session')
      .withHeaders({ Authorization: `Bearer ${loginBody.access_token}` })
      .expectStatus(200)
      .expectJsonLike({ valid: true });

    const refreshResponse = await spec()
      .post('/api/auth/refresh')
      .withBody({ refreshToken: loginBody.refresh_token })
      .expectStatus(201);

    const refreshBody = refreshResponse.body as { access_token: string; refresh_token: string };
    expect(refreshBody.access_token).toBeDefined();
    expect(refreshBody.refresh_token).toBeDefined();

    await spec()
      .post('/api/auth/logout')
      .withHeaders({ Authorization: `Bearer ${refreshBody.access_token}` })
      .expectStatus(201)
      .expectBodyContains('Logged out successfully');

    await spec()
      .get('/api/auth/verify-session')
      .withHeaders({ Authorization: `Bearer ${refreshBody.access_token}` })
      .expectStatus(401)
      .expectBodyContains('Session expired or revoked');
  });
});
