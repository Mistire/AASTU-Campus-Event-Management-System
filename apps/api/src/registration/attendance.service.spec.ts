import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';

const mockPrismaService = {
  attendance: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockAnalyticsService = {
  invalidateEventCache: jest.fn(),
};

describe('AttendanceService', () => {
  let service: AttendanceService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AnalyticsService, useValue: mockAnalyticsService },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create attendance and invalidate cache', async () => {
      mockPrismaService.attendance.create.mockResolvedValueOnce({ id: 'att1', eventId: 'evt1' });
      const data = { userId: 'usr1', eventId: 'evt1', checkInTime: new Date(), qrToken: 'tok1' };
      
      const result = await service.create(data);
      
      expect(result).toHaveProperty('id', 'att1');
      expect(mockPrismaService.attendance.create).toHaveBeenCalledWith({ data });
      expect(mockAnalyticsService.invalidateEventCache).toHaveBeenCalledWith('evt1');
    });
  });

  describe('update', () => {
    it('should update attendance and invalidate cache', async () => {
      mockPrismaService.attendance.update.mockResolvedValueOnce({ id: 'att1', eventId: 'evt1' });
      const data = { qrToken: 'tok2' };
      
      const result = await service.update('att1', data);
      
      expect(result).toHaveProperty('id', 'att1');
      expect(mockPrismaService.attendance.update).toHaveBeenCalledWith({ where: { id: 'att1' }, data });
      expect(mockAnalyticsService.invalidateEventCache).toHaveBeenCalledWith('evt1');
    });
  });

  describe('remove', () => {
    it('should delete attendance and invalidate cache', async () => {
      mockPrismaService.attendance.delete.mockResolvedValueOnce({ id: 'att1', eventId: 'evt1' });
      
      const result = await service.remove('att1');
      
      expect(result).toHaveProperty('id', 'att1');
      expect(mockPrismaService.attendance.delete).toHaveBeenCalledWith({ where: { id: 'att1' } });
      expect(mockAnalyticsService.invalidateEventCache).toHaveBeenCalledWith('evt1');
    });
  });
});
