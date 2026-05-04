import { Controller, Post, Delete, Get, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import type { AuthUser } from '../auth/jwt.strategy';

@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post(':eventId')
  bookmark(@GetUser() user: AuthUser, @Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.bookmarksService.bookmarkEvent(user.id, eventId);
  }

  @Delete(':eventId')
  unbookmark(@GetUser() user: AuthUser, @Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.bookmarksService.unbookmarkEvent(user.id, eventId);
  }

  @Get()
  getMyBookmarks(@GetUser() user: AuthUser) {
    return this.bookmarksService.getMyBookmarks(user.id);
  }

  @Get(':eventId/check')
  check(@GetUser() user: AuthUser, @Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.bookmarksService.isBookmarked(user.id, eventId);
  }
}
