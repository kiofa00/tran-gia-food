import { Module } from '@nestjs/common';

import { DeliveryGateway } from '../../gateways/delivery.gateway';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, DeliveryGateway],
  exports: [OrdersService],
})
export class OrdersModule {}
