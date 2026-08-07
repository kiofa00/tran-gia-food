import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { AdminService } from './admin.service';
import { PenalizeShipperDto, UpdateAppConfigDto, UpdateKycStatusDto } from './dto/admin.dto';
import { CreateVoucherDto, QueryOptions } from './types/admin.types';

@ApiTags('admin')
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
  getPendingShippers(@Query() query: QueryOptions) {
    return this.adminService.listPendingShippers(query);
  }

  @Patch('shippers/:id/kyc')
  @ApiOperation({ summary: '[Admin] Duyệt/Từ chối hồ sơ eKYC' })
  updateKycStatus(@Param('id') id: string, @Body() dto: UpdateKycStatusDto) {
    return this.adminService.updateShipperKyc(id, dto);
  }

  @Post('shippers/:id/penalize')
  @ApiOperation({ summary: '[Admin] Phạt / Tạm khóa tài xế vi phạm' })
  penalizeShipper(@Param('id') id: string, @Body() dto: PenalizeShipperDto) {
    return this.adminService.penalizeShipper(id, dto);
  }

  @Post('config')
  @ApiOperation({ summary: '[Admin] Cấu hình hệ thống (tỷ lệ chia chia % hoa hồng, phí ship,...)' })
  setConfig(@Body() dto: UpdateAppConfigDto) {
    return this.adminService.setAppConfig(dto);
  }

  @Get('config')
  @ApiOperation({ summary: '[Admin] Xem tất cả cấu hình hệ thống' })
  getConfigs() {
    return this.adminService.getAppConfigs();
  }

  @Public()
  @Get('vouchers')
  @ApiOperation({
    summary: '[Admin] Danh sách vouchers (Hỗ trợ sort, filter, pagination, max item limit)',
  })
  getVouchers(@Query() query: QueryOptions) {
    return this.adminService.getVouchers(query);
  }

  @Public()
  @Post('vouchers')
  @ApiOperation({ summary: '[Admin] Tạo mới voucher' })
  createVoucher(@Body() dto: CreateVoucherDto) {
    return this.adminService.createVoucher(dto);
  }

  @Public()
  @Patch('vouchers/:id/toggle')
  @ApiOperation({ summary: '[Admin] Kích hoạt / tạm dừng voucher' })
  toggleVoucher(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.adminService.toggleVoucherStatus(id, isActive);
  }

  @Public()
  @Get('commissions')
  @ApiOperation({
    summary: '[Admin] Bảng phân bổ hoa hồng (Hỗ trợ sort, filter, pagination, max item limit)',
  })
  getCommissions(@Query() query: QueryOptions) {
    return this.adminService.getCommissionsBreakdown(query);
  }

  @Public()
  @Get('analytics')
  @ApiOperation({ summary: '[Admin] Dữ liệu thống kê doanh thu Recharts theo khoảng thời gian' })
  getAnalytics(@Query('range') range?: string) {
    return this.adminService.getAnalyticsData(range);
  }

  @Public()
  @Get('fleet')
  @ApiOperation({
    summary:
      '[Admin] Dữ liệu vị trí đội xe shipper (Hỗ trợ sort, filter, pagination, max item limit)',
  })
  getFleet(@Query() query: QueryOptions) {
    return this.adminService.getFleetData(query);
  }
}
