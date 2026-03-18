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
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import { EventQueryDto } from './dto/event-query.dto';
import { JwtAuthGuard } from 'src/auth/guard';

@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    create(@Body() dto: CreateEventDto) {
        return this.eventsService.create(dto);
    }

    @Get()
    findAll(@Query() query: EventQueryDto) {
        return this.eventsService.findAll(query);
    }

    @Get('upcoming')
    getUpcoming() {
        return this.eventsService.getUpcoming();
    }

    @Get('calendar')
    getCalendar(@Query() query: EventQueryDto) {
        // Basic calendar view returns events within a month
        return this.eventsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.eventsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
        return this.eventsService.update(id, dto);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('statusId') statusId: string) {
        return this.eventsService.updateStatus(id, statusId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.eventsService.remove(id);
    }
}
