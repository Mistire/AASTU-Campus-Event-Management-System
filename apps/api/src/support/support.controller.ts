import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard, RolesGuard, PermissionsGuard } from '../auth/guard';
import { Roles, GetUser } from '../auth/decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../auth/jwt.strategy';

@ApiTags('Support')
@ApiBearerAuth('access-token')
@Controller('support')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('tickets')
  @Roles('Admin')
  listTickets() {
    return this.supportService.listTickets();
  }

  @Post('tickets')
  createTicket(@GetUser() user: AuthUser, @Body() dto: any) {
    return this.supportService.createTicket(user.id, dto);
  }
}
