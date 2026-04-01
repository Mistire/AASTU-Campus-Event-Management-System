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
      const result = await this.prisma.notification.createMany({
        data: userIds.map((userId) => ({
          userId,
          title,
          message,
          type,
        })),
      });

      this.logger.log(`Successfully persisted ${result.count} notifications for job ${job.id}`);

      // 2. Real-time delivery (WebSocket)
      for (const userId of userIds) {
        this.notificationsGateway.emitToUser(userId, {
          title,
          message,
          type,
          createdAt: new Date(),
        } as NotificationPayload);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Notification job ${job.id} failed: ${errorMessage}`);
      throw error; // Let BullMQ handle retries as configured in the service
    }
  }
}
