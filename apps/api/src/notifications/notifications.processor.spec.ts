import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { NotificationsProcessor } from './notifications.processor';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationJobData } from './notifications.service';
import { NotificationType } from './enums/notification-type.enum';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildJob(data: NotificationJobData): Job<NotificationJobData> {
  return {
    id: 'job-test-1',
    name: 'send-notification',
    data,
  } as unknown as Job<NotificationJobData>;
}

// ─── Setup ────────────────────────────────────────────────────────────────────

describe('NotificationsProcessor', () => {
  let processor: NotificationsProcessor;
  let prismaCreateMany: jest.Mock;
  let prismaFindMany: jest.Mock;
  let emitToUser: jest.Mock;

  const createdAt = new Date('2024-06-01T10:00:00.000Z');

  beforeEach(async () => {
    prismaCreateMany = jest.fn();
    prismaFindMany = jest.fn();
    emitToUser = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsProcessor,
        {
          provide: PrismaService,
          useValue: {
            notification: {
              createMany: prismaCreateMany,
              findMany: prismaFindMany,
            },
          },
        },
        {
          provide: NotificationsGateway,
          useValue: { emitToUser },
        },
      ],
    }).compile();

    processor = module.get<NotificationsProcessor>(NotificationsProcessor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── 1. Persists to DB and emits to each userId ─────────────────────────────

  describe('process — persists and emits', () => {
    it('calls createMany with all userIds and calls emitToUser for each userId', async () => {
      const userIds = ['user-1', 'user-2', 'user-3'];
      const jobData: NotificationJobData = {
        userIds,
        title: 'Event Reminder',
        message: 'Your event starts soon.',
        type: NotificationType.ANNOUNCEMENT,
      };

      prismaCreateMany.mockResolvedValue({ count: 3 });
      prismaFindMany.mockResolvedValue(
        userIds.map((userId) => ({ id: `notif-${userId}`, userId, createdAt })),
      );

      await processor.process(buildJob(jobData));

      expect(prismaCreateMany).toHaveBeenCalledWith({
        data: userIds.map((userId) => ({
          userId,
          title: jobData.title,
          message: jobData.message,
          type: jobData.type,
        })),
      });

      expect(emitToUser).toHaveBeenCalledTimes(userIds.length);
      for (const userId of userIds) {
        expect(emitToUser).toHaveBeenCalledWith(
          userId,
          expect.objectContaining({ id: `notif-${userId}` }),
        );
      }
    });

    it('does not call emitToUser when userIds is empty', async () => {
      const jobData: NotificationJobData = {
        userIds: [],
        title: 'Empty',
        message: 'No recipients.',
        type: NotificationType.ANNOUNCEMENT,
      };

      prismaCreateMany.mockResolvedValue({ count: 0 });
      prismaFindMany.mockResolvedValue([]);

      await processor.process(buildJob(jobData));

      expect(emitToUser).not.toHaveBeenCalled();
    });
  });

  // ── 2. Emitted payload shape ───────────────────────────────────────────────

  describe('process — emitted payload shape', () => {
    it('emitted payload contains id, title, message, type, and createdAt', async () => {
      const userId = 'user-payload-test';
      const jobData: NotificationJobData = {
        userIds: [userId],
        title: 'Registration Approved',
        message: 'You have been approved.',
        type: NotificationType.REGISTRATION_APPROVED,
      };

      prismaCreateMany.mockResolvedValue({ count: 1 });
      prismaFindMany.mockResolvedValue([{ id: 'notif-abc', userId, createdAt }]);

      await processor.process(buildJob(jobData));

      expect(emitToUser).toHaveBeenCalledWith(userId, {
        id: 'notif-abc',
        title: jobData.title,
        message: jobData.message,
        type: jobData.type,
        createdAt,
      });

      const [, payload] = emitToUser.mock.calls[0] as [string, Record<string, unknown>];
      expect(typeof payload.id).toBe('string');
      expect(typeof payload.title).toBe('string');
      expect(typeof payload.message).toBe('string');
      expect(typeof payload.type).toBe('string');
      expect(payload.createdAt).toBeInstanceOf(Date);
    });
  });

  // ── 3. Error propagation ───────────────────────────────────────────────────

  describe('process — error handling', () => {
    it('rethrows errors from prisma so BullMQ can handle retries', async () => {
      const jobData: NotificationJobData = {
        userIds: ['user-err'],
        title: 'Fail',
        message: 'This will fail.',
        type: NotificationType.ANNOUNCEMENT,
      };

      prismaCreateMany.mockRejectedValue(new Error('DB connection lost'));

      await expect(processor.process(buildJob(jobData))).rejects.toThrow('DB connection lost');
      expect(emitToUser).not.toHaveBeenCalled();
    });
  });
});
