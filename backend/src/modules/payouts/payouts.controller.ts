import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayoutsService } from './payouts.service';
import { RequestWithdrawalDto } from './dto/payout.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '@prisma/client';

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
