import { Controller, Get, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard, RolesGuard, PermissionsGuard } from '../auth/guard';
import { Roles } from '../auth/decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Feedback')
@ApiBearerAuth('access-token')
@Controller('feedback')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles('Admin')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  listFeedback() {
    return this.feedbackService.listFeedback();
  }
}
