import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({ description: 'Điểm đánh giá từ 1 đến 5 sao', example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({
    description: 'Nội dung cảm nhận/góp ý của người dùng',
    example: 'Ứng dụng mượt mà, giao đồ ăn nhanh!',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({
    description: 'Nền tảng sử dụng (android | ios | web)',
    example: 'android',
  })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional({ description: 'Phiên bản ứng dụng', example: '1.0.0' })
  @IsOptional()
  @IsString()
  appVersion?: string;
}
