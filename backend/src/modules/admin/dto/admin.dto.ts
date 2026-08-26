import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KycStatus, PenaltyLevel } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateKycStatusDto {
  @ApiProperty({
    enum: [
      'none',
      'pending',
      'verified',
      'rejected',
      'NONE',
      'PENDING',
      'VERIFIED',
      'REJECTED',
      'APPROVED',
    ],
    example: 'VERIFIED',
  })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      if (lower === 'approved') return KycStatus.verified;
      if (Object.values(KycStatus).includes(lower as KycStatus)) {
        return lower as KycStatus;
      }
    }

    return value;
  })
  @IsEnum(KycStatus, {
    message: 'status must be one of: none, pending, verified, rejected',
  })
  status!: KycStatus;

  @ApiPropertyOptional({ example: 'Ảnh chụp CCCD bị mờ' })
  @IsOptional()
  @IsString()
  rejectReason?: string;
}

export class UpdateAppConfigDto {
  @ApiProperty({ example: 'platform_food_fee_rate' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ example: '0.20' })
  @IsString()
  @IsNotEmpty()
  value!: string;
}

export class PenalizeShipperDto {
  @ApiProperty({ enum: PenaltyLevel })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      if (Object.values(PenaltyLevel).includes(lower as PenaltyLevel)) {
        return lower as PenaltyLevel;
      }
    }

    return value;
  })
  @IsEnum(PenaltyLevel)
  level!: PenaltyLevel;

  @ApiProperty({ example: 'Hủy quá 10% số đơn trong tháng' })
  @IsString()
  reason!: string;
}

export class UpdateUserStatusDto {
  @ApiProperty({ example: 'SUSPENDED' })
  @IsString()
  @IsNotEmpty()
  status!: string;
}
