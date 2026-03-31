import { Controller, Get, UseGuards } from '@nestjs/common';
import { EventStatusService } from './event-status.service';
import { JwtAuthGuard } from 'src/auth/guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Event Status')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('event-status')
export class EventStatusController {
    constructor(private readonly eventStatusService: EventStatusService) { }

    @Get()
    findAll() {
        return this.eventStatusService.findAll();
    }
}
