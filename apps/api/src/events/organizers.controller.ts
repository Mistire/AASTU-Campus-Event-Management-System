import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { OrganizersService } from './organizers.service';
import { CreateOrganizerDto } from './dto/management.dto';
import { JwtAuthGuard } from 'src/auth/guard';

@UseGuards(JwtAuthGuard)
@Controller('organizers')
export class OrganizersController {
    constructor(private readonly organizersService: OrganizersService) { }

    @Post()
    create(@Body() dto: CreateOrganizerDto) {
        return this.organizersService.create(dto);
    }

    @Get('event/:eventId')
    findAllByEvent(@Param('eventId') eventId: string) {
        return this.organizersService.findAllByEvent(eventId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.organizersService.remove(id);
    }
}
