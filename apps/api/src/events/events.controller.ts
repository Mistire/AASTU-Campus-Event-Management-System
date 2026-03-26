import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import { EventQueryDto } from './dto/event-query.dto';
import { JwtAuthGuard } from 'src/auth/guard';
import { Public } from 'src/auth/decorator';

@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new event' })
    @ApiResponse({ status: 201, description: 'The event has been successfully created.' })
    create(@Body() dto: CreateEventDto) {
        return this.eventsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all events with optional filtering' })
    findAll(@Query() query: EventQueryDto) {
        return this.eventsService.findAll(query);
    }

    @Get('upcoming')
    @ApiOperation({ summary: 'Get upcoming events' })
    getUpcoming() {
        return this.eventsService.getUpcoming();
    }

    @Get('calendar')
    @ApiOperation({ summary: 'Get events for calendar view' })
    getCalendar(@Query() query: EventQueryDto) {
        // Basic calendar view returns events within a month
        return this.eventsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single event by ID' })
    findOne(@Param('id') id: string) {
        return this.eventsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an existing event' })
    update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
        return this.eventsService.update(id, dto);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update the status of an event' })
    updateStatus(@Param('id') id: string, @Body('statusId') statusId: string) {
        return this.eventsService.updateStatus(id, statusId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an event' })
    remove(@Param('id') id: string) {
        return this.eventsService.remove(id);
    }
}
