/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSessionDto } from './dto/management.dto';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSessionDto) {
    return this.prisma.eventSessions.create({
      data: {
        eventId: dto.eventId,
        title: dto.title,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
      },
    });
  }

  async findAllByEvent(eventId: string) {
    return this.prisma.eventSessions.findMany({ where: { eventId } });
  }

  async remove(id: string) {
    return this.prisma.eventSessions.delete({ where: { id } });
  }
}
