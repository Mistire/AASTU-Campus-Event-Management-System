/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parse } from 'csv-parse/sync';

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async importCsv(eventId: string, userId: string, fileBuffer: Buffer) {
    // Verify event exists and user is organizer
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        status: true,
        organizers: { where: { userId, status: 'ACCEPTED' } },
      },
    });

    if (!event) throw new NotFoundException(`Event with ID ${eventId} not found`);
    if (event.createdBy !== userId && event.organizers.length === 0) {
      throw new ForbiddenException('Only event organizers can send invitations');
    }

    const allowedStatuses = ['APPROVED', 'LIVE'];
    if (!allowedStatuses.includes(event.status.statusName)) {
      throw new ForbiddenException(
        `Cannot send invitations for events in "${event.status.statusName}" status`,
      );
    }

    // Parse CSV
    let records: any[];
    try {
      records = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch {
      throw new BadRequestException('Invalid CSV file format');
    }

    // Extract emails from CSV
    const emails: string[] = [];
    for (const record of records) {
      const email = record.email || record.Email || record.EMAIL;
      if (email && typeof email === 'string' && email.includes('@')) {
        emails.push(email.trim().toLowerCase());
      }
    }

    if (emails.length === 0) {
      throw new BadRequestException(
        'No valid emails found in CSV. Ensure the file has an "email" column.',
      );
    }

    const uniqueEmails = [...new Set(emails)];

    const registeredUsers = await this.prisma.user.findMany({
      where: { email: { in: uniqueEmails } },
      select: { id: true, email: true },
    });
    const userMap = new Map(registeredUsers.map((u) => [u.email, u.id]));

    const existingInvites = await this.prisma.eventInvites.findMany({
      where: {
        eventId,
        invitedEmail: { in: uniqueEmails },
      },
      select: { invitedEmail: true },
    });
    const existingEmails = new Set(existingInvites.map((i) => i.invitedEmail));

    // Create new invitations
    const newInvites: any[] = [];
    const notifications: any[] = [];
    const skipped: string[] = [];

    for (const email of uniqueEmails) {
      if (existingEmails.has(email)) {
        skipped.push(email);
        continue;
      }

      const matchedUserId = userMap.get(email) || null;

      newInvites.push({
        eventId,
        userId: matchedUserId,
        invitedEmail: email,
        invitedBy: userId,
        status: 'PENDING',
      });

      if (matchedUserId) {
        notifications.push({
          userId: matchedUserId,
          title: 'Event Invitation',
          message: `You've been invited to "${event.title}". Check your invitations to respond.`,
          type: 'EVENT_INVITATION',
        });
      }
    }

    if (newInvites.length > 0) {
      await this.prisma.eventInvites.createMany({ data: newInvites });
    }

    if (notifications.length > 0) {
      await this.prisma.notification.createMany({ data: notifications });
    }

    return {
      message: 'Invitations processed',
      total: uniqueEmails.length,
      created: newInvites.length,
      skippedDuplicates: skipped.length,
      matchedUsers: registeredUsers.length,
      unmatchedEmails: uniqueEmails.length - registeredUsers.length,
    };
  }

  async findAllByEvent(eventId: string) {
    return this.prisma.eventInvites.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, fullName: true, email: true, profileImage: true } },
        inviter: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async respond(inviteId: string, userId: string, accept: boolean) {
    const invite = await this.prisma.eventInvites.findUnique({
      where: { id: inviteId },
      include: { event: true },
    });

    if (!invite) throw new NotFoundException(`Invitation with ID ${inviteId} not found`);
    if (invite.userId !== userId) {
      throw new ForbiddenException('You can only respond to your own invitations');
    }
    if (invite.status !== 'PENDING') {
      throw new BadRequestException(`Invitation already ${invite.status.toLowerCase()}`);
    }

    const newStatus = accept ? 'ACCEPTED' : 'REJECTED';

    const updated = await this.prisma.eventInvites.update({
      where: { id: inviteId },
      data: {
        status: newStatus,
        respondedAt: new Date(),
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: invite.invitedBy,
        title: 'Invitation Response',
        message: `Your invitation for "${invite.event.title}" was ${newStatus.toLowerCase()} by a user.`,
        type: 'INVITATION_RESPONSE',
      },
    });

    return updated;
  }

  async cancel(inviteId: string, userId: string) {
    const invite = await this.prisma.eventInvites.findUnique({
      where: { id: inviteId },
    });

    if (!invite) throw new NotFoundException(`Invitation with ID ${inviteId} not found`);
    if (invite.invitedBy !== userId) {
      throw new ForbiddenException('Only the invitation sender can cancel it');
    }
    if (invite.status !== 'PENDING') {
      throw new BadRequestException('Can only cancel pending invitations');
    }

    return this.prisma.eventInvites.delete({ where: { id: inviteId } });
  }
}
