import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '@prisma/client';
import { Server, Socket } from 'socket.io';

import { DeliveryGateway } from './delivery.gateway';

describe('DeliveryGateway', () => {
  let gateway: DeliveryGateway;

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };

  const mockSocket = {
    id: 'socket-client-1',
    handshake: { query: { userId: 'user-cust-1' } },
    join: jest.fn().mockResolvedValue(undefined),
    leave: jest.fn().mockResolvedValue(undefined),
  } as unknown as Socket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliveryGateway],
    }).compile();

    gateway = module.get<DeliveryGateway>(DeliveryGateway);
    gateway.server = mockServer as unknown as Server;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('Lifecycle & Room Management', () => {
    it('should join user room on connection when userId provided', async () => {
      await gateway.handleConnection(mockSocket);
      expect(mockSocket.join).toHaveBeenCalledWith('user-user-cust-1');
    });

    it('should handle join-order-room and join room', async () => {
      const res = await gateway.handleJoinOrderRoom({ orderId: 'ord-123' }, mockSocket);
      expect(res.event).toBe('joined-room');
      expect(mockSocket.join).toHaveBeenCalledWith('order-ord-123');
    });

    it('should handle leave-order-room and leave room', async () => {
      const res = await gateway.handleLeaveOrderRoom({ orderId: 'ord-123' }, mockSocket);
      expect(res.event).toBe('left-room');
      expect(mockSocket.leave).toHaveBeenCalledWith('order-ord-123');
    });

    it('should handle join-admin-room', async () => {
      const res = await gateway.handleJoinAdminRoom(mockSocket);
      expect(res.event).toBe('joined-admin-room');
      expect(mockSocket.join).toHaveBeenCalledWith('admin');
    });
  });

  describe('Location & Route Tracking', () => {
    it('should broadcast location change to order room and admin', () => {
      gateway.handleUpdateLocation({
        orderId: 'ord-123',
        shipperId: 'ship-1',
        lat: 16.068,
        lng: 108.212,
      });

      expect(mockServer.to).toHaveBeenCalledWith('order-ord-123');
      expect(mockServer.to).toHaveBeenCalledWith('admin');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'shipper-location-changed',
        expect.objectContaining({ orderId: 'ord-123', shipperId: 'ship-1' }),
      );
    });

    it('should broadcast polyline coordinates to order room and admin', () => {
      gateway.handleUpdateRoutePolyline({
        orderId: 'ord-123',
        shipperId: 'ship-1',
        polyline: [
          { lat: 16.068, lng: 108.212 },
          { lat: 16.07, lng: 108.215 },
        ],
      });

      expect(mockServer.to).toHaveBeenCalledWith('order-ord-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'route-polyline-changed',
        expect.objectContaining({ orderId: 'ord-123', polyline: expect.any(Array) }),
      );
    });
  });

  describe('Kitchen Status & Order Status', () => {
    it('should broadcast kitchen status changes', () => {
      gateway.handleKitchenStatusUpdate({
        orderId: 'ord-123',
        restaurantId: 'rest-1',
        step: 'cooking',
        estimatedMinutes: 15,
      });

      expect(mockServer.to).toHaveBeenCalledWith('order-ord-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'kitchen-status-changed',
        expect.objectContaining({ orderId: 'ord-123', step: 'cooking', estimatedMinutes: 15 }),
      );
    });

    it('should broadcast order status changes via emitOrderStatusChanged', () => {
      gateway.emitOrderStatusChanged('ord-123', OrderStatus.delivering);

      expect(mockServer.to).toHaveBeenCalledWith('order-ord-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'order-status-changed',
        expect.objectContaining({ orderId: 'ord-123', status: OrderStatus.delivering }),
      );
    });
  });

  describe('Heartbeat & Latency Ping', () => {
    it('should respond to connection-heartbeat with pong and metadata', () => {
      const response = gateway.handleConnectionHeartbeat({
        userId: 'ship-1',
        batteryLevel: 85,
        networkType: '4g',
      });

      expect(response.status).toBe('pong');
      expect(response.serverTime).toBeDefined();
      expect(response.receivedMeta.batteryLevel).toBe(85);
    });
  });
});
