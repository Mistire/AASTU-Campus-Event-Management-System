import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async listFeedback() {
    return this.prisma.feedback.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        event: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createFeedback(userId: string, eventId: string, rating: number, comment?: string) {
    return this.prisma.feedback.create({
      data: {
        userId,
        eventId,
        rating,
        comment,
      },
    });
  }
}
