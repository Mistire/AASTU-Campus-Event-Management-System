import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrganizerDto } from './dto/management.dto';

@Injectable()
export class OrganizersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateOrganizerDto) {
        return this.prisma.eventOrganizers.create({
            data: {
                eventId: dto.eventId,
                userId: dto.userId,
                role: dto.role,
            },
        });
    }

    async findAllByEvent(eventId: string) {
        return this.prisma.eventOrganizers.findMany({
            where: { eventId },
            include: { user: true },
        });
    }

    async remove(id: string) {
        return this.prisma.eventOrganizers.delete({ where: { id } });
    }
}
