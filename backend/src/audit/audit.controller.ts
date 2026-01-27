import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuditService, AuditLog } from './audit.service';
import { AuditLogQueryDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginatedResponse } from '../common/dto/pagination.dto';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all audit logs (Admin only)' })
  @ApiResponse({ status: 200, description: 'Paginated list of audit logs' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll(@Query() query: AuditLogQueryDto): Promise<PaginatedResponse<AuditLog>> {
    return this.auditService.findAll(query);
  }

  @Get('actions')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get available audit action types' })
  @ApiResponse({ status: 200, description: 'List of action types' })
  getActionTypes(): Promise<string[]> {
    return this.auditService.getActionTypes();
  }
}
