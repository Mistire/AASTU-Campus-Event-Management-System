import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

const mockPrismaService = {
  role: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  permission: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  rolePermission: {
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(async (cb) => {
    return cb(mockPrismaService);
  }),
};

describe('RoleService', () => {
  let service: RoleService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
  });

  describe('Roles', () => {
    it('createRole should throw ConflictException if role exists', async () => {
      mockPrismaService.role.findFirst.mockResolvedValueOnce({ id: '1' });
      await expect(service.createRole({ roleName: 'Admin' })).rejects.toThrow(ConflictException);
    });

    it('createRole should create a new role', async () => {
      mockPrismaService.role.findFirst.mockResolvedValueOnce(null);
      mockPrismaService.role.create.mockResolvedValueOnce({ id: '2', roleName: 'Manager' });
      mockPrismaService.role.findUnique.mockResolvedValueOnce({ id: '2', roleName: 'Manager' });

      const result = await service.createRole({ roleName: 'Manager' });
      expect(result).toHaveProperty('id', '2');
      expect(mockPrismaService.role.create).toHaveBeenCalled();
    });

    it('findAllRoles should return an array', async () => {
      mockPrismaService.role.findMany.mockResolvedValueOnce([{ id: '1' }]);
      const res = await service.findAllRoles();
      expect(res).toHaveLength(1);
    });

    it('findRoleById should throw NotFoundException', async () => {
      mockPrismaService.role.findUnique.mockResolvedValueOnce(null);
      await expect(service.findRoleById('invalid')).rejects.toThrow(NotFoundException);
    });

    it('deleteRole should throw if role has users', async () => {
      mockPrismaService.role.findUnique.mockResolvedValueOnce({ id: '1', users: [{ id: 'u1' }] });
      await expect(service.deleteRole('1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('Permissions', () => {
    it('createPermission should throw ConflictException if name exists', async () => {
      mockPrismaService.permission.findFirst.mockResolvedValueOnce({ id: '1' });
      await expect(service.createPermission({ name: 'read:events' })).rejects.toThrow(ConflictException);
    });

    it('createPermission should create a new permission', async () => {
      mockPrismaService.permission.findFirst.mockResolvedValueOnce(null);
      mockPrismaService.permission.create.mockResolvedValueOnce({ id: '2', name: 'write:events' });

      const result = await service.createPermission({ name: 'write:events' });
      expect(result).toHaveProperty('id', '2');
    });

    it('deletePermission should throw if permission assigned to roles', async () => {
      mockPrismaService.permission.findUnique.mockResolvedValueOnce({ id: '1', roles: [{ id: 'r1' }] });
      await expect(service.deletePermission('1')).rejects.toThrow(BadRequestException);
    });
  });
});
