import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsService } from './audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  auditLogs: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

describe('AuditLogsService', () => {
  let service: AuditLogsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuditLogsService>(AuditLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listLogs', () => {
    it('should return paginated logs', async () => {
      mockPrismaService.auditLogs.findMany.mockResolvedValueOnce([{ id: '1', action: 'LOGIN' }]);
      mockPrismaService.auditLogs.count.mockResolvedValueOnce(1);

      const result = await service.listLogs({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should apply search filters', async () => {
      mockPrismaService.auditLogs.findMany.mockResolvedValueOnce([]);
      mockPrismaService.auditLogs.count.mockResolvedValueOnce(0);

      await service.listLogs({ search: 'user1', action: 'LOGIN', outcome: 'SUCCESS' });
      expect(mockPrismaService.auditLogs.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            action: 'LOGIN',
            outcome: 'SUCCESS',
            OR: expect.any(Array),
          })
        })
      );
    });
  });

  describe('findOne', () => {
    it('should return a single log', async () => {
      mockPrismaService.auditLogs.findUnique.mockResolvedValueOnce({ id: '1' });
      const result = await service.findOne('1');
      expect(result).toHaveProperty('id', '1');
    });
  });

  describe('createLog', () => {
    it('should create a log entry', async () => {
      mockPrismaService.auditLogs.create.mockResolvedValueOnce({ id: '1' });
      const result = await service.createLog({
        userId: 'u1',
        action: 'TEST',
        entityType: 'TEST_ENTITY',
      });
      expect(result).toHaveProperty('id', '1');
      expect(mockPrismaService.auditLogs.create).toHaveBeenCalled();
    });
  });
});
