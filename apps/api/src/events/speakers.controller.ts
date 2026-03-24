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
import { SpeakersService } from './speakers.service';
import { CreateSpeakerDto, UpdateSpeakerDto } from './dto/speaker.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { Roles } from '../auth/decorator';

@ApiTags('Speakers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('speakers')
export class SpeakersController {
  constructor(private readonly speakersService: SpeakersService) {}

  @Post()
  @Roles('Admin', 'Organizer')
  @ApiOperation({ summary: 'Create a new speaker profile (Admin/Organizer)' })
  @ApiResponse({ status: 201, description: 'Speaker created.' })
  create(@Body() dto: CreateSpeakerDto) {
    return this.speakersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all speakers with their session assignments' })
  findAll() {
    return this.speakersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get speaker details including all their sessions' })
  findOne(@Param('id') id: string) {
    return this.speakersService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin', 'Organizer')
  @ApiOperation({ summary: 'Update speaker profile (Admin/Organizer)' })
  update(@Param('id') id: string, @Body() dto: UpdateSpeakerDto) {
    return this.speakersService.update(id, dto);
  }

  @Delete(':id')
  @Roles('Admin', 'Organizer')
  @ApiOperation({ summary: 'Delete a speaker and remove all session assignments (Admin/Organizer)' })
  remove(@Param('id') id: string) {
    return this.speakersService.remove(id);
  }
}
