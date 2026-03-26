import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventStatusService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.eventStatus.findMany();
    }
}
