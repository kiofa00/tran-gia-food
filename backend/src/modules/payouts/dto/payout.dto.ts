import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class RequestWithdrawalDto {
  @ApiProperty({ example: 500000, description: 'Số tiền muốn rút (VNĐ)' })
  @IsNumber()
  @Min(50000)
  amount!: number;
}
