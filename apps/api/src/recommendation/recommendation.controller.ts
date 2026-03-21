import {
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger';
import { RecommendationService } from './recommendation.service';
import { JwtAuthGuard } from 'src/auth/guard';

@ApiTags('Recommendations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recommendations')
export class RecommendationController {
    constructor(
        private readonly recommendationService: RecommendationService,
    ) {}

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get personalized event recommendations for a user' })
    @ApiResponse({ status: 200, description: 'Returns recommended events' })
    @ApiQuery({ name: 'n', required: false, type: Number, description: 'Number of recommendations (default: 10)' })
    getRecommendations(
        @Param('userId') userId: string,
        @Query('n') n?: number,
    ) {
        return this.recommendationService.getRecommendations(
            userId,
            n ? Number(n) : 10,
        );
    }

    @Get('similar/:eventId')
    @ApiOperation({ summary: 'Get events similar to a given event' })
    @ApiResponse({ status: 200, description: 'Returns similar events' })
    @ApiQuery({ name: 'n', required: false, type: Number, description: 'Number of similar events (default: 10)' })
    getSimilarEvents(
        @Param('eventId') eventId: string,
        @Query('n') n?: number,
    ) {
        return this.recommendationService.getSimilarEvents(
            eventId,
            n ? Number(n) : 10,
        );
    }

    @Post('retrain')
    @ApiOperation({ summary: 'Trigger model retraining (admin only)' })
    @ApiResponse({ status: 200, description: 'Model retrained successfully' })
    retrain() {
        return this.recommendationService.retrain();
    }

    @Get('health')
    @ApiOperation({ summary: 'Check ML service health' })
    getHealth() {
        return this.recommendationService.getHealth();
    }
}
