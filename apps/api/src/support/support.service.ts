import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketCategory, TicketPriority, TicketStatus } from '@prisma/client';
import { EmailService } from '../auth/email.service';
import { SupportGateway } from './support.gateway';

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly supportGateway: SupportGateway,
  ) {}

  async listTickets() {
    return this.prisma.supportTicket.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async listUserTickets(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      include: {
        _count: {
          select: { messages: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getTicket(ticketId: string) {
    return this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        messages: {
          include: {
            user: {
              select: {
                fullName: true,
                profileImage: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async createTicket(userId: string | null, dto: any) {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId: userId || null,
        guestEmail: dto.guestEmail,
        guestName: dto.guestName,
        subject: dto.subject,
        description: dto.description || dto.message,
        category: dto.category as TicketCategory,
        priority: dto.priority as TicketPriority,
        targetRole: dto.targetRole,
        status: TicketStatus.OPEN,
      },
    });

    // Send acknowledgement email if guest
    if (!userId && ticket.guestEmail) {
      try {
        await this.emailService.sendTicketAcknowledgementEmail(
          ticket.guestEmail,
          ticket.id,
          ticket.subject,
        );
      } catch (error) {
        console.error('Failed to send acknowledgement email:', error);
      }
    }

    return ticket;
  }

  async addMessage(ticketId: string, userId: string | null, message: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { user: true },
    });

    if (!ticket) throw new Error('Ticket not found');

    // Update ticket status to IN_PROGRESS when a reply is added (unless it was already RESOLVED)
    if (ticket.status === TicketStatus.OPEN) {
      await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: TicketStatus.IN_PROGRESS },
      });
    }

    const newMessage = await this.prisma.supportMessage.create({
      data: {
        ticketId,
        userId,
        message,
      },
    });

    // Emit real-time update
    this.supportGateway.emitNewMessage(ticketId, newMessage);

    // Notify user/guest if an admin is replying
    // Admin reply: userId is NOT the ticket owner, AND userId is NOT null (since null means guest reply)
    if (userId !== ticket.userId && userId !== null) {
      const recipientEmail = ticket.user?.email || ticket.guestEmail;
      if (recipientEmail) {
        try {
          await this.emailService.sendSupportReplyEmail(recipientEmail, ticketId, ticket.subject, message);
        } catch (error) {
          console.error('Failed to send support reply email:', error);
        }
      }
    }

    return newMessage;
  }

  async updateStatus(ticketId: string, status: TicketStatus) {
    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status },
    });
  }
}
