import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationJobData } from './notifications.service';
import { NotificationsGateway, NotificationPayload } from './notifications.gateway';

@Processor('notification')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    const { userIds, title, message, type } = job.data;

    try {
      // 1. Persist to Database
      await this.prisma.notification.createMany({
        data: userIds.map((userId) => ({
          userId,
          title,
          message,
          type,
        })),
      });

      // Fetch created records to obtain their id and createdAt values
      const created = await this.prisma.notification.findMany({
        where: { userId: { in: userIds }, title, message, type },
        orderBy: { createdAt: 'desc' },
        take: userIds.length,
        select: { id: true, userId: true, createdAt: true },
      });

      this.logger.log(`Successfully persisted ${created.length} notifications for job ${job.id}`);

      // 2. Real-time delivery (WebSocket)
      for (const userId of userIds) {
        const record = created.find((n) => n.userId === userId);
        if (!record) continue;
        this.notificationsGateway.emitToUser(userId, {
          id: record.id,
          title,
          message,
          type,
          createdAt: record.createdAt,
        } satisfies NotificationPayload);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Notification job ${job.id} failed: ${errorMessage}`);
      throw error; // Let BullMQ handle retries as configured in the service
    }
  }
}
