import { IsEnum, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleType } from '@prisma/client';

export class RegisterShipperDto {
  @ApiProperty({ enum: VehicleType, example: VehicleType.motorbike })
  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @ApiPropertyOptional({ example: '59P1-12345' })
  @IsOptional()
  @IsString()
  vehiclePlate?: string;
}

export class UpdateLocationDto {
  @ApiProperty({ example: 10.7769 })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 106.7009 })
  @IsNumber()
  lng: number;
}

export class ToggleActiveDto {
  @ApiProperty({ description: 'true = Sẵn sàng nhận đơn, false = Tắt' })
  isActive: boolean;
}
