import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsService } from './departments.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  department: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('DepartmentsService', () => {
  let service: DepartmentsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a department', async () => {
      mockPrismaService.department.create.mockResolvedValueOnce({ id: '1', name: 'CS' });
      const result = await service.create({ name: 'CS' });
      expect(result).toHaveProperty('id', '1');
    });
  });

  describe('findAll', () => {
    it('should return all departments', async () => {
      mockPrismaService.department.findMany.mockResolvedValueOnce([{ id: '1' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.department.findUnique.mockResolvedValueOnce(null);
      await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });

    it('should return the department', async () => {
      mockPrismaService.department.findUnique.mockResolvedValueOnce({ id: '1' });
      const result = await service.findOne('1');
      expect(result).toHaveProperty('id', '1');
    });
  });

  describe('update', () => {
    it('should update department', async () => {
      mockPrismaService.department.findUnique.mockResolvedValueOnce({ id: '1' });
      mockPrismaService.department.update.mockResolvedValueOnce({ id: '1', name: 'SE' });
      const result = await service.update('1', { name: 'SE' });
      expect(result.name).toBe('SE');
    });
  });

  describe('remove', () => {
    it('should remove department', async () => {
      mockPrismaService.department.findUnique.mockResolvedValueOnce({ id: '1' });
      mockPrismaService.department.delete.mockResolvedValueOnce({ id: '1' });
      const result = await service.remove('1');
      expect(result).toHaveProperty('id', '1');
    });
  });
});
