import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:iconsax/iconsax.dart';
import 'package:latlong2/latlong.dart';
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
  final _mapController = MapController();
  String _currentStatus = '';

  @override
  Widget build(BuildContext context) {
    final orderAsync = ref.watch(orderDetailProvider(widget.orderId));

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Giao Hang #${widget.orderId.length > 6 ? widget.orderId.substring(0, 6) : widget.orderId}',
          style: const TextStyle(fontWeight: AppFontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: orderAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Loi: ${e.toString()}')),
        data: (order) => _NavigationBody(
          order: order,
          mapController: _mapController,
          currentStatus: _currentStatus.isEmpty
              ? (order['status'] as String? ?? '')
              : _currentStatus,
          onStatusUpdate: (status) =>
              _updateOrderStatus(order['id'] as String, status),
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
        SnackBar(content: Text('Loi: ${e.toString()}')),
      );
    }
  }

  String _statusMessage(String status) => switch (status) {
        'picking_up' => 'Dang di chuyen den quan',
        'delivering' => 'Da lay hang, dang giao cho khach',
        'delivered' => 'Da giao hang thanh cong!',
        _ => 'Da cap nhat trang thai',
      };
}

// ---------------------------------------------------------------------------
// Navigation body
// ---------------------------------------------------------------------------

class _NavigationBody extends StatelessWidget {
  final Map<String, dynamic> order;
  final String currentStatus;
  final ValueChanged<String> onStatusUpdate;
  final MapController mapController;

  const _NavigationBody({
    required this.order,
    required this.currentStatus,
    required this.onStatusUpdate,
    required this.mapController,
  });

  @override
  Widget build(BuildContext context) {
    final restaurant = order['restaurant'] as Map<String, dynamic>? ?? {};
    final restLat = (restaurant['lat'] as num? ?? 10.762622).toDouble();
    final restLng = (restaurant['lng'] as num? ?? 106.660172).toDouble();
    final delivLat = (order['deliveryLat'] as num? ?? 10.7700).toDouble();
    final delivLng = (order['deliveryLng'] as num? ?? 106.6900).toDouble();

    final centerLat = currentStatus == 'delivering' ? delivLat : restLat;
    final centerLng = currentStatus == 'delivering' ? delivLng : restLng;

    return Column(
      children: [
        Expanded(
          flex: 6,
          child: FlutterMap(
            mapController: mapController,
            options: MapOptions(
              initialCenter: LatLng(centerLat, centerLng),
              initialZoom: 15,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.trangia.shipper',
              ),
              MarkerLayer(
                markers: [
                  Marker(
                    point: LatLng(restLat, restLng),
                    width: 44,
                    height: 44,
                    child: _MapPin(
                      icon: Iconsax.shop,
                      color: AppColors.warning,
                      tooltip: restaurant['name'] as String? ?? 'Quan',
                    ),
                  ),
                  Marker(
                    point: LatLng(delivLat, delivLng),
                    width: 44,
                    height: 44,
                    child: _MapPin(
                      icon: Iconsax.location5,
                      color: AppColors.success,
                      tooltip: 'Dia chi khach',
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
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
                  Row(
                    children: [
                      Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: _statusColor(currentStatus),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _statusLabel(currentStatus),
                        style: const TextStyle(
                          fontSize: AppFontSize.title,
                          fontWeight: AppFontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    currentStatus == 'delivering'
                        ? 'Giao den: ${order['deliveryAddress'] ?? ''}'
                        : 'Den lay tai: ${restaurant['address'] ?? ''}',
                    style: const TextStyle(
                      fontSize: AppFontSize.sm,
                      color: AppColors.textSecondaryLight,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 16),
                  if (currentStatus == 'confirmed' || currentStatus == 'pending')
                    AppButton(
                      text: 'Xac Nhan Dang Den Lay Hang',
                      icon: Iconsax.shop,
                      onPressed: () => onStatusUpdate('picking_up'),
                    )
                  else if (currentStatus == 'picking_up')
                    AppButton(
                      text: 'Da Lay Hang - Bat Dau Giao',
                      icon: Iconsax.truck_fast,
                      onPressed: () => onStatusUpdate('delivering'),
                    )
                  else if (currentStatus == 'delivering')
                    AppButton(
                      text: 'Xac Nhan Da Giao Hang',
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
                          Text(
                            'Don hang da hoan thanh',
                            style: TextStyle(
                              color: AppColors.success,
                              fontWeight: AppFontWeight.bold,
                            ),
                          ),
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
        'confirmed' => 'Don da xac nhan - Di chuyen den quan',
        'picking_up' => 'Dang den lay hang',
        'delivering' => 'Dang giao hang cho khach',
        'delivered' => 'Da giao xong',
        _ => 'Dang xu ly...',
      };
}

class _MapPin extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String tooltip;

  const _MapPin({
    required this.icon,
    required this.color,
    required this.tooltip,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Container(
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: color.withValues(alpha: 0.4),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Icon(icon, color: Colors.white, size: 22),
      ),
    );
  }
}
