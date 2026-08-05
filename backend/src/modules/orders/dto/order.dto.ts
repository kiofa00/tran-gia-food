import {
  IsString, IsEnum, IsNumber, IsOptional, IsArray, ValidateNested, Min, IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderType, PaymentMethod } from '@prisma/client';

export class OrderItemInputDto {
  @ApiProperty({ example: 'menu-item-id-123' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'restaurant-id-123' })
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({ enum: OrderType, example: OrderType.delivery })
  @IsEnum(OrderType)
  orderType: OrderType;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.momo })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ type: [OrderItemInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];

  @ApiPropertyOptional({ example: 'VOUCHER20K' })
  @IsOptional()
  @IsString()
  voucherCode?: string;

  @ApiPropertyOptional({ example: '123 Nguyễn Trãi, Q5, TP.HCM' })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @ApiPropertyOptional({ example: 10.7769 })
  @IsOptional()
  @IsNumber()
  deliveryLat?: number;

  @ApiPropertyOptional({ example: 106.7009 })
  @IsOptional()
  @IsNumber()
  deliveryLng?: number;

  @ApiPropertyOptional({ example: 'Gõ cửa khi tới giúp mình' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class CancelOrderDto {
  @ApiProperty({ example: 'Đặt nhầm món' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
