import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AttendanceService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.attendance.findMany({
            include: {
                user: { select: { fullName: true, email: true } },
                event: { select: { title: true } },
                session: { select: { title: true } }
            },
            orderBy: { checkInTime: 'desc' }
        });
    }

    async markAttendance(dto: { userId: string; eventId: string; sessionId?: string; qrToken: string }) {
        return this.prisma.attendance.create({
            data: {
                userId: dto.userId,
                eventId: dto.eventId,
                sessionId: dto.sessionId,
                qrToken: dto.qrToken,
                checkInTime: new Date()
            }
        });
    }
}
