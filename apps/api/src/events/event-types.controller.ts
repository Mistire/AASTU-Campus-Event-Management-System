import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EventTypesService } from './event-types.service';
import { CreateEventTypeDto, UpdateEventTypeDto } from './dto/event-type.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { Roles } from '../auth/decorator';

@ApiTags('Event Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('event-types')
export class EventTypesController {
  constructor(private readonly eventTypesService: EventTypesService) {}

  @Post()
  @Roles('Admin', 'Organizer')
  @ApiOperation({ summary: 'Create a new event type (Admin, Organizer)' })
  @ApiResponse({ status: 201, description: 'Event type created.' })
  @ApiResponse({ status: 409, description: 'Event type with this name already exists.' })
  create(@Body() dto: CreateEventTypeDto) {
    return this.eventTypesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all event types' })
  findAll() {
    return this.eventTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single event type by ID' })
  findOne(@Param('id') id: string) {
    return this.eventTypesService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update an event type (Admin only)' })
  @ApiResponse({ status: 409, description: 'Event type with this name already exists.' })
  update(@Param('id') id: string, @Body() dto: UpdateEventTypeDto) {
    return this.eventTypesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete an event type (Admin only)' })
  @ApiResponse({ status: 400, description: 'Cannot delete - events are using this type.' })
  remove(@Param('id') id: string) {
    return this.eventTypesService.remove(id);
  }
}
