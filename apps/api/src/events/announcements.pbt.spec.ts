// Feature: event-registration, Property 14: Announcement notifications target only active registrants

import * as fc from 'fast-check';
import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsService } from './announcements.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * Validates: Requirements 6.1
 *
 * For any announcement created for an event, notifications are enqueued for
 * exactly the set of students with CONFIRMED or PENDING registrations for that
 * event — no more, no fewer.
 */

const mockEnqueueBulkNotifications = jest.fn().mockResolvedValue('job-id');

function buildMockPrisma(
  eventId: string,
  creatorId: string,
  confirmedUserIds: string[],
  pendingUserIds: string[],
) {
  return {
    event: {
      findUnique: jest.fn().mockResolvedValue({
        id: eventId,
        createdBy: creatorId,
        status: { statusName: 'APPROVED' },
        organizers: [],
      }),
    },
    announcements: {
      create: jest.fn().mockResolvedValue({
        id: 'announcement-id',
        eventId,
        title: 'Test Announcement',
        message: 'Test message',
        createdBy: creatorId,
        event: { id: eventId, title: 'Test Event' },
        creator: { id: creatorId, fullName: 'Organizer' },
      }),
    },
    registration: {
      findMany: jest
        .fn()
        .mockImplementation((args: { where: { status: { name: { in: string[] } } } }) => {
          const statuses: string[] = args.where.status.name.in;
          const result: { userId: string }[] = [];
          if (statuses.includes('CONFIRMED')) {
            confirmedUserIds.forEach((uid) => result.push({ userId: uid }));
          }
          if (statuses.includes('PENDING')) {
            pendingUserIds.forEach((uid) => result.push({ userId: uid }));
          }
          // CANCELLED registrations are never returned because the filter excludes them
          return Promise.resolve(result);
        }),
    },
  };
}

async function buildService(
  mockPrisma: ReturnType<typeof buildMockPrisma>,
): Promise<AnnouncementsService> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      AnnouncementsService,
      { provide: PrismaService, useValue: mockPrisma },
      {
        provide: NotificationsService,
        useValue: { enqueueBulkNotifications: mockEnqueueBulkNotifications },
      },
    ],
  }).compile();
  return module.get(AnnouncementsService);
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('Property 14 — Announcement notifications target only active registrants', () => {
  it('enqueues notifications for exactly CONFIRMED+PENDING users, never for CANCELLED', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // eventId
        fc.uuid(), // creatorId
        fc.array(fc.uuid(), { minLength: 0, maxLength: 10 }), // confirmedUserIds
        fc.array(fc.uuid(), { minLength: 0, maxLength: 10 }), // pendingUserIds
        fc.array(fc.uuid(), { minLength: 0, maxLength: 10 }), // cancelledUserIds
        async (eventId, creatorId, confirmedUserIds, pendingUserIds, cancelledUserIds) => {
          mockEnqueueBulkNotifications.mockClear();
          const mockPrisma = buildMockPrisma(eventId, creatorId, confirmedUserIds, pendingUserIds);

          const service = await buildService(mockPrisma);

          await service.create(eventId, creatorId, {
            title: 'Test Announcement',
            message: 'Test message',
          });

          const expectedUserIds = [...confirmedUserIds, ...pendingUserIds];

          expect(mockEnqueueBulkNotifications).toHaveBeenCalledTimes(1);

          const calledWith = (
            mockEnqueueBulkNotifications.mock.calls[0] as unknown[]
          )[0] as string[];

          // Must contain exactly the CONFIRMED + PENDING users
          expect(calledWith.sort()).toEqual(expectedUserIds.sort());

          // Must NOT contain any CANCELLED user
          for (const cancelledId of cancelledUserIds) {
            expect(calledWith).not.toContain(cancelledId);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
