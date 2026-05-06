import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async listLogs(query: any) {
    const { page = 1, limit = 20, search, action, outcome, entityType } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { entityType: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (action) where.action = action;
    if (outcome) where.outcome = outcome;
    if (entityType) where.entityType = entityType;

    const [data, total] = await Promise.all([
      this.prisma.auditLogs.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.auditLogs.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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
