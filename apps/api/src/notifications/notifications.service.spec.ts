import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { NotificationType } from './enums/notification-type.enum';

const mockPrismaService = {
  notification: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  },
};

const mockQueue = {
  add: jest.fn(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: typeof mockPrismaService;
  let queue: typeof mockQueue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: getQueueToken('notification'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get(PrismaService);
    queue = module.get(getQueueToken('notification'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllForUser', () => {
    it('should return paginated notifications', async () => {
      const mockData = [{ id: '1', userId: 'user-1', title: 'Test' }];
      prisma.notification.findMany.mockResolvedValue(mockData);
      prisma.notification.count.mockResolvedValue(1);

      const result = await service.findAllForUser('user-1', { page: 1, limit: 10 });

      expect(result.data).toEqual(mockData);
      expect(result.meta.total).toBe(1);
      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });
  });

  describe('markAsRead', () => {
    it('should update isRead if owner matches', async () => {
      prisma.notification.findUnique.mockResolvedValue({ userId: 'user-1' });
      prisma.notification.update.mockResolvedValue({ id: 'notif-1', isRead: true });

      await service.markAsRead('notif-1', 'user-1');

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
        data: { isRead: true },
      });
    });

    it('should throw ForbiddenException if owner does not match', async () => {
      prisma.notification.findUnique.mockResolvedValue({ userId: 'other-user' });

      await expect(service.markAsRead('notif-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if notification does not exist', async () => {
      prisma.notification.findUnique.mockResolvedValue(null);

      await expect(service.markAsRead('notif-1', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('enqueueNotification', () => {
    it('should add a job to the queue', async () => {
      queue.add.mockResolvedValue({ id: 'job-1' });

      const jobId = await service.enqueueNotification(
        'user-1',
        'Title',
        'Message',
        NotificationType.EVENT_APPROVED,
      );

      expect(queue.add).toHaveBeenCalledWith(
        'send-notification',
        expect.objectContaining({ userIds: ['user-1'], title: 'Title' }),
        expect.anything(),
      );
      expect(jobId).toBe('job-1');
    });
  });
});
