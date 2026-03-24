/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FormFieldsService } from './form-fields.service';
import { CreateFormFieldDto, UpdateFormFieldDto } from './dto/form-field.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { Roles, GetUser } from '../auth/decorator';
import type { AuthUser } from '../auth/jwt.strategy';

@ApiTags('Event Form Fields')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class FormFieldsController {
  constructor(private readonly formFieldsService: FormFieldsService) {}

  @Post('events/:eventId/form-fields')
  @Roles('Admin', 'Organizer')
  @ApiOperation({ summary: 'Add a custom registration form field to an event (Organizer)' })
  @ApiResponse({ status: 201, description: 'Form field created.' })
  create(
    @Param('eventId') eventId: string,
    @GetUser() user: AuthUser,
    @Body() dto: CreateFormFieldDto,
  ) {
    return this.formFieldsService.create(eventId, user.id, dto);
  }

  @Get('events/:eventId/form-fields')
  @ApiOperation({ summary: 'List all custom form fields for an event' })
  findAllByEvent(@Param('eventId') eventId: string) {
    return this.formFieldsService.findAllByEvent(eventId);
  }

  @Get('form-fields/:id')
  @ApiOperation({ summary: 'Get a form field by ID' })
  findOne(@Param('id') id: string) {
    return this.formFieldsService.findOne(id);
  }

  @Patch('form-fields/:id')
  @Roles('Admin', 'Organizer')
  @ApiOperation({ summary: 'Update a form field (Organizer)' })
  update(
    @Param('id') id: string,
    @GetUser() user: AuthUser,
    @Body() dto: UpdateFormFieldDto,
  ) {
    return this.formFieldsService.update(id, user.id, dto);
  }

  @Delete('form-fields/:id')
  @Roles('Admin', 'Organizer')
  @ApiOperation({ summary: 'Delete a form field and all its responses (Organizer)' })
  remove(@Param('id') id: string, @GetUser() user: AuthUser) {
    return this.formFieldsService.remove(id, user.id);
  }
}
