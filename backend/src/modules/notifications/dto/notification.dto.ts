import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class SendNotificationDto {
  @ApiProperty({ example: 'user-id-123' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ example: 'Đơn hàng mới' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Đơn hàng #12345 đã được xác nhận' })
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiPropertyOptional({ example: 'order_update' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: { orderId: '123' } })
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}
