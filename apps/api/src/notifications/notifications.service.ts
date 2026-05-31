import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationType } from './enums/notification-type.enum';

export interface NotificationJobData {
  userIds: string[];
  title: string;
  message: string;
  type: NotificationType;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  // ──────────────────────────────────────────────────────────
  // READ-SIDE  (called by controller for the current user)
  // ──────────────────────────────────────────────────────────

  async findAllForUser(userId: string, query: NotificationQueryDto) {
    const { page = 1, limit = 20, isRead } = query;
    const skip = (page - 1) * limit;

    const where: { userId: string; isRead?: boolean } = { userId };
    if (isRead !== undefined) where.isRead = isRead;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markAsRead(notificationId: string, userId: string) {
    await this.assertOwnership(notificationId, userId);
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { updated: result.count };
  }

  async deleteOne(notificationId: string, userId: string) {
    await this.assertOwnership(notificationId, userId);
    await this.prisma.notification.delete({ where: { id: notificationId } });
    return { message: 'Notification deleted successfully' };
  }

  // ──────────────────────────────────────────────────────────
  // WRITE-SIDE  (called by processors / other services)
  // ──────────────────────────────────────────────────────────

  /**
   * Enqueue a notification for a single user.
   * Processed asynchronously by NotificationsProcessor.
   */
  async enqueueNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
  ) {
    const job = await this.notificationQueue.add(
      'send-notification',
      { userIds: [userId], title, message, type } satisfies NotificationJobData,
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );
    this.logger.log(`Enqueued notification job ${job.id} for user ${userId}`);
    return job.id;
  }

  /**
   * Enqueue notifications for multiple users (bulk, single job).
   * Processed asynchronously by NotificationsProcessor.
   */
  async enqueueBulkNotifications(
    userIds: string[],
    title: string,
    message: string,
    type: NotificationType,
  ) {
    if (userIds.length === 0) return null;
    const job = await this.notificationQueue.add(
      'send-notification',
      { userIds, title, message, type } satisfies NotificationJobData,
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );
    this.logger.log(`Enqueued bulk notification job ${job.id} for ${userIds.length} users`);
    return job.id;
  }

  // ──────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ──────────────────────────────────────────────────────────

  private async assertOwnership(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true },
    });
    if (!notification) {
      throw new NotFoundException(`Notification ${notificationId} not found`);
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException('You do not own this notification');
    }
  }
}
