/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InviteOrganizerDto } from './dto/invitation.dto';

@Injectable()
export class OrganizersService {
  constructor(private readonly prisma: PrismaService) {}

  async invite(eventId: string, inviterId: string, dto: InviteOrganizerDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizers: { where: { userId: inviterId, status: 'ACCEPTED' } },
      },
    });

    if (!event) throw new NotFoundException(`Event with ID ${eventId} not found`);
    if (event.createdBy !== inviterId && event.organizers.length === 0) {
      throw new ForbiddenException('Only event organizers can invite other organizers');
    }

    const existing = await this.prisma.eventOrganizers.findUnique({
      where: { eventId_userId: { eventId, userId: dto.userId } },
    });

    if (existing) {
      throw new ConflictException(
        'User is already an organizer or has a pending invitation for this event',
      );
    }

    const invitedUser = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { id: true, fullName: true },
    });
    if (!invitedUser) throw new NotFoundException(`User with ID ${dto.userId} not found`);

    const organizer = await this.prisma.eventOrganizers.create({
      data: {
        eventId,
        userId: dto.userId,
        role: dto.role || 'Co-Organizer',
        status: 'PENDING',
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: 'Organizer Invitation',
        message: `You've been invited to co-organize "${event.title}".`,
        type: 'ORGANIZER_INVITATION',
      },
    });

    return organizer;
  }

  async respond(organizerId: string, userId: string, accept: boolean) {
    const organizer = await this.prisma.eventOrganizers.findUnique({
      where: { id: organizerId },
      include: { event: true },
    });

    if (!organizer)
      throw new NotFoundException(`Organizer record with ID ${organizerId} not found`);
    if (organizer.userId !== userId) {
      throw new ForbiddenException('You can only respond to your own organizer invitations');
    }
    if (organizer.status !== 'PENDING') {
      throw new BadRequestException(`Invitation already ${organizer.status.toLowerCase()}`);
    }

    const newStatus = accept ? 'ACCEPTED' : 'REJECTED';

    const updated = await this.prisma.eventOrganizers.update({
      where: { id: organizerId },
      data: {
        status: newStatus,
        respondedAt: new Date(),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!organizer.event.createdBy) {
      throw new BadRequestException('Event creator not found');
    }

    await this.prisma.notification.create({
      data: {
        userId: organizer.event.createdBy,
        title: 'Organizer Response',
        message: `Your co-organizer invitation for "${organizer.event.title}" was ${newStatus.toLowerCase()}.`,
        type: 'ORGANIZER_RESPONSE',
      },
    });

    return updated;
  }

  async findAllByEvent(eventId: string, includeAll = false) {
    const where: any = { eventId };
    if (!includeAll) {
      where.status = 'ACCEPTED';
    }

    return this.prisma.eventOrganizers.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, profileImage: true } },
      },
    });
  }

  async findMyInvitations(userId: string) {
    return this.prisma.eventOrganizers.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            venue: { select: { name: true, building: true } },
            creator: { select: { id: true, fullName: true } },
          },
        },
      },
      orderBy: { invitedAt: 'desc' },
    });
  }

  private async assertOrganizerOrCreator(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizers: { where: { userId, status: 'ACCEPTED' } },
      },
    });
    if (!event) throw new NotFoundException(`Event with ID ${eventId} not found`);
    if (event.createdBy !== userId && event.organizers.length === 0) {
      throw new ForbiddenException('Only event organizers can manage this event team');
    }
    return event;
  }

  async remove(id: string, userId: string) {
    const organizer = await this.prisma.eventOrganizers.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!organizer) throw new NotFoundException(`Organizer record with ID ${id} not found`);

    if (organizer.userId === organizer.event.createdBy) {
      throw new BadRequestException('Cannot remove the event creator from organizers');
    }

    // Allow the person themselves OR any other organizer/creator to remove them
    const isSelf = organizer.userId === userId;
    if (!isSelf) {
      await this.assertOrganizerOrCreator(organizer.eventId, userId);
    }

    return this.prisma.eventOrganizers.delete({ where: { id } });
  }
}
