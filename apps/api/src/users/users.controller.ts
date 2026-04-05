import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorator';
import { AuthUser } from 'src/auth/jwt.strategy';
import { UsersService } from './users.service';
import {
  UpdateMyProfileDto,
  UpdateUserCategoryPreferencesDto,
  UpdateUserInterestsDto,
} from './dto';

import { Roles } from 'src/auth/decorator';
import { JwtAuthGuard, RolesGuard } from 'src/auth/guard';

type AuthenticatedRequest = { user: AuthUser };

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('Admin', 'Organizer')
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  getMe(@Req() req: AuthenticatedRequest) {
    return this.usersService.getMyProfile(req.user.id);
  }

  @ApiBearerAuth('access-token')
  @Patch('me')
  updateMe(@Req() req: AuthenticatedRequest, @Body() dto: UpdateMyProfileDto) {
    return this.usersService.updateMyProfile(req.user.id, dto);
  }

  @ApiBearerAuth('access-token')
  @Get('interests')
  getMyInterests(@Req() req: AuthenticatedRequest) {
    return this.usersService.getMyInterests(req.user.id);
  }

  @ApiBearerAuth('access-token')
  @Post('interests')
  updateMyInterests(@Req() req: AuthenticatedRequest, @Body() dto: UpdateUserInterestsDto) {
    return this.usersService.updateMyInterests(req.user.id, dto);
  }

  @ApiBearerAuth('access-token')
  @Get('categories/preferences')
  getMyCategoryPreferences(@Req() req: AuthenticatedRequest) {
    return this.usersService.getMyCategoryPreferences(req.user.id);
  }

  @ApiBearerAuth('access-token')
  @Post('categories/preferences')
  updateMyCategoryPreferences(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateUserCategoryPreferencesDto,
  ) {
    return this.usersService.updateMyCategoryPreferences(req.user.id, dto);
  }

  @Public()
  @Get(':id/public')
  getPublicProfile(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.getPublicProfile(id);
  }
}
