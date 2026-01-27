import { Controller, Get, Patch, Delete, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { NotificationsService, Notification } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationQueryDto, PaginatedResponse } from '../common/dto/pagination.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  @ApiResponse({ status: 200, description: 'Paginated list of notifications' })
  findAll(
    @CurrentUser() user: { id: string },
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<Notification>> {
    return this.notificationsService.findAllForUser(user.id, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({ status: 200, description: 'Unread count' })
  async getUnreadCount(@CurrentUser() user: { id: string }): Promise<{ count: number }> {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  markAsRead(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ): Promise<Notification> {
    return this.notificationsService.markAsRead(user.id, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@CurrentUser() user: { id: string }): Promise<{ count: number }> {
    const count = await this.notificationsService.markAllAsRead(user.id);
    return { count };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 204, description: 'Notification deleted' })
  delete(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ): Promise<void> {
    return this.notificationsService.delete(user.id, id);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all read notifications' })
  @ApiResponse({ status: 200, description: 'Read notifications deleted' })
  async deleteAllRead(@CurrentUser() user: { id: string }): Promise<{ count: number }> {
    const count = await this.notificationsService.deleteAllRead(user.id);
    return { count };
  }
}
