import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Gui tin nhan trong don hang (Customer <-> Shipper <-> Restaurant)' })
  sendMessage(@CurrentUser() user: User, @Body() dto: SendChatMessageDto) {
    return this.chatService.sendMessage(user, dto);
  }

  @Get('messages/:orderId')
  @ApiOperation({ summary: 'Lay lich su tin nhan cua don hang (tu dong danh dau da doc)' })
  getOrderMessages(@CurrentUser() user: User, @Param('orderId') orderId: string) {
    return this.chatService.getOrderMessages(user, orderId);
  }

  @Get('messages/:orderId/unread-count')
  @ApiOperation({ summary: 'So tin nhan chua doc cua don hang nay' })
  getUnreadCount(@CurrentUser() user: User, @Param('orderId') orderId: string) {
    return this.chatService.getUnreadMessageCount(user.id, orderId);
  }

  @Patch('messages/:orderId/read-all')
  @ApiOperation({ summary: 'Danh dau tat ca tin nhan da doc' })
  markRead(@CurrentUser() user: User, @Param('orderId') orderId: string) {
    return this.chatService.markMessagesRead(user.id, orderId);
  }

  @Delete('messages/:messageId')
  @ApiOperation({ summary: 'Xoa tin nhan (chi nguoi gui moi duoc xoa)' })
  deleteMessage(@CurrentUser() user: User, @Param('messageId') messageId: string) {
    return this.chatService.deleteMessage(user, messageId);
  }
}
