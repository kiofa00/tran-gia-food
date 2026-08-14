import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

final orderDetailProvider =
    FutureProvider.autoDispose.family<Map<String, dynamic>, String>((ref, orderId) async {
  final api = ref.read(apiClientProvider);
  return api.get('/orders/$orderId');
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class DeliveryNavigationScreen extends ConsumerStatefulWidget {
  final String orderId;
  const DeliveryNavigationScreen({super.key, required this.orderId});

  @override
  ConsumerState<DeliveryNavigationScreen> createState() =>
      _DeliveryNavigationScreenState();
}

class _DeliveryNavigationScreenState
    extends ConsumerState<DeliveryNavigationScreen> {
  // ignore: unused_field
  GoogleMapController? _mapController;
  String _currentStatus = '';

  @override
  Widget build(BuildContext context) {
    final orderAsync = ref.watch(orderDetailProvider(widget.orderId));

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Giao Hàng #${widget.orderId.length > 6 ? widget.orderId.substring(0, 6) : widget.orderId}',
          style: const TextStyle(fontWeight: AppFontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: orderAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Lỗi: ${e.toString()}')),
        data: (order) => _NavigationBody(
          order: order,
          currentStatus: _currentStatus.isEmpty ? (order['status'] as String? ?? '') : _currentStatus,
          onStatusUpdate: (status) => _updateOrderStatus(order['id'] as String, status),
          onMapCreated: (controller) => _mapController = controller,
        ),
      ),
    );
  }

  Future<void> _updateOrderStatus(String orderId, String status) async {
    try {
      final api = ref.read(apiClientProvider);
      await api.patch('/orders/$orderId/status', {'status': status});
      setState(() => _currentStatus = status);
      ref.invalidate(orderDetailProvider(widget.orderId));

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_statusMessage(status)),
          backgroundColor: AppColors.success,
        ),
      );

      if (status == 'delivered') {
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi: ${e.toString()}')),
      );
    }
  }

  String _statusMessage(String status) => switch (status) {
    'picking_up' => 'Đang di chuyển đến quán',
    'delivering' => 'Đã lấy hàng, đang giao cho khách',
    'delivered' => 'Đã giao hàng thành công!',
    _ => 'Đã cập nhật trạng thái',
  };
}

// ---------------------------------------------------------------------------
// Navigation body
// ---------------------------------------------------------------------------

class _NavigationBody extends StatelessWidget {
  final Map<String, dynamic> order;
  final String currentStatus;
  final ValueChanged<String> onStatusUpdate;
  final void Function(GoogleMapController) onMapCreated;

  const _NavigationBody({
    required this.order,
    required this.currentStatus,
    required this.onStatusUpdate,
    required this.onMapCreated,
  });

  @override
  Widget build(BuildContext context) {
    final restaurant = order['restaurant'] as Map<String, dynamic>? ?? {};
    final restLat = (restaurant['lat'] as num? ?? 10.762622).toDouble();
    final restLng = (restaurant['lng'] as num? ?? 106.660172).toDouble();
    final delivLat = (order['deliveryLat'] as num? ?? 10.7700).toDouble();
    final delivLng = (order['deliveryLng'] as num? ?? 106.6900).toDouble();

    final markers = {
      Marker(
        markerId: const MarkerId('restaurant'),
        position: LatLng(restLat, restLng),
        infoWindow: InfoWindow(title: restaurant['name'] as String? ?? 'Quán'),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
      ),
      Marker(
        markerId: const MarkerId('customer'),
        position: LatLng(delivLat, delivLng),
        infoWindow: const InfoWindow(title: 'Địa chỉ khách'),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
      ),
    };

    return Column(
      children: [
        // Google Map
        Expanded(
          flex: 6,
          child: GoogleMap(
            onMapCreated: onMapCreated,
            initialCameraPosition: CameraPosition(
              target: currentStatus == 'delivering'
                  ? LatLng(delivLat, delivLng)
                  : LatLng(restLat, restLng),
              zoom: 15,
            ),
            markers: markers,
            myLocationEnabled: true,
            myLocationButtonEnabled: true,
            mapType: MapType.normal,
          ),
        ),

        // Bottom status panel
        Expanded(
          flex: 4,
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: AppColors.surfaceLight,
              borderRadius: BorderRadius.vertical(top: AppRadius.xl),
              boxShadow: AppShadows.md,
            ),
            child: SafeArea(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Status indicator
                  Row(
                    children: [
                      Container(
                        width: 12, height: 12,
                        decoration: BoxDecoration(
                          color: _statusColor(currentStatus),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _statusLabel(currentStatus),
                        style: const TextStyle(fontSize: AppFontSize.title, fontWeight: AppFontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Destination info
                  Text(
                    currentStatus == 'delivering'
                        ? 'Giao đến: ${order['deliveryAddress'] ?? ''}'
                        : 'Đến lấy tại: ${restaurant['address'] ?? ''}',
                    style: const TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 16),

                  // Action button
                  if (currentStatus == 'confirmed' || currentStatus == 'pending')
                    AppButton(
                      text: 'Xác Nhận Đang Đến Lấy Hàng',
                      icon: Iconsax.shop,
                      onPressed: () => onStatusUpdate('picking_up'),
                    )
                  else if (currentStatus == 'picking_up')
                    AppButton(
                      text: 'Đã Lấy Hàng — Bắt Đầu Giao',
                      icon: Iconsax.truck_fast,
                      onPressed: () => onStatusUpdate('delivering'),
                    )
                  else if (currentStatus == 'delivering')
                    AppButton(
                      text: 'Xác Nhận Đã Giao Hàng ✅',
                      icon: Iconsax.tick_circle,
                      onPressed: () => onStatusUpdate('delivered'),
                    )
                  else
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.success.withValues(alpha: 0.1),
                        borderRadius: const BorderRadius.all(AppRadius.md),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Iconsax.tick_circle, color: AppColors.success),
                          SizedBox(width: 8),
                          Text('Đơn hàng đã hoàn thành', style: TextStyle(color: AppColors.success, fontWeight: AppFontWeight.bold)),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Color _statusColor(String s) => switch (s) {
    'picking_up' => AppColors.warning,
    'delivering' => AppColors.primary,
    'delivered' => AppColors.success,
    _ => AppColors.textSecondaryLight,
  };

  String _statusLabel(String s) => switch (s) {
    'confirmed' => 'Đơn đã xác nhận — Di chuyển đến quán',
    'picking_up' => 'Đang đến lấy hàng',
    'delivering' => 'Đang giao hàng cho khách',
    'delivered' => 'Đã giao xong',
    _ => 'Đang xử lý...',
  };
}
