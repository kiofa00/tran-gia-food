import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestWithdrawalDto {
  @ApiProperty({ example: 500000, description: 'Số tiền muốn rút (VNĐ)' })
  @IsNumber()
  @Min(50000)
  amount: number;
}
