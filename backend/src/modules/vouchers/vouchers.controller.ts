import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard, Public } from '../../common/guards/jwt-auth.guard';
import { CreateVoucherDto, ValidateVoucherDto } from './dto/voucher.dto';
import { VouchersService } from './vouchers.service';

@ApiTags('vouchers')
@Controller('vouchers')
export class VouchersController {
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
    return this.vouchersService.validateVoucher(dto);
  }

  @Public()
  @Get('active')
  @ApiOperation({ summary: 'Danh sách mã voucher đang khả dụng' })
  findAllActive() {
    return this.vouchersService.findAllActive();
  }
}
