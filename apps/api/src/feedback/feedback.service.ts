import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FeedbackService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.feedback.findMany({
            include: {
                user: { select: { fullName: true, email: true } },
                event: { select: { title: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async remove(id: string) {
        return this.prisma.feedback.delete({
            where: { id }
        });
    }
}
