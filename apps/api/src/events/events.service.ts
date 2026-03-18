import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto';

@Injectable()
export class EventsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateEventDto) {
        return this.prisma.event.create({
            data: {
                title: dto.title,
                description: dto.description,
                categoryId: dto.categoryId,
                statusId: dto.statusId,
                venueId: dto.venueId,
                startTime: new Date(dto.startTime),
                endTime: new Date(dto.endTime),
                capacity: dto.capacity,
            },
            include: {
                category: true,
                venue: true,
                status: true,
            },
        });
    }

    async findAll() {
        return this.prisma.event.findMany({
            include: {
                category: true,
                venue: true,
                status: true,
            },
        });
    }

    async findOne(id: string) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: {
                category: true,
                venue: true,
                status: true,
                sessions: true,
                organizers: { include: { user: true } },
                tags: { include: { tag: true } },
                media: true,
            },
        });

        if (!event) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }

        return event;
    }

    async update(id: string, dto: UpdateEventDto) {
        await this.findOne(id); // Ensure exists

        return this.prisma.event.update({
            where: { id },
            data: {
                ...dto,
                startTime: dto.startTime ? new Date(dto.startTime) : undefined,
                endTime: dto.endTime ? new Date(dto.endTime) : undefined,
            },
            include: {
                category: true,
                venue: true,
                status: true,
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id); // Ensure exists

        return this.prisma.event.delete({
            where: { id },
        });
    }
}
