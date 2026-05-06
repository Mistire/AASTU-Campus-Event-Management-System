import { Body, Controller, Get, Patch, Post, Param, UseGuards } from '@nestjs/common';
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

  @Get('tickets/:id')
  getTicket(@Param('id') id: string) {
    return this.supportService.getTicket(id);
  }

  @Post('tickets')
  createTicket(@GetUser() user: AuthUser, @Body() dto: any) {
    return this.supportService.createTicket(user.id, dto);
  }

  @Post('tickets/:id/messages')
  addMessage(@Param('id') id: string, @GetUser() user: AuthUser, @Body('message') message: string) {
    return this.supportService.addMessage(id, user.id, message);
  }

  @Patch('tickets/:id/status')
  @Roles('Admin')
  updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.supportService.updateStatus(id, status);
  }
}
