import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockPrismaService = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  department: {
    findUnique: jest.fn(),
  },
  interest: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  userInterests: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  userCategoryPreferences: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  $transaction: jest.fn((cb) => cb),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      mockPrismaService.user.findMany.mockResolvedValueOnce([{ id: '1', fullName: 'Test' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
    });
  });

  describe('getMyProfile', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      await expect(service.getMyProfile('1')).rejects.toThrow(NotFoundException);
    });

    it('should return formatted user profile', async () => {
      const mockUser = {
        id: '1',
        fullName: 'Test User',
        email: 'test@example.com',
        role: { roleName: 'Student' },
        department: { name: 'CS' },
        userInterests: [{ interest: { name: 'AI' } }],
        categoryPreferences: [{ category: { name: 'Tech' } }]
      };
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      
      const result = await service.getMyProfile('1');
      expect(result.id).toBe('1');
      expect(result.role).toBe('Student');
      expect(result.interests).toHaveLength(1);
    });
  });

  describe('updateMyProfile', () => {
    it('should throw NotFoundException if department not found', async () => {
      mockPrismaService.department.findUnique.mockResolvedValueOnce(null);
      await expect(service.updateMyProfile('1', { departmentId: 'invalid' })).rejects.toThrow(NotFoundException);
    });

    it('should update profile successfully', async () => {
      mockPrismaService.department.findUnique.mockResolvedValueOnce({ id: 'dept1' });
      mockPrismaService.user.update.mockResolvedValueOnce({
        id: '1', fullName: 'New Name', role: { roleName: 'Student' }
      });

      const result = await service.updateMyProfile('1', { fullName: 'New Name', departmentId: 'dept1' });
      expect(result.fullName).toBe('New Name');
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });
  });

  describe('updateMyInterests', () => {
    it('should throw BadRequestException if interests are invalid', async () => {
      mockPrismaService.interest.count.mockResolvedValueOnce(0); // none found
      await expect(service.updateMyInterests('1', { interestIds: ['invalid'] })).rejects.toThrow(BadRequestException);
    });

    it('should update interests successfully', async () => {
      mockPrismaService.interest.count.mockResolvedValueOnce(1); // 1 found
      mockPrismaService.interest.findMany.mockResolvedValueOnce([{ id: 'valid', name: 'Tech' }]);
      mockPrismaService.userInterests.findMany.mockResolvedValueOnce([{ interest: { name: 'Tech' } }]);

      const result = await service.updateMyInterests('1', { interestIds: ['valid'] });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result.selectedInterests).toHaveLength(1);
    });
  });
});
