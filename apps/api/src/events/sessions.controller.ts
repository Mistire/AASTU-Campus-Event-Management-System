import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/management.dto';
import { JwtAuthGuard } from 'src/auth/guard';

@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.sessionsService.create(dto);
  }

  @Get('event/:eventId')
  findAllByEvent(@Param('eventId') eventId: string) {
    return this.sessionsService.findAllByEvent(eventId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sessionsService.remove(id);
  }
}
