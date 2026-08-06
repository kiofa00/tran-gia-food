import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Phở Bắc Hà' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Phở bò truyền thống Hà Nội' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '123 Nguyễn Trãi, Q5, HCM' })
  @IsString()
  address!: string;

  @ApiProperty({ example: 10.7769 })
  @IsNumber()
  lat!: number;

  @ApiProperty({ example: 106.7009 })
  @IsNumber()
  lng!: number;

  @ApiPropertyOptional({ example: '0901234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 8.0,
    description: 'Bán kính phục vụ (km), tối đa 10km (system limit)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(10)
  radiusKm?: number;

  @ApiPropertyOptional({
    description: 'Lịch mở cửa: {"mon":{"open":"08:00","close":"22:00"},...}',
    example: { mon: { open: '08:00', close: '22:00' }, tue: { open: '08:00', close: '22:00' } },
  })
  @IsOptional()
  @IsObject()
  openingHours?: Record<string, { open: string; close: string }>;
}

export class UpdateRestaurantDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lat?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lng?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() coverImageUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0.5) @Max(10) radiusKm?: number;
  @ApiPropertyOptional() @IsOptional() @IsObject() openingHours?: Record<
    string,
    { open: string; close: string }
  >;
  @ApiPropertyOptional() @IsOptional() @IsObject() bankAccount?: Record<string, string>;
}

export class ToggleOpenDto {
  @ApiProperty({ description: 'true = mở cửa, false = đóng cửa thủ công' })
  @IsBoolean()
  isOpen!: boolean;
}
