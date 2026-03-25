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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VenuesService } from './venues.service';
import { CreateVenueDto, UpdateVenueDto } from './dto/venue.dto';
import { VenueQueryDto, VenueAvailabilityQueryDto } from './dto/venue-query.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { Roles } from '../auth/decorator';

@ApiTags('Venues')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post()
  @Roles('Admin')
  @ApiOperation({ summary: 'Create a new venue (Admin only)' })
  @ApiResponse({ status: 201, description: 'Venue created.' })
  create(@Body() dto: CreateVenueDto) {
    return this.venuesService.create(dto);
  }

  @Get()
  @Roles('Admin', 'Organizer')
  @ApiOperation({ summary: 'List & filter venues (Admin, Organizer)' })
  findAll(@Query() query: VenueQueryDto) {
    return this.venuesService.findAll(query);
  }

  @Get('available')
  @Roles('Admin', 'Organizer')
  @ApiOperation({ summary: 'Find available venues for a time range (Admin, Organizer)' })
  findAvailable(@Query() query: VenueAvailabilityQueryDto) {
    return this.venuesService.findAvailable(query);
  }

  @Get(':id/availability')
  @Roles('Admin', 'Organizer')
  @ApiOperation({ summary: 'Check if a specific venue is available (Admin, Organizer)' })
  @ApiQuery({ name: 'startTime', required: true, type: String })
  @ApiQuery({ name: 'endTime', required: true, type: String })
  async checkAvailability(@Param('id') id: string, @Query() query: VenueAvailabilityQueryDto) {
    const isAvailable = await this.venuesService.checkAvailability(
      id,
      new Date(query.startTime),
      new Date(query.endTime),
    );
    return { available: isAvailable };
  }

  @Get(':id')
  @Roles('Admin', 'Organizer')
  @ApiOperation({ summary: 'Get venue details with optional upcoming events (Admin, Organizer)' })
  @ApiQuery({ name: 'includeEvents', required: false, type: Boolean })
  findOne(@Param('id') id: string, @Query('includeEvents') includeEvents?: string) {
    return this.venuesService.findOne(id, includeEvents === 'true');
  }

  @Patch(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update a venue (Admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateVenueDto) {
    return this.venuesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete a venue (Admin only) - checks for upcoming events first' })
  @ApiResponse({ status: 400, description: 'Cannot delete - upcoming events booked.' })
  remove(@Param('id') id: string) {
    return this.venuesService.remove(id);
  }
}
