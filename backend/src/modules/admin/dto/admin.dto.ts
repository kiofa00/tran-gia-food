import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { KycStatus, PenaltyLevel } from '@prisma/client';

export class UpdateKycStatusDto {
  @ApiProperty({ enum: KycStatus })
  @IsEnum(KycStatus)
  status: KycStatus;
}

export class UpdateAppConfigDto {
  @ApiProperty({ example: 'platform_food_fee_rate' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: '0.20' })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class PenalizeShipperDto {
  @ApiProperty({ enum: PenaltyLevel })
  @IsEnum(PenaltyLevel)
  level: PenaltyLevel;

  @ApiProperty({ example: 'Hủy quá 10% số đơn trong tháng' })
  @IsString()
  reason: string;
}
