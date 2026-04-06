import { ConflictException, Injectable } from '@nestjs/common';
import { EventWaitlist } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';

// Minimal type alias for a Prisma transaction client
export type PrismaTransactionClient = Omit<
  PrismaService,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

@Injectable()
export class WaitlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Adds a student to the waitlist for an event.
   * Checks for an existing entry (conflict if found), computes maxPos + 1
   * atomically, inserts the EventWaitlist record, and enqueues a
   * WAITLIST_JOINED notification with the assigned position.
   * Must be called inside a serializable transaction.
   */
  async addToWaitlist(
    userId: string,
    eventId: string,
    tx: PrismaTransactionClient,
  ): Promise<EventWaitlist> {
    // Check for duplicate waitlist entry
    const existing = await tx.eventWaitlist.findFirst({
      where: { userId, eventId },
    });
    if (existing) {
      throw new ConflictException('User is already on the waitlist for this event');
    }

    // Compute next position atomically within the transaction
    const aggregate = await tx.eventWaitlist.aggregate({
      where: { eventId },
      _max: { position: true },
    });
    const nextPosition = (aggregate._max.position ?? 0) + 1;

    // Insert the waitlist entry
    const entry = await tx.eventWaitlist.create({
      data: {
        userId,
        eventId,
        position: nextPosition,
      },
    });

    // Enqueue WAITLIST_JOINED notification (fire-and-forget, outside tx)
    await this.notificationsService.enqueueNotification(
      userId,
      'Added to Waitlist',
      `You have been added to the waitlist at position ${nextPosition}.`,
      NotificationType.WAITLIST_JOINED,
    );

    return entry;
  }

  /**
   * Promotes the lowest-position waitlist entry for an event (if any).
   * Determines registration status from the event's requiresApproval flag,
   * inserts a Registration, deletes the waitlist entry, and enqueues a
   * WAITLIST_PROMOTED notification.
   * Must be called inside a serializable transaction.
   * Returns the promoted waitlist entry, or null if the waitlist is empty.
   */
  async promoteNext(eventId: string, tx: PrismaTransactionClient): Promise<EventWaitlist | null> {
    // Select the lowest-position entry
    const entry = await tx.eventWaitlist.findFirst({
      where: { eventId },
      orderBy: { position: 'asc' },
    });

    if (!entry) {
      return null;
    }

    // Get the event's requiresApproval flag
    const event = await tx.event.findUnique({
      where: { id: eventId },
      select: { requiresApproval: true },
    });

    // Look up the appropriate registration status
    const statusName = event?.requiresApproval ? 'PENDING' : 'CONFIRMED';
    const status = await tx.registrationStatus.findFirst({
      where: { name: statusName },
    });

    // Create the registration for the promoted user
    await tx.registration.create({
      data: {
        userId: entry.userId,
        eventId,
        statusId: status!.id,
      },
    });

    // Delete the waitlist entry
    await tx.eventWaitlist.delete({
      where: { id: entry.id },
    });

    // Enqueue WAITLIST_PROMOTED notification
    await this.notificationsService.enqueueNotification(
      entry.userId,
      'Promoted from Waitlist',
      'You have been promoted from the waitlist and are now registered for the event.',
      NotificationType.WAITLIST_PROMOTED,
    );

    return entry;
  }

  /**
   * Returns the current waitlist position for a user on an event, or null
   * if the user is not on the waitlist.
   */
  async getPosition(userId: string, eventId: string): Promise<number | null> {
    const entry = await this.prisma.eventWaitlist.findFirst({
      where: { userId, eventId },
      select: { position: true },
    });
    return entry?.position ?? null;
  }
}
