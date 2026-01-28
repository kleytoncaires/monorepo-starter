import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PublicUser } from './types/user.types';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto, PaginatedResponse } from '../common/dto/pagination.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMe(@CurrentUser() user: PublicUser): PublicUser {
    return user;
  }

  @Get('me/export')
  @ApiOperation({ summary: 'Export all personal data (LGPD compliance)' })
  @ApiResponse({ status: 200, description: 'User data exported' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  exportMyData(@CurrentUser() user: { id: string }) {
    return this.usersService.exportUserData(user.id);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete own account (LGPD compliance)' })
  @ApiResponse({ status: 204, description: 'Account deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  deleteMyAccount(@CurrentUser() user: { id: string }): Promise<void> {
    return this.usersService.deleteOwnAccount(user.id);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Paginated list of users' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll(@Query() query: PaginationQueryDto): Promise<PaginatedResponse<PublicUser>> {
    return this.usersService.findAllPaginated(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string): Promise<PublicUser> {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: PublicUser,
  ): Promise<PublicUser> {
    return this.usersService.update(id, updateUserDto, currentUser.id, currentUser.role);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  @Patch(':id/transfer-master')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Transfer master status to another admin (Master only)' })
  @ApiResponse({ status: 200, description: 'Master transferred' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only master can transfer' })
  @ApiResponse({ status: 404, description: 'User not found' })
  transferMaster(
    @Param('id') newMasterId: string,
    @CurrentUser() currentUser: PublicUser,
  ): Promise<PublicUser> {
    if (!currentUser.isMaster) {
      throw new ForbiddenException('Apenas o master pode transferir o status');
    }
    return this.usersService.transferMaster(currentUser.id, newMasterId);
  }
}
