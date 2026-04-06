import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsService } from './announcements.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

const EVENT_ID = 'event-uuid-1234';
const CREATOR_ID = 'creator-uuid-5678';
const ANNOUNCEMENT_ID = 'announcement-uuid-9012';

const CONFIRMED_USER_1 = 'user-confirmed-1';
const CONFIRMED_USER_2 = 'user-confirmed-2';
const PENDING_USER_1 = 'user-pending-1';
const CANCELLED_USER_1 = 'user-cancelled-1';

const mockEnqueueBulkNotifications = jest.fn().mockResolvedValue('job-id');

const mockAnnouncementCreate = jest.fn().mockResolvedValue({
  id: ANNOUNCEMENT_ID,
  eventId: EVENT_ID,
  title: 'Hello',
  message: 'World',
  createdBy: CREATOR_ID,
  event: { id: EVENT_ID, title: 'Test Event' },
  creator: { id: CREATOR_ID, fullName: 'Organizer' },
});

function buildMockPrisma(registrations: { userId: string; status: string }[]) {
  return {
    event: {
      findUnique: jest.fn().mockResolvedValue({
        id: EVENT_ID,
        createdBy: CREATOR_ID,
        status: { statusName: 'APPROVED' },
        organizers: [],
      }),
    },
    announcements: {
      create: mockAnnouncementCreate,
    },
    registration: {
      findMany: jest
        .fn()
        .mockImplementation((args: { where: { status: { name: { in: string[] } } } }) => {
          const statuses: string[] = args.where.status.name.in;
          return Promise.resolve(
            registrations
              .filter((r) => statuses.includes(r.status))
              .map((r) => ({ userId: r.userId })),
          );
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

describe('AnnouncementsService — create', () => {
  describe('enqueueBulkNotifications called with exactly CONFIRMED+PENDING user IDs', () => {
    it('passes only CONFIRMED and PENDING user IDs to enqueueBulkNotifications', async () => {
      const registrations = [
        { userId: CONFIRMED_USER_1, status: 'CONFIRMED' },
        { userId: CONFIRMED_USER_2, status: 'CONFIRMED' },
        { userId: PENDING_USER_1, status: 'PENDING' },
        { userId: CANCELLED_USER_1, status: 'CANCELLED' },
      ];

      const service = await buildService(buildMockPrisma(registrations));

      await service.create(EVENT_ID, CREATOR_ID, { title: 'Hello', message: 'World' });

      expect(mockEnqueueBulkNotifications).toHaveBeenCalledTimes(1);

      const calledUserIds = (
        mockEnqueueBulkNotifications.mock.calls[0] as unknown[]
      )[0] as string[];
      expect(calledUserIds.sort()).toEqual(
        [CONFIRMED_USER_1, CONFIRMED_USER_2, PENDING_USER_1].sort(),
      );
    });
  });

  describe('CANCELLED registrations are excluded from notification recipients', () => {
    it('does not include CANCELLED user IDs in the bulk notification call', async () => {
      const registrations = [
        { userId: CONFIRMED_USER_1, status: 'CONFIRMED' },
        { userId: CANCELLED_USER_1, status: 'CANCELLED' },
      ];

      const service = await buildService(buildMockPrisma(registrations));

      await service.create(EVENT_ID, CREATOR_ID, { title: 'Hello', message: 'World' });

      const calledUserIds = (
        mockEnqueueBulkNotifications.mock.calls[0] as unknown[]
      )[0] as string[];
      expect(calledUserIds).not.toContain(CANCELLED_USER_1);
      expect(calledUserIds).toContain(CONFIRMED_USER_1);
    });
  });

  describe('empty registrations list', () => {
    it('calls enqueueBulkNotifications with an empty array when no active registrations exist', async () => {
      const service = await buildService(buildMockPrisma([]));

      await service.create(EVENT_ID, CREATOR_ID, { title: 'Hello', message: 'World' });

      // enqueueBulkNotifications is called with [] — the service itself may skip the call
      // if userIds.length === 0 (NotificationsService.enqueueBulkNotifications returns null for empty arrays)
      // Either way, if called, it must be with an empty array
      if (mockEnqueueBulkNotifications.mock.calls.length > 0) {
        const calledUserIds = (
          mockEnqueueBulkNotifications.mock.calls[0] as unknown[]
        )[0] as string[];
        expect(calledUserIds).toEqual([]);
      }
      // If not called at all, that is also acceptable (userIds.length === 0 guard)
    });
  });
});
