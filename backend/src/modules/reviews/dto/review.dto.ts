import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 'order-id-123' })
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @ApiProperty({ example: 5, description: 'Đánh giá quán (1-5 sao)' })
  @IsInt()
  @Min(1)
  @Max(5)
  restaurantRating!: number;

  @ApiPropertyOptional({ example: 5, description: 'Đánh giá shipper (1-5 sao)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  shipperRating?: number;

  @ApiPropertyOptional({ example: 'Món ăn ngon, giao hàng siêu nhanh!' })
  @IsOptional()
  @IsString()
  comment?: string;
}
