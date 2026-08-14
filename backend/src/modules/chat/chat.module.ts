import { Module } from '@nestjs/common';

import { DeliveryGateway } from '../../gateways/delivery.gateway';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, DeliveryGateway],
  exports: [ChatService],
})
export class ChatModule {}
