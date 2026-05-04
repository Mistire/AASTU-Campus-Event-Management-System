import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  async bookmarkEvent(userId: string, eventId: string) {
    const existing = await this.prisma.eventBookmark.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    if (existing) {
      throw new ConflictException('Event already bookmarked');
    }

    return this.prisma.eventBookmark.create({
      data: { userId, eventId },
      include: {
        event: {
          include: {
            venue: true,
            status: true,
            media: { where: { mediaType: 'THUMBNAIL' } },
            _count: { select: { registrations: true } },
            eventType: true,
          },
        },
      },
    });
  }

  async unbookmarkEvent(userId: string, eventId: string) {
    const existing = await this.prisma.eventBookmark.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    if (!existing) {
      throw new NotFoundException('Bookmark not found');
    }

    return this.prisma.eventBookmark.delete({
      where: {
        userId_eventId: { userId, eventId },
      },
    });
  }

  async getMyBookmarks(userId: string) {
    return this.prisma.eventBookmark.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            venue: true,
            status: true,
            media: { where: { mediaType: 'THUMBNAIL' } },
            eventType: true,
            _count: { select: { registrations: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async isBookmarked(userId: string, eventId: string) {
    const bookmark = await this.prisma.eventBookmark.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });
    return !!bookmark;
  }
}
