import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard, RolesGuard, PermissionsGuard } from '../auth/guard';
import { Roles } from '../auth/decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Audit Logs')
@ApiBearerAuth('access-token')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles('Admin')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  listLogs() {
    return this.auditLogsService.listLogs();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auditLogsService.findOne(id);
  }
}
