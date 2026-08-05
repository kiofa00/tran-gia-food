import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/delivery',
})
export class DeliveryGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DeliveryGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to /delivery namespace: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from /delivery namespace: ${client.id}`);
  }

  @SubscribeMessage('join-order-room')
  handleJoinOrderRoom(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`order-${data.orderId}`);
    this.logger.log(`Client ${client.id} joined room order-${data.orderId}`);
    return { event: 'joined-room', orderId: data.orderId };
  }

  @SubscribeMessage('update-shipper-location')
  handleUpdateLocation(
    @MessageBody() data: { orderId: string; shipperId: string; lat: number; lng: number },
  ) {
    this.logger.log(
      `Shipper ${data.shipperId} location updated for order ${data.orderId}: (${data.lat}, ${data.lng})`,
    );
    this.server.to(`order-${data.orderId}`).emit('shipper-location-changed', {
      orderId: data.orderId,
      shipperId: data.shipperId,
      lat: data.lat,
      lng: data.lng,
      timestamp: new Date().toISOString(),
    });
  }
}
