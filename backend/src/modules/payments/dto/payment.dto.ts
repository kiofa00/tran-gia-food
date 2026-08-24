import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreatePaymentUrlDto {
  @ApiProperty({ example: 'order-id-123' })
  @IsString()
  @IsNotEmpty()
  orderId!: string;
}

export class MoMoWebhookDto {
  @IsString() partnerCode!: string;
  @IsString() orderId!: string;
  @IsString() requestId!: string;
  @IsString() amount!: string;
  @IsString() resultCode!: string; // 0 = success
  @IsString() message!: string;
  @IsOptional() @IsString() signature?: string;
  @IsOptional() @IsString() orderInfo?: string;
  @IsOptional() @IsString() orderType?: string;
  @IsOptional() @IsString() payType?: string;
  @IsOptional() transId?: string | number;
  @IsOptional() responseTime?: string | number;
  @IsOptional() @IsObject() extraData?: Record<string, unknown>;
}

export class VNPayWebhookDto {
  @IsString() vnp_TxnRef!: string;
  @IsString() vnp_Amount!: string;
  @IsString() vnp_ResponseCode!: string; // '00' = success
  @IsString() vnp_TransactionNo!: string;
  @IsString() vnp_BankCode!: string;
  @IsOptional() @IsString() vnp_SecureHash?: string;
  @IsOptional() @IsString() vnp_SecureHashType?: string;
  @IsOptional() @IsString() vnp_OrderInfo?: string;
  @IsOptional() @IsString() vnp_PayDate?: string;
  [key: string]: unknown;
}
