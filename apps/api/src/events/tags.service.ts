/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto, UpdateTagDto, TagQueryDto } from './dto/tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTagDto) {
    const name = this.normalizeName(dto.name);
    await this.checkUniqueName(name);

    return this.prisma.tag.create({
      data: { name },
    });
  }

  async findAll(query: TagQueryDto) {
    const where: any = {};

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    return this.prisma.tag.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return tag;
  }

  async update(id: string, dto: UpdateTagDto) {
    await this.findOne(id);

    if (dto.name) {
      const name = this.normalizeName(dto.name);
      await this.checkUniqueName(name, id);

      return this.prisma.tag.update({
        where: { id },
        data: { name },
      });
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);

    const eventsUsingTag = await this.prisma.eventTags.count({
      where: { tagId: id },
    });

    if (eventsUsingTag > 0) {
      throw new BadRequestException(
        `Cannot delete tag: ${eventsUsingTag} event(s) are using this tag`,
      );
    }

    return this.prisma.tag.delete({ where: { id } });
  }

  private normalizeName(name: string): string {
    let normalized = name.trim();
    if (!normalized.startsWith('#')) {
      normalized = `#${normalized}`;
    }
    return normalized;
  }

  private async checkUniqueName(name: string, excludeId?: string) {
    const existing = await this.prisma.tag.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    if (existing) {
      throw new ConflictException(`Tag with name "${name}" already exists`);
    }
  }
}
