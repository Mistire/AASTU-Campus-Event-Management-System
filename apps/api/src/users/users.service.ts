/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  UpdateMyProfileDto,
  UpdateUserCategoryPreferencesDto,
  UpdateUserInterestsDto,
} from './dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: {
        role: {
          roleName: { in: ['Admin', 'Organizer'] },
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async getMyProfile(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: true,
          department: true,
          userInterests: { include: { interest: true } },
          categoryPreferences: { include: { category: true } },
        },
      });

      if (!user) throw new NotFoundException('User not found');

      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        role: user.role.roleName,
        department: user.department,
        interests: user.userInterests.map((i) => i.interest),
        preferredCategories: user.categoryPreferences.map((c) => c.category),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (err) {
      console.error('UserService.getMyProfile error:', err);
      throw err;
    }
  }

  async updateMyProfile(userId: string, dto: UpdateMyProfileDto) {
    try {
      if (dto.departmentId) {
        const dept = await this.prisma.department.findUnique({ where: { id: dto.departmentId } });
        if (!dept) throw new NotFoundException('Department not found');
      }

      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(dto.fullName !== undefined ? { fullName: dto.fullName } : {}),
          ...(dto.departmentId !== undefined ? { departmentId: dto.departmentId } : {}),
          ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
          ...(dto.profileImage !== undefined ? { profileImage: dto.profileImage } : {}),
        },
        include: {
          role: true,
          department: true,
        },
      });

      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        role: user.role.roleName,
        department: user.department,
        updatedAt: user.updatedAt,
      };
    } catch (err) {
      console.error('UserService.updateMyProfile error:', err);
      throw err;
    }
  }

  async getPublicProfile(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          department: true,
          userInterests: { include: { interest: true } },
        },
      });

      if (!user) throw new NotFoundException('User not found');

      return {
        id: user.id,
        fullName: user.fullName,
        profileImage: user.profileImage,
        department: user.department,
        interests: user.userInterests.map((i) => i.interest.name),
      };
    } catch (err) {
      console.error('UserService.getPublicProfile error:', err);
      throw err;
    }
  }

  async getMyInterests(userId: string) {
    try {
      const [allInterests, selected] = await Promise.all([
        this.prisma.interest.findMany({ orderBy: { name: 'asc' } }),
        this.prisma.userInterests.findMany({
          where: { userId },
          include: { interest: true },
        }),
      ]);

      return {
        selectedInterests: selected.map((x) => x.interest),
        allInterests,
      };
    } catch (err) {
      console.error('UserService.getMyInterests error:', err);
      throw err;
    }
  }

  async updateMyInterests(userId: string, dto: UpdateUserInterestsDto) {
    try {
      if (dto.interestIds.length > 0) {
        const count = await this.prisma.interest.count({
          where: { id: { in: dto.interestIds } },
        });
        if (count !== dto.interestIds.length) {
          throw new BadRequestException('One or more interestIds are invalid');
        }
      }

      await this.prisma.$transaction([
        this.prisma.userInterests.deleteMany({ where: { userId } }),
        this.prisma.userInterests.createMany({
          data: dto.interestIds.map((interestId: any) => ({ userId, interestId })),
        }),
      ]);

      return this.getMyInterests(userId);
    } catch (err) {
      console.error('UserService.updateMyInterests error:', err);
      throw err;
    }
  }

  async getMyCategoryPreferences(userId: string) {
    try {
      const [allCategories, selected] = await Promise.all([
        this.prisma.category.findMany({ orderBy: { name: 'asc' } }),
        this.prisma.userCategoryPreferences.findMany({
          where: { userId },
          include: { category: true },
        }),
      ]);

      return {
        selectedCategories: selected.map((x) => x.category),
        allCategories,
      };
    } catch (err) {
      console.error('UserService.getMyCategoryPreferences error:', err);
      throw err;
    }
  }

  async updateMyCategoryPreferences(userId: string, dto: UpdateUserCategoryPreferencesDto) {
    try {
      if (dto.categoryIds.length > 0) {
        const count = await this.prisma.category.count({
          where: { id: { in: dto.categoryIds } },
        });
        if (count !== dto.categoryIds.length) {
          throw new BadRequestException('One or more categoryIds are invalid');
        }
      }

      await this.prisma.$transaction([
        this.prisma.userCategoryPreferences.deleteMany({ where: { userId } }),
        this.prisma.userCategoryPreferences.createMany({
          data: dto.categoryIds.map((categoryId) => ({ userId, categoryId })),
        }),
      ]);

      return this.getMyCategoryPreferences(userId);
    } catch (err) {
      console.error('UserService.updateMyCategoryPreferences error:', err);
      throw err;
    }
  }
}
