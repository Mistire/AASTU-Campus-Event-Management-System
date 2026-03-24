/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpeakerDto, UpdateSpeakerDto } from './dto/speaker.dto';

@Injectable()
export class SpeakersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSpeakerDto) {
    return this.prisma.speaker.create({
      data: {
        fullName: dto.fullName,
        bio: dto.bio,
        profileImage: dto.profileImage,
        organization: dto.organization,
      },
    });
  }

  async findAll() {
    return this.prisma.speaker.findMany({
      include: {
        sessionSpeakers: {
          include: {
            session: {
              select: { id: true, title: true, eventId: true },
            },
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async findOne(id: string) {
    const speaker = await this.prisma.speaker.findUnique({
      where: { id },
      include: {
        sessionSpeakers: {
          include: {
            session: {
              select: {
                id: true,
                title: true,
                sessionType: true,
                startTime: true,
                endTime: true,
                event: { select: { id: true, title: true } },
              },
            },
          },
        },
      },
    });

    if (!speaker) throw new NotFoundException(`Speaker with ID ${id} not found`);
    return speaker;
  }

  async update(id: string, dto: UpdateSpeakerDto) {
    await this.findOne(id);

    return this.prisma.speaker.update({
      where: { id },
      data: {
        ...(dto.fullName && { fullName: dto.fullName }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.profileImage !== undefined && { profileImage: dto.profileImage }),
        ...(dto.organization !== undefined && { organization: dto.organization }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Remove speaker assignments first, then the speaker
    await this.prisma.sessionSpeakers.deleteMany({ where: { speakerId: id } });
    await this.prisma.speaker.delete({ where: { id } });

    return { message: 'Speaker deleted successfully' };
  }
}
