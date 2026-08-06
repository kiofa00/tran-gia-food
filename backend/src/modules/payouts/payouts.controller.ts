import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User, UserRole } from '@prisma/client';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestWithdrawalDto } from './dto/payout.dto';
import { PayoutsService } from './payouts.service';

@ApiTags('payouts')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('payouts')
export class PayoutsController {
  constructor(private payoutsService: PayoutsService) {}

  @Post('withdraw/shipper')
  @Roles(UserRole.shipper)
  @ApiOperation({ summary: '[Shipper] Yêu cầu rút tiền từ ví về ngân hàng' })
  requestShipperWithdrawal(@CurrentUser() user: User, @Body() dto: RequestWithdrawalDto) {
    return this.payoutsService.requestShipperWithdrawal(user, dto);
  }

  @Get('history/shipper')
  @Roles(UserRole.shipper)
  @ApiOperation({ summary: '[Shipper] Lịch sử sao kê & rút tiền hàng tuần' })
  getShipperHistory(@CurrentUser() user: User) {
    return this.payoutsService.getShipperPayoutHistory(user);
  }
}
