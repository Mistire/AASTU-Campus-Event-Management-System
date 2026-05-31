import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard, RolesGuard, PermissionsGuard } from '../auth/guard';
import { GetUser, Public, Roles } from '../auth/decorator';
import type { AuthUser } from '../auth/jwt.strategy';
import { CreateFeedbackTemplateDto } from './dto/create-template.dto';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // ─── PUBLIC ENDPOINTS (no auth) ──────────────────────────────────────────

  @Public()
  @Get('form/:token')
  @ApiOperation({ summary: 'Resolve feedback token → return event info and form questions' })
  getFeedbackForm(@Param('token') token: string) {
    return this.feedbackService.resolveFeedbackForm(token);
  }

  @Public()
  @Post('submit/:token')
  @ApiOperation({ summary: 'Submit feedback answers (public, token-gated)' })
  submitFeedback(@Param('token') token: string, @Body() dto: SubmitFeedbackDto) {
    return this.feedbackService.submitFeedback(token, dto);
  }

  // ─── PROTECTED ENDPOINTS ─────────────────────────────────────────────────

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: list all legacy feedback records' })
  listFeedback() {
    return this.feedbackService.listFeedback();
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Get('responses')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: list all structured feedback responses' })
  listAllResponses(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.feedbackService.listAllResponses(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Get('responses/my-events')
  @Roles('ORGANIZER', 'ADMIN')
  @ApiOperation({ summary: 'Organizer: list responses for events they manage (semi-anonymous)' })
  listMyEventsResponses(
    @GetUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.feedbackService.listResponsesForOrganizer(
      user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Get('responses/event/:eventId')
  @Roles('ORGANIZER', 'ADMIN')
  @ApiOperation({ summary: 'Get responses for a specific event' })
  listEventResponses(@Param('eventId') eventId: string, @GetUser() user: AuthUser) {
    return this.feedbackService.listResponsesForEvent(eventId, user.id, user.role);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Post('send-requests/:eventId')
  @Roles('ORGANIZER', 'ADMIN')
  @ApiOperation({ summary: 'Manually trigger feedback emails for an archived event' })
  sendFeedbackRequests(@Param('eventId') eventId: string) {
    return this.feedbackService.dispatchFeedbackEmails(eventId);
  }

  // ─── TEMPLATE ENDPOINTS ───────────────────────────────────────────────────

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Get('templates')
  @Roles('ORGANIZER', 'ADMIN')
  @ApiOperation({ summary: "List organizer's feedback form templates" })
  listTemplates(@GetUser() user: AuthUser) {
    return this.feedbackService.listTemplates(user.id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Post('templates')
  @Roles('ORGANIZER', 'ADMIN')
  @ApiOperation({ summary: 'Create a feedback form template' })
  createTemplate(@GetUser() user: AuthUser, @Body() dto: CreateFeedbackTemplateDto) {
    return this.feedbackService.createTemplate(user.id, dto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Put('templates/:id')
  @Roles('ORGANIZER', 'ADMIN')
  @ApiOperation({ summary: 'Update a feedback form template' })
  updateTemplate(
    @Param('id') id: string,
    @GetUser() user: AuthUser,
    @Body() dto: CreateFeedbackTemplateDto,
  ) {
    return this.feedbackService.updateTemplate(id, user.id, dto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Delete('templates/:id')
  @Roles('ORGANIZER', 'ADMIN')
  @ApiOperation({ summary: 'Delete a feedback form template' })
  deleteTemplate(@Param('id') id: string, @GetUser() user: AuthUser) {
    return this.feedbackService.deleteTemplate(id, user.id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Post('templates/:id/attach/:eventId')
  @Roles('ORGANIZER', 'ADMIN')
  @ApiOperation({ summary: 'Attach a template to a specific event' })
  attachTemplate(
    @Param('id') templateId: string,
    @Param('eventId') eventId: string,
    @GetUser() user: AuthUser,
  ) {
    return this.feedbackService.attachTemplateToEvent(templateId, eventId, user.id);
  }
}
