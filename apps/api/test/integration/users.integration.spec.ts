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
import { UsersModule } from '../src/users/users.module';
import { DatabaseCleaner } from '../utils/database.util';

describe('Users Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let dbCleaner: DatabaseCleaner;
  let testEmailCounter = Date.now();

  const makeEmail = (prefix: string) => `${prefix}-${testEmailCounter++}@aastu.edu.et`;

  const seedRoleData = async () => {
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

  const createUserAndAccessToken = async (opts?: {
    fullName?: string;
    email?: string;
    phone?: string;
    departmentId?: string;
  }) => {
    const studentRole = await prisma.role.findUniqueOrThrow({ where: { roleName: 'Student' } });

    const email = opts?.email ?? makeEmail('users');
    const passwordHash = await argon.hash('Password123!');

    const user = await prisma.user.create({
      data: {
        fullName: opts?.fullName ?? 'Users Test Student',
        email,
        passwordHash,
        roleId: studentRole.id,
        isEmailVerified: true,
        isCampusIdVerified: true,
        phone: opts?.phone,
        departmentId: opts?.departmentId,
      },
    });

    const loginResponse = await spec()
      .post('/api/auth/login')
      .withBody({ email, password: 'Password123!' })
      .expectStatus(201);

    const body = loginResponse.body as { access_token: string };

    return { user, accessToken: body.access_token };
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppConfigModule, PrismaModule, AuthModule, UsersModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    await app.listen(0);

    const address = app.getHttpServer().address() as AddressInfo;
    request.setBaseUrl(`http://127.0.0.1:${address.port}`);

    prisma = app.get(PrismaService);
    dbCleaner = new DatabaseCleaner(prisma);
  });

  beforeEach(async () => {
    await dbCleaner.cleanDatabase();
    await seedRoleData();
  });

  afterAll(async () => {
    await dbCleaner.cleanDatabase();
    await app.close();
  });

  it('gets and updates my profile', async () => {
    const department = await prisma.department.create({
      data: { name: 'Software Engineering', faculty: 'CoC' },
    });

    const { user, accessToken } = await createUserAndAccessToken({
      fullName: 'Before Update',
      phone: '+251900000111',
      departmentId: department.id,
    });

    await spec()
      .get('/api/users/me')
      .withHeaders({ Authorization: `Bearer ${accessToken}` })
      .expectStatus(200)
      .expectJsonLike({
        id: user.id,
        fullName: 'Before Update',
        email: user.email,
        role: 'Student',
      });

    const updatedDepartment = await prisma.department.create({
      data: { name: 'Electrical Engineering', faculty: 'CoE' },
    });

    await spec()
      .patch('/api/users/me')
      .withHeaders({ Authorization: `Bearer ${accessToken}` })
      .withBody({
        fullName: 'After Update',
        phone: '+251900000222',
        departmentId: updatedDepartment.id,
      })
      .expectStatus(200)
      .expectJsonLike({
        id: user.id,
        fullName: 'After Update',
        phone: '+251900000222',
        department: { id: updatedDepartment.id, name: 'Electrical Engineering' },
      });
  });

  it('gets and updates my interests', async () => {
    const { accessToken } = await createUserAndAccessToken();

    const interest1 = await prisma.interest.create({
      data: { name: 'AI', description: 'Artificial Intelligence' },
    });
    const interest2 = await prisma.interest.create({
      data: { name: 'Security', description: 'Cybersecurity' },
    });

    await spec()
      .get('/api/users/interests')
      .withHeaders({ Authorization: `Bearer ${accessToken}` })
      .expectStatus(200)
      .expectJsonLike({
        selectedInterests: [],
        allInterests: [{ id: interest1.id }, { id: interest2.id }],
      });

    await spec()
      .post('/api/users/interests')
      .withHeaders({ Authorization: `Bearer ${accessToken}` })
      .withBody({ interestIds: [interest1.id, interest2.id] })
      .expectStatus(201)
      .expectJsonLike({
        selectedInterests: [{ id: interest1.id }, { id: interest2.id }],
      });

    await spec()
      .post('/api/users/interests')
      .withHeaders({ Authorization: `Bearer ${accessToken}` })
      .withBody({ interestIds: ['c7ce0ccf-17ca-4b9d-b4cd-a8be2b8769d1'] })
      .expectStatus(400)
      .expectBodyContains('One or more interestIds are invalid');
  });

  it('gets and updates my category preferences', async () => {
    const { accessToken, user } = await createUserAndAccessToken({
      fullName: 'Public Profile User',
    });

    const cat1 = await prisma.category.create({
      data: { name: 'Technology', description: 'Tech events' },
    });
    const cat2 = await prisma.category.create({
      data: { name: 'Business', description: 'Business events' },
    });

    await spec()
      .get('/api/users/categories/preferences')
      .withHeaders({ Authorization: `Bearer ${accessToken}` })
      .expectStatus(200)
      .expectJsonLike({
        selectedCategories: [],
        allCategories: [{ id: cat1.id }, { id: cat2.id }],
      });

    await spec()
      .post('/api/users/categories/preferences')
      .withHeaders({ Authorization: `Bearer ${accessToken}` })
      .withBody({ categoryIds: [cat1.id, cat2.id] })
      .expectStatus(201)
      .expectJsonLike({
        selectedCategories: [{ id: cat1.id }, { id: cat2.id }],
      });

    await spec()
      .post('/api/users/categories/preferences')
      .withHeaders({ Authorization: `Bearer ${accessToken}` })
      .withBody({ categoryIds: ['8d6964dc-4838-46f9-b2d8-9df555e4692a'] })
      .expectStatus(400)
      .expectBodyContains('One or more categoryIds are invalid');

    await prisma.interest.create({ data: { name: 'Robotics', description: 'Robotics topics' } });
    const roboticsInterest = await prisma.interest.findFirstOrThrow({
      where: { name: 'Robotics' },
    });
    await prisma.userInterests.createMany({
      data: [
        {
          userId: user.id,
          interestId: roboticsInterest.id,
        },
      ],
    });

    await spec()
      .get(`/api/users/${user.id}/public`)
      .expectStatus(200)
      .expectJsonLike({
        id: user.id,
        fullName: 'Public Profile User',
        interests: ['Robotics'],
      });
  });
});
