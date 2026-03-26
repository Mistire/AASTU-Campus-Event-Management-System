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
import { JwtAuthGuard, PermissionsGuard, RolesGuard } from 'src/auth/guard';
import { Permissions, Roles } from 'src/auth/decorator';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('venues')
export class VenuesController {
    constructor(private readonly venuesService: VenuesService) { }

    @Post()
    @Roles('ADMIN')
    @Permissions('MANAGE_VENUES')
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
    @Roles('ADMIN')
    @Permissions('MANAGE_VENUES')
    update(@Param('id') id: string, @Body() dto: UpdateVenueDto) {
        return this.venuesService.update(id, dto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @Permissions('MANAGE_VENUES')
    remove(@Param('id') id: string) {
        return this.venuesService.remove(id);
    }
}
