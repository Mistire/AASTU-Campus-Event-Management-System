import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InterestService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.interest.findMany({
            include: {
                _count: {
                    select: { userInterests: true }
                }
            }
        });
    }

    async create(dto: { name: string; description?: string }) {
        return this.prisma.interest.create({
            data: dto
        });
    }

    async remove(id: string) {
        return this.prisma.interest.delete({
            where: { id }
        });
    }
}
