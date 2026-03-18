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
import { VenuesService } from './venues.service';
import { CreateVenueDto, UpdateVenueDto } from './dto/venue.dto';
import { JwtAuthGuard } from 'src/auth/guard';

@UseGuards(JwtAuthGuard)
@Controller('venues')
export class VenuesController {
    constructor(private readonly venuesService: VenuesService) { }

    @Post()
    create(@Body() dto: CreateVenueDto) {
        return this.venuesService.create(dto);
    }

    @Get()
    findAll() {
        return this.venuesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.venuesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateVenueDto) {
        return this.venuesService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.venuesService.remove(id);
    }
}
