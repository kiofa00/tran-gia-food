import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class DepositWalletDto {
  @ApiProperty({ example: 100000, description: 'Số tiền nạp vào ví' })
  @IsNumber()
  @IsPositive({ message: 'Số tiền nạp phải lớn hơn 0' })
  amount!: number;

  @ApiProperty({ example: 'momo', description: 'Phương thức nạp: momo, vnpay, bank' })
  @IsString()
  @IsOptional()
  method?: string;
}
