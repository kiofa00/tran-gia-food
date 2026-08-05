import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentUrlDto, MoMoWebhookDto } from './dto/payment.dto';
import { JwtAuthGuard, Public } from '../../common/guards/jwt-auth.guard';

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

  @Get('status/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Kiểm tra trạng thái thanh toán của đơn hàng' })
  getPaymentStatus(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentStatus(orderId);
  }
}
