import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVenueDto, UpdateVenueDto } from './dto/venue.dto';

@Injectable()
export class VenuesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateVenueDto) {
        return this.prisma.venue.create({ data: dto });
    }

    async findAll() {
        return this.prisma.venue.findMany();
    }

    async findOne(id: string) {
        const venue = await this.prisma.venue.findUnique({ where: { id } });
        if (!venue) throw new NotFoundException('Venue not found');
        return venue;
    }

    async update(id: string, dto: UpdateVenueDto) {
        await this.findOne(id);
        return this.prisma.venue.update({ where: { id }, data: dto });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.venue.delete({ where: { id } });
    }

    async checkAvailability(venueId: string, startTime: Date, endTime: Date) {
        const conflict = await this.prisma.event.findFirst({
            where: {
                venueId,
                OR: [
                    {
                        startTime: { lte: startTime },
                        endTime: { gte: startTime },
                    },
                    {
                        startTime: { lte: endTime },
                        endTime: { gte: endTime },
                    },
                    {
                        startTime: { gte: startTime },
                        endTime: { lte: endTime },
                    },
                ],
            },
        });

        return !conflict;
    }
}
