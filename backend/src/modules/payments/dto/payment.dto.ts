import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentUrlDto {
  @ApiProperty({ example: 'order-id-123' })
  @IsString()
  @IsNotEmpty()
  orderId: string;
}

export class MoMoWebhookDto {
  @IsString() partnerCode: string;
  @IsString() orderId: string;
  @IsString() requestId: string;
  @IsString() amount: string;
  @IsString() resultCode: string; // 0 = success
  @IsString() message: string;
  @IsOptional() @IsObject() extraData?: any;
}

export class VNPayWebhookDto {
  @IsString() vnp_TxnRef: string;
  @IsString() vnp_Amount: string;
  @IsString() vnp_ResponseCode: string; // '00' = success
  @IsString() vnp_TransactionNo: string;
  @IsString() vnp_BankCode: string;
}
