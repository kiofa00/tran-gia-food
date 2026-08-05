import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdateKycStatusDto, UpdateAppConfigDto, PenalizeShipperDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.admin)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Public()
  @Get('overview')
  @ApiOperation({ summary: '[Admin] Tổng quan doanh thu & chỉ số hệ thống' })
  getOverview() {
    return this.adminService.getDashboardOverview();
  }

  @Get('shippers/pending-kyc')
  @ApiOperation({ summary: '[Admin] Danh sách shipper chờ duyệt eKYC' })
  getPendingShippers() {
    return this.adminService.listPendingShippers();
  }

  @Patch('shippers/:id/kyc')
  @ApiOperation({ summary: '[Admin] Duyệt / Từ chối eKYC của shipper' })
  updateShipperKyc(@Param('id') id: string, @Body() dto: UpdateKycStatusDto) {
    return this.adminService.updateShipperKyc(id, dto);
  }

  @Post('shippers/:id/penalize')
  @ApiOperation({ summary: '[Admin] Xử phạt shipper' })
  penalizeShipper(@Param('id') id: string, @Body() dto: PenalizeShipperDto) {
    return this.adminService.penalizeShipper(id, dto);
  }

  @Post('config')
  @ApiOperation({ summary: '[Admin] Cấu hình thông số toàn hệ thống (% phí, bán kính...)' })
  setConfig(@Body() dto: UpdateAppConfigDto) {
    return this.adminService.setAppConfig(dto);
  }

  @Get('config')
  @ApiOperation({ summary: '[Admin] Xem tất cả cấu hình hệ thống' })
  getConfigs() {
    return this.adminService.getAppConfigs();
  }
}
