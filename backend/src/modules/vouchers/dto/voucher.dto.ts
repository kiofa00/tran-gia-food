import {
  IsString, IsEnum, IsNumber, IsOptional, IsDateString, IsInt, Min, IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VoucherType, DiscountType, OrderTypeFilter } from '@prisma/client';

export class CreateVoucherDto {
  @ApiProperty({ example: 'SUMMER20' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ enum: VoucherType, example: VoucherType.platform })
  @IsEnum(VoucherType)
  type: VoucherType;

  @ApiProperty({ enum: DiscountType, example: DiscountType.percent })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ example: 20, description: '20% hoặc 20,000đ' })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  maxDiscount?: number;

  @ApiPropertyOptional({ example: 100000 })
  @IsOptional()
  @IsNumber()
  minOrderValue?: number;

  @ApiProperty({ example: '2026-06-01T00:00:00Z' })
  @IsDateString()
  validFrom: string;

  @ApiProperty({ example: '2026-12-31T23:59:59Z' })
  @IsDateString()
  validTo: string;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsInt()
  totalLimit?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  perUserLimit?: number;

  @ApiPropertyOptional({ enum: OrderTypeFilter, example: OrderTypeFilter.both })
  @IsOptional()
  @IsEnum(OrderTypeFilter)
  applicableOrderType?: OrderTypeFilter;
}

export class ValidateVoucherDto {
  @ApiProperty({ example: 'SUMMER20' })
  @IsString()
  code: string;

  @ApiProperty({ example: 150000 })
  @IsNumber()
  subtotal: number;
}
