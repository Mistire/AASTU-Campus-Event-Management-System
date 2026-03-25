import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import type { AuthUser } from '../auth/jwt.strategy';
import { NotificationsService } from './notifications.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import {
  NotificationListResponseDto,
  UnreadCountResponseDto,
} from './dto/notification-response.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get my notifications',
    description:
      'Returns a paginated list of notifications for the authenticated user. ' +
      'Optionally filter by read status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications returned',
    type: NotificationListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@GetUser() user: AuthUser, @Query() query: NotificationQueryDto) {
    return this.notificationsService.findAllForUser(user.id, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of unread notifications' })
  @ApiResponse({
    status: 200,
    description: 'Unread count returned',
    type: UnreadCountResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUnreadCount(@GetUser() user: AuthUser) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
    schema: { example: { updated: 5 } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  markAllAsRead(@GetUser() user: AuthUser) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — not your notification' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  markAsRead(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: AuthUser) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — not your notification' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  deleteOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: AuthUser) {
    return this.notificationsService.deleteOne(id, user.id);
  }
}
