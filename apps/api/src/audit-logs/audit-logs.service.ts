import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async listLogs() {
    return this.prisma.auditLogs.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.auditLogs.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            role: {
              select: {
                roleName: true
              }
            }
          },
        },
      },
    });
  }

  async createLog(data: {
    userId: string;
    action: string;
    entityType: string;
    entityId?: string;
    role?: string;
    ipAddress?: string;
    userAgent?: string;
    outcome?: 'SUCCESS' | 'FAILURE';
    beforeState?: any;
    afterState?: any;
    details?: string;
    environment?: string;
  }) {
    return this.prisma.auditLogs.create({
      data: {
        ...data,
        environment: data.environment || process.env.NODE_ENV || 'DEVELOPMENT',
      },
    });
  }
}
