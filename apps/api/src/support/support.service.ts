import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketCategory, TicketPriority, TicketStatus } from '@prisma/client';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

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

  async createTicket(userId: string, dto: any) {
    return this.prisma.supportTicket.create({
      data: {
        userId,
        subject: dto.subject,
        description: dto.description || dto.message,
        category: dto.category as TicketCategory,
        priority: dto.priority as TicketPriority,
        targetRole: dto.targetRole,
        status: TicketStatus.OPEN,
      },
    });
  }

  async addMessage(ticketId: string, userId: string, message: string) {
    // Update ticket status to IN_PROGRESS when a reply is added
    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: TicketStatus.IN_PROGRESS },
    });

    return this.prisma.supportMessage.create({
      data: {
        ticketId,
        userId,
        message,
      },
    });
  }

  async updateStatus(ticketId: string, status: TicketStatus) {
    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status },
    });
  }
}
