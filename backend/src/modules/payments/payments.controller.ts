import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, Public } from '../../common/guards/jwt-auth.guard';
import { CreatePaymentUrlDto, MoMoWebhookDto, VNPayWebhookDto } from './dto/payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Tạo link thanh toán MoMo / VNPay' })
  createPaymentUrl(@Body() dto: CreatePaymentUrlDto) {
    return this.paymentsService.createPaymentUrl(dto);
  }

  @Public()
  @Post('webhook/momo')
  @ApiOperation({ summary: 'Webhook callback từ MoMo' })
  momoWebhook(@Body() dto: MoMoWebhookDto) {
    return this.paymentsService.handleMoMoWebhook(dto);
  }

  @Public()
  @Post('webhook/vnpay')
  @ApiOperation({ summary: 'Webhook callback từ VNPay IPN' })
  vnpayWebhook(@Body() dto: VNPayWebhookDto) {
    return this.paymentsService.handleVNPayWebhook(dto);
  }

  @Post(':orderId/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Xử lý hoàn tiền cho đơn hàng online khi hủy đơn' })
  refundPayment(@Param('orderId') orderId: string, @Body('reason') reason?: string) {
    return this.paymentsService.refundPayment(orderId, reason);
  }

  @Get('status/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Kiểm tra trạng thái thanh toán của đơn hàng' })
  getPaymentStatus(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentStatus(orderId);
  }
}
