import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Nhà riêng', description: 'Nhãn địa chỉ (Nhà riêng, Công ty, Khác)' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Nguyễn Văn A' })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiPropertyOptional({ example: '+84886925566' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '123 Lê Lợi' })
  @IsString()
  @IsNotEmpty()
  street!: string;

  @ApiProperty({ example: 'Phường Bến Nghé' })
  @IsString()
  @IsNotEmpty()
  ward!: string;

  @ApiProperty({ example: 'Quận 1' })
  @IsString()
  @IsNotEmpty()
  district!: string;

  @ApiProperty({ example: 'TP. Hồ Chí Minh' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: '123 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh' })
  @IsString()
  @IsNotEmpty()
  fullAddress!: string;

  @ApiProperty({ example: 10.7769 })
  @IsNumber()
  lat!: number;

  @ApiProperty({ example: 106.7009 })
  @IsNumber()
  lng!: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: 'Bấm chuông gọi trước khi đến' })
  @IsOptional()
  @IsString()
  deliveryNote?: string;
}
