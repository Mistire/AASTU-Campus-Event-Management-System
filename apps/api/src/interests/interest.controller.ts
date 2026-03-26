import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { InterestService } from './interest.service';
import { JwtAuthGuard, PermissionsGuard, RolesGuard } from 'src/auth/guard';
import { Permissions, Roles } from 'src/auth/decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Interests')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('interests')
export class InterestController {
    constructor(private readonly interestService: InterestService) { }

    @Get()
    @Roles('ADMIN')
    @Permissions('MANAGE_INTERESTS')
    findAll() {
        return this.interestService.findAll();
    }

    @Post()
    @Roles('ADMIN')
    @Permissions('MANAGE_INTERESTS')
    create(@Body() dto: { name: string; description?: string }) {
        return this.interestService.create(dto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @Permissions('MANAGE_INTERESTS')
    remove(@Param('id') id: string) {
        return this.interestService.remove(id);
    }
}
