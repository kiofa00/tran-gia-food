import { Body, Controller, Get, Logger, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard, Public } from '../../common/guards/jwt-auth.guard';
import { CreateVoucherDto, ValidateVoucherDto } from './dto/voucher.dto';
import { VouchersService } from './vouchers.service';

@ApiTags('vouchers')
@Controller('vouchers')
export class VouchersController {
  private readonly logger = new Logger(VouchersController.name);

  constructor(private vouchersService: VouchersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Tạo mã voucher mới (Admin / Restaurant)' })
  create(@CurrentUser() user: User, @Body() dto: CreateVoucherDto) {
    return this.vouchersService.create(user, dto);
  }

  @Public()
  @Post('validate')
  @ApiOperation({ summary: 'Kiểm tra và áp dụng mã voucher' })
  validate(@Body() dto: ValidateVoucherDto) {
    this.logger.log(`POST /vouchers/validate - code: "${dto.code}", subtotal: ${dto.subtotal}`);
    return this.vouchersService.validateVoucher(dto);
  }

  @Public()
  @Get('active')
  @ApiOperation({ summary: 'Danh sách mã voucher đang khả dụng' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  findAllActive(@Query('search') search?: string, @Query('type') type?: string) {
    this.logger.log(`GET /vouchers/active - search: "${search ?? ''}", type: "${type ?? ''}"`);
    return this.vouchersService.findAllActive(search, type);
  }

  @Post(':id/claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lưu mã voucher vào ví người dùng (Claim)' })
  claimVoucher(@CurrentUser() user: User, @Param('id') id: string) {
    this.logger.log(`POST /vouchers/${id}/claim - user: ${user.id}`);
    return this.vouchersService.claimVoucher(user.id, id);
  }

  @Get('my-wallet')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Danh sách voucher trong ví cá nhân' })
  @ApiQuery({ name: 'status', required: false, enum: ['claimed', 'used', 'expired'] })
  getMyWallet(@CurrentUser() user: User, @Query('status') status?: string) {
    this.logger.log(`GET /vouchers/my-wallet - user: ${user.id}, status: "${status ?? 'claimed'}"`);
    return this.vouchersService.getMyWallet(user.id, status);
  }
}
