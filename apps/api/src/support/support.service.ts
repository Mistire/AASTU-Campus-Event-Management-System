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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createTicket(userId: string, dto: any) {
    return this.prisma.supportTicket.create({
      data: {
        userId,
        subject: dto.subject,
        category: dto.category as TicketCategory,
        priority: dto.priority as TicketPriority,
        status: TicketStatus.OPEN,
      },
    });
  }
}
