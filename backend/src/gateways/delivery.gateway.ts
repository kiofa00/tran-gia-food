import { Injectable, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OrderStatus } from '@prisma/client';
import { Server, Socket } from 'socket.io';

/**
 * DeliveryGateway -- namespace /delivery
 *
 * Rooms convention:
 *   order-{orderId}   -> joined by Customer + Shipper + Restaurant for a specific order
 *   shipper-{userId}  -> joined by admin dashboard to track a specific shipper
 *   admin             -> joined by admin clients to receive broadcast events
 *
 * Events emitted by server:
 *   shipper-location-changed  -> real-time shipper GPS update
 *   order-status-changed      -> when order status transitions
 *   new-order-available       -> broadcast to available shippers
 *   chat-message              -> relay chat message within order room
 *   shipper-online-changed    -> shipper online/offline status change
 */

// ---------------------------------------------------------------------------
// Room name constants — avoid magic strings scattered across the class
// ---------------------------------------------------------------------------
const ADMIN_ROOM = 'admin';
const ORDER_ROOM_PREFIX = 'order-';
const USER_ROOM_PREFIX = 'user-';

@Injectable()
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/delivery',
})
export class DeliveryGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // Injected by NestJS WebSocketGateway after gateway is initialised.
  // Safe to use inside any lifecycle / event handler.
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(DeliveryGateway.name);

  /** Map: socketId -> userId (to clean up on disconnect) */
  private readonly socketUserMap = new Map<string, string>();

  // --- Lifecycle -----------------------------------------------------------

  async handleConnection(client: Socket): Promise<void> {
    try {
      const userId = client.handshake.query['userId'] as string | undefined;
      if (userId) {
        this.socketUserMap.set(client.id, userId);
        await client.join(`${USER_ROOM_PREFIX}${userId}`);
        this.logger.log(`User ${userId} connected: ${client.id}`);
      } else {
        this.logger.log(`Anonymous client connected: ${client.id}`);
      }
    } catch (error) {
      this.logger.error(`handleConnection error for ${client.id}: ${String(error)}`);
    }
  }

  handleDisconnect(client: Socket): void {
    const userId = this.socketUserMap.get(client.id);
    if (userId) {
      this.socketUserMap.delete(client.id);
      this.logger.log(`User ${userId} disconnected: ${client.id}`);
    } else {
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  }

  // --- Room management -----------------------------------------------------

  /** Customer / Shipper / Restaurant joins an order room */
  @SubscribeMessage('join-order-room')
  async handleJoinOrderRoom(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<{ event: string; orderId: string }> {
    try {
      const room = `${ORDER_ROOM_PREFIX}${data.orderId}`;
      await client.join(room);
      this.logger.log(`${client.id} joined ${room}`);
    } catch (error) {
      this.logger.error(`handleJoinOrderRoom error: ${String(error)}`);
    }
    return { event: 'joined-room', orderId: data.orderId };
  }

  /** Leave an order room (e.g., when navigating away) */
  @SubscribeMessage('leave-order-room')
  async handleLeaveOrderRoom(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<{ event: string; orderId: string }> {
    try {
      const room = `${ORDER_ROOM_PREFIX}${data.orderId}`;
      await client.leave(room);
    } catch (error) {
      this.logger.error(`handleLeaveOrderRoom error: ${String(error)}`);
    }
    return { event: 'left-room', orderId: data.orderId };
  }

  /** Admin dashboard joins the admin room for global broadcasts */
  @SubscribeMessage('join-admin-room')
  async handleJoinAdminRoom(@ConnectedSocket() client: Socket): Promise<{ event: string }> {
    try {
      await client.join(ADMIN_ROOM);
    } catch (error) {
      this.logger.error(`handleJoinAdminRoom error: ${String(error)}`);
    }
    return { event: 'joined-admin-room' };
  }

  // --- Location tracking ---------------------------------------------------

  /** Shipper pushes GPS coordinates -- relayed to order room + admin */
  @SubscribeMessage('update-shipper-location')
  handleUpdateLocation(
    @MessageBody()
    data: {
      orderId: string;
      shipperId: string;
      lat: number;
      lng: number;
    },
  ): void {
    const payload = {
      orderId: data.orderId,
      shipperId: data.shipperId,
      lat: data.lat,
      lng: data.lng,
      timestamp: new Date().toISOString(),
    };

    // Notify order participants
    this.server.to(`${ORDER_ROOM_PREFIX}${data.orderId}`).emit('shipper-location-changed', payload);

    // Notify admin fleet map
    this.server.to(ADMIN_ROOM).emit('shipper-location-changed', payload);

    this.logger.verbose(
      `Shipper ${data.shipperId} @ (${data.lat}, ${data.lng}) for order ${data.orderId}`,
    );
  }

  // --- Order status --------------------------------------------------------

  /**
   * Called by OrdersService when status changes.
   * Not a @SubscribeMessage -- called internally by the backend.
   */
  emitOrderStatusChanged(
    orderId: string,
    status: OrderStatus,
    meta?: Record<string, unknown>,
  ): void {
    const payload = { orderId, status, meta, timestamp: new Date().toISOString() };
    this.server.to(`${ORDER_ROOM_PREFIX}${orderId}`).emit('order-status-changed', payload);
    this.server.to(ADMIN_ROOM).emit('order-status-changed', payload);
    this.logger.log(`Order ${orderId} status -> ${status}`);
  }

  // --- New order broadcast -------------------------------------------------

  /**
   * Broadcast a new available order to all online shippers within radius.
   * Called by OrdersService after creating an order.
   */
  emitNewOrderAvailable(orderData: {
    orderId: string;
    restaurantId: string;
    restaurantName: string;
    restaurantLat: number;
    restaurantLng: number;
    deliveryLat: number;
    deliveryLng: number;
    distanceKm: number;
    shipFee: number;
  }): void {
    this.server.emit('new-order-available', {
      ...orderData,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`New order ${orderData.orderId} broadcast to all shippers`);
  }

  // --- Chat relay ----------------------------------------------------------

  /**
   * Relay a chat message to order room participants.
   * Called by ChatService after persisting the message.
   */
  emitChatMessage(
    orderId: string,
    message: {
      id: string;
      senderId: string;
      senderName: string;
      content: string;
      type: string;
      createdAt: string;
    },
  ): void {
    this.server.to(`${ORDER_ROOM_PREFIX}${orderId}`).emit('chat-message', { orderId, message });
  }

  // --- Shipper availability ------------------------------------------------

  /** Shipper toggles online/offline -- relay to admin dashboard */
  @SubscribeMessage('shipper-status-changed')
  handleShipperStatusChanged(@MessageBody() data: { shipperId: string; isActive: boolean }): void {
    this.server.to(ADMIN_ROOM).emit('shipper-online-changed', {
      shipperId: data.shipperId,
      isActive: data.isActive,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Shipper ${data.shipperId} online=${data.isActive}`);
  }

  // --- Customer ETA ping ---------------------------------------------------

  /** Shipper emits ETA estimate for current delivery */
  @SubscribeMessage('emit-eta')
  handleEmitEta(@MessageBody() data: { orderId: string; etaMinutes: number }): void {
    this.server.to(`${ORDER_ROOM_PREFIX}${data.orderId}`).emit('eta-updated', {
      orderId: data.orderId,
      etaMinutes: data.etaMinutes,
      timestamp: new Date().toISOString(),
    });
  }
}
