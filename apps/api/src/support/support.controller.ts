import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Param,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard, RolesGuard, PermissionsGuard } from '../auth/guard';
import { Roles, GetUser, Public } from '../auth/decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../auth/jwt.strategy';

@ApiTags('Support')
@ApiBearerAuth('access-token')
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('tickets')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('ADMIN')
  listTickets() {
    return this.supportService.listTickets();
  }

  @Get('my-tickets')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  getMyTickets(@GetUser() user: AuthUser) {
    return this.supportService.listUserTickets(user.id);
  }

  @Get('tickets/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  async getTicket(@Param('id') id: string, @GetUser() user: AuthUser) {
    const ticket = await this.supportService.getTicket(id);
    if (!ticket) throw new NotFoundException('Ticket not found');

    if (user.role !== 'ADMIN' && ticket.userId !== user.id) {
      throw new ForbiddenException('You do not have access to this ticket');
    }

    return ticket;
  }

  @Post('tickets')
  @Public()
  createTicket(@GetUser() user: AuthUser | null, @Body() dto: any) {
    return this.supportService.createTicket(user?.id || null, dto);
  }

  @Get('tickets/public/:id')
  @Public()
  async getPublicTicket(@Param('id') id: string, @Query('email') email: string) {
    const ticket = await this.supportService.getTicket(id);
    if (!ticket) throw new NotFoundException('Ticket not found');

    // Verify email for guests (if logged in, the regular route should be used)
    if (ticket.guestEmail !== email) {
      throw new ForbiddenException('Invalid access code or email');
    }

    return ticket;
  }

  @Post('tickets/public/:id/messages')
  @Public()
  async addPublicMessage(
    @Param('id') id: string,
    @Body('email') email: string,
    @Body('message') message: string,
  ) {
    const ticket = await this.supportService.getTicket(id);
    if (!ticket) throw new NotFoundException('Ticket not found');

    if (ticket.guestEmail !== email) {
      throw new ForbiddenException('Invalid email');
    }

    return this.supportService.addMessage(id, null, message);
  }

  @Post('tickets/:id/messages')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  async addMessage(
    @Param('id') id: string,
    @GetUser() user: AuthUser,
    @Body('message') message: string,
  ) {
    const ticket = await this.supportService.getTicket(id);
    if (!ticket) throw new NotFoundException('Ticket not found');

    if (user.role !== 'ADMIN' && ticket.userId !== user.id) {
      throw new ForbiddenException('You do not have access to this ticket');
    }

    return this.supportService.addMessage(id, user.id, message);
  }

  @Patch('tickets/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('ADMIN')
  updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.supportService.updateStatus(id, status);
  }
}
