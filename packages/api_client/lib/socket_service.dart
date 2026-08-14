import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

// ---------------------------------------------------------------------------
// Resolve base URL (same logic as ApiClient)
// ---------------------------------------------------------------------------

String _resolveWsBaseUrl() {
  // In production, replace with your actual domain
  const env = String.fromEnvironment('WS_URL', defaultValue: '');
  if (env.isNotEmpty) return env;
  return 'http://10.0.2.2:3000'; // Android emulator default
}

// ---------------------------------------------------------------------------
// Events (server → client)
// ---------------------------------------------------------------------------

/// All WebSocket event names emitted by the delivery namespace
class DeliveryEvents {
  static const String shipperLocationChanged = 'shipper-location-changed';
  static const String orderStatusChanged = 'order-status-changed';
  static const String newOrderAvailable = 'new-order-available';
  static const String chatMessage = 'chat-message';
  static const String shipperOnlineChanged = 'shipper-online-changed';
  static const String etaUpdated = 'eta-updated';
  static const String joinedRoom = 'joined-room';
}

// ---------------------------------------------------------------------------
// SocketService
// ---------------------------------------------------------------------------

class SocketService {
  io.Socket? _socket;
  bool _isConnected = false;

  bool get isConnected => _isConnected;

  // ─── Connect ──────────────────────────────────────────────────────────────

  void connect(String userId) {
    if (_isConnected) return;

    final baseUrl = _resolveWsBaseUrl();

    _socket = io.io(
      '$baseUrl/delivery',
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setQuery({'userId': userId})
          .build(),
    );

    _socket!.onConnect((_) {
      _isConnected = true;
      // ignore: avoid_print
      print('[Socket] Connected as user $userId');
    });

    _socket!.onDisconnect((_) {
      _isConnected = false;
      // ignore: avoid_print
      print('[Socket] Disconnected');
    });

    _socket!.onConnectError((e) {
      // ignore: avoid_print
      print('[Socket] Connection error: $e');
    });

    _socket!.connect();
  }

  // ─── Disconnect ───────────────────────────────────────────────────────────

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
  }

  // ─── Room management ──────────────────────────────────────────────────────

  void joinOrderRoom(String orderId) {
    _emit('join-order-room', {'orderId': orderId});
  }

  void leaveOrderRoom(String orderId) {
    _emit('leave-order-room', {'orderId': orderId});
  }

  void joinAdminRoom() {
    _emit('join-admin-room', {});
  }

  // ─── Shipper actions ──────────────────────────────────────────────────────

  /// Push GPS coordinates for current delivery
  void updateLocation({
    required String orderId,
    required String shipperId,
    required double lat,
    required double lng,
  }) {
    _emit('update-shipper-location', {
      'orderId': orderId,
      'shipperId': shipperId,
      'lat': lat,
      'lng': lng,
    });
  }

  /// Toggle shipper online/offline status
  void emitShipperStatusChanged(String shipperId, {required bool isActive}) {
    _emit('shipper-status-changed', {'shipperId': shipperId, 'isActive': isActive});
  }

  /// Emit ETA to customer
  void emitEta(String orderId, int etaMinutes) {
    _emit('emit-eta', {'orderId': orderId, 'etaMinutes': etaMinutes});
  }

  // ─── Listeners ────────────────────────────────────────────────────────────

  void onShipperLocationChanged(void Function(Map<String, dynamic>) handler) {
    _on(DeliveryEvents.shipperLocationChanged, handler);
  }

  void onOrderStatusChanged(void Function(Map<String, dynamic>) handler) {
    _on(DeliveryEvents.orderStatusChanged, handler);
  }

  void onNewOrderAvailable(void Function(Map<String, dynamic>) handler) {
    _on(DeliveryEvents.newOrderAvailable, handler);
  }

  void onChatMessage(void Function(Map<String, dynamic>) handler) {
    _on(DeliveryEvents.chatMessage, handler);
  }

  void onEtaUpdated(void Function(Map<String, dynamic>) handler) {
    _on(DeliveryEvents.etaUpdated, handler);
  }

  /// Remove all listeners for a given event
  void off(String event) => _socket?.off(event);

  // ─── Private helpers ──────────────────────────────────────────────────────

  void _emit(String event, dynamic data) {
    if (!_isConnected || _socket == null) {
      // ignore: avoid_print
      print('[Socket] Cannot emit "$event" — not connected');
      return;
    }
    _socket!.emit(event, data);
  }

  void _on(String event, void Function(Map<String, dynamic>) handler) {
    _socket?.on(event, (data) {
      if (data is Map) {
        handler(Map<String, dynamic>.from(data));
      }
    });
  }
}

// ---------------------------------------------------------------------------
// Riverpod provider
// ---------------------------------------------------------------------------

final socketServiceProvider = Provider<SocketService>((ref) {
  final service = SocketService();
  ref.onDispose(service.disconnect);
  return service;
});
