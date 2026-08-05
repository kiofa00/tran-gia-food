import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from '@prisma/client';

export class SendChatMessageDto {
  @ApiProperty({ example: 'order-id-123' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ example: 'user-receiver-id-456' })
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @ApiProperty({ example: 'Giao ở cổng sau giúp mình nha' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ enum: MessageType, example: MessageType.text })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;
}
