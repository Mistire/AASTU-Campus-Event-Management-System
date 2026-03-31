import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard, PermissionsGuard, RolesGuard } from 'src/auth/guard';
import { Permissions, Roles } from 'src/auth/decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Feedback')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) { }

    @Get()
    @Roles('ADMIN')
    @Permissions('VIEW_FEEDBACK')
    findAll() {
        return this.feedbackService.findAll();
    }

    @Delete(':id')
    @Roles('ADMIN')
    @Permissions('VIEW_FEEDBACK')
    remove(@Param('id') id: string) {
        return this.feedbackService.remove(id);
    }
}
