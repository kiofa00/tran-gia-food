import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { SendChatMessageDto } from './dto/chat.dto';

@ApiTags('chat')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('send')
  @ApiOperation({ summary: 'Gửi tin nhắn trong đơn hàng (Customer ↔ Shipper ↔ Restaurant)' })
  sendMessage(@CurrentUser() user: User, @Body() dto: SendChatMessageDto) {
    return this.chatService.sendMessage(user, dto);
  }

  @Get('messages/:orderId')
  @ApiOperation({ summary: 'Lấy lịch sử tin nhắn của đơn hàng' })
  getOrderMessages(@CurrentUser() user: User, @Param('orderId') orderId: string) {
    return this.chatService.getOrderMessages(user, orderId);
  }
}
