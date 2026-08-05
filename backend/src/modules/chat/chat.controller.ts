import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendChatMessageDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

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
