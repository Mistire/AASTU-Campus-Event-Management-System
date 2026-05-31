import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormFieldDto, UpdateFormFieldDto } from './dto/form-field.dto';

@Injectable()
export class FormFieldsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertOrganizerOrCreator(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizers: { where: { userId, status: 'ACCEPTED' } },
      },
    });
    if (!event) throw new NotFoundException(`Event with ID ${eventId} not found`);
    if (event.createdBy !== userId && event.organizers.length === 0) {
      throw new ForbiddenException('Only event organizers can manage form fields');
    }
    return event;
  }

  async create(eventId: string, userId: string, dto: CreateFormFieldDto) {
    await this.assertOrganizerOrCreator(eventId, userId);

    return this.prisma.formFields.create({
      data: {
        eventId,
        fieldLabel: dto.fieldLabel,
        fieldType: dto.fieldType,
        isRequired: dto.isRequired,
      },
    });
  }

  async findAllByEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException(`Event with ID ${eventId} not found`);

    return this.prisma.formFields.findMany({
      where: { eventId },
      include: {
        _count: { select: { responses: true } },
      },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: string) {
    const field = await this.prisma.formFields.findUnique({
      where: { id },
      include: {
        event: { select: { id: true, title: true } },
        _count: { select: { responses: true } },
      },
    });
    if (!field) throw new NotFoundException(`Form field with ID ${id} not found`);
    return field;
  }

  async update(id: string, userId: string, dto: UpdateFormFieldDto) {
    const field = await this.findOne(id);
    await this.assertOrganizerOrCreator(field.eventId, userId);

    return this.prisma.formFields.update({
      where: { id },
      data: {
        ...(dto.fieldLabel && { fieldLabel: dto.fieldLabel }),
        ...(dto.fieldType && { fieldType: dto.fieldType }),
        ...(dto.isRequired !== undefined && { isRequired: dto.isRequired }),
      },
    });
  }

  async remove(id: string, userId: string) {
    const field = await this.findOne(id);
    await this.assertOrganizerOrCreator(field.eventId, userId);

    // Delete responses first, then the field
    await this.prisma.formResponses.deleteMany({ where: { fieldId: id } });
    await this.prisma.formFields.delete({ where: { id } });

    return { message: 'Form field deleted successfully' };
  }
}
