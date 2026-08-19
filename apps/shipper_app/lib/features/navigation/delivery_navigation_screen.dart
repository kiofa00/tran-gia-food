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
          mapController: _mapController,
          currentStatus: _currentStatus.isEmpty
              ? (order['status'] as String? ?? '')
              : _currentStatus,
          onStatusUpdate: (status) {
            if (status == 'delivered') {
              _showProofOfDeliveryDialog(order['id'] as String);
            } else {
              _updateOrderStatus(order['id'] as String, status);
            }
          },
        ),
      ),
    );
  }

  void _showProofOfDeliveryDialog(String orderId) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: AppRadius.xl),
      ),
      builder: (ctx) => _ProofOfDeliverySheet(
        orderId: orderId,
        onConfirm: (photoAttached, note) {
          Navigator.of(ctx).pop();
          _updateOrderStatus(orderId, 'delivered', podNote: note);
        },
      ),
    );
  }

  Future<void> _updateOrderStatus(String orderId, String status, {String? podNote}) async {
    try {
      final api = ref.read(apiClientProvider);
      await api.patch('/orders/$orderId/status', {
        'status': status,
        'podNote': ?podNote,
      });
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
        'picking_up' => 'Đang di chuyển đến quán lấy hàng',
        'delivering' => 'Đã lấy món, đang giao cho khách',
        'delivered' => 'Đã giao hàng thành công!',
        _ => 'Đã cập nhật trạng thái đơn',
      };
}

// ---------------------------------------------------------------------------
// Proof of Delivery Sheet (POD)
// ---------------------------------------------------------------------------

class _ProofOfDeliverySheet extends StatefulWidget {
  final String orderId;
  final Function(bool photoAttached, String note) onConfirm;

  const _ProofOfDeliverySheet({
    required this.orderId,
    required this.onConfirm,
  });

  @override
  State<_ProofOfDeliverySheet> createState() => _ProofOfDeliverySheetState();
}

class _ProofOfDeliverySheetState extends State<_ProofOfDeliverySheet> {
  bool _hasPhoto = true;
  String _selectedNote = 'Giao tận tay khách hàng';
  final _customNoteController = TextEditingController();

  final List<String> _quickNotes = [
    'Giao tận tay khách hàng',
    'Để trước cửa nhà / Cổng',
    'Gửi bàn lễ tân / Bảo vệ',
    'Người thân nhận hộ',
  ];

  @override
  void dispose() {
    _customNoteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.1),
                  borderRadius: const BorderRadius.all(AppRadius.sm),
                ),
                child: const Icon(Iconsax.camera5, color: AppColors.success, size: 24),
              ),
              const SizedBox(width: 12),
              const Text(
                'Bằng Chứng Giao Hàng (POD)',
                style: TextStyle(
                  fontSize: AppFontSize.lg,
                  fontWeight: AppFontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Photo Upload Mock
          GestureDetector(
            onTap: () => setState(() => _hasPhoto = !_hasPhoto),
            child: Container(
              width: double.infinity,
              height: 140,
              decoration: BoxDecoration(
                color: _hasPhoto
                    ? AppColors.success.withValues(alpha: 0.08)
                    : AppColors.surfaceAltLight,
                borderRadius: const BorderRadius.all(AppRadius.md),
                border: Border.all(
                  color: _hasPhoto ? AppColors.success : AppColors.dividerLight,
                  width: _hasPhoto ? 1.5 : 1.0,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    _hasPhoto ? Iconsax.tick_circle5 : Iconsax.camera,
                    color: _hasPhoto ? AppColors.success : AppColors.primary,
                    size: 36,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _hasPhoto ? 'Ảnh gói hàng đã chụp ✓' : 'Chạm để chụp ảnh minh chứng gói hàng',
                    style: TextStyle(
                      fontSize: AppFontSize.sm,
                      fontWeight: _hasPhoto ? AppFontWeight.bold : AppFontWeight.medium,
                      color: _hasPhoto ? AppColors.success : AppColors.textPrimaryLight,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _hasPhoto ? 'Chạm để chụp lại' : 'Khuyến nghị chụp rõ số nhà hoặc vị trí đặt',
                    style: const TextStyle(fontSize: AppFontSize.xs, color: AppColors.textSecondaryLight),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          const Text(
            'Ghi chú giao hàng',
            style: TextStyle(fontSize: AppFontSize.sm, fontWeight: AppFontWeight.bold),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _quickNotes.map((note) {
              final isSelected = _selectedNote == note;
              return ChoiceChip(
                label: Text(note),
                selected: isSelected,
                selectedColor: AppColors.primary.withValues(alpha: 0.15),
                backgroundColor: AppColors.surfaceAltLight,
                labelStyle: TextStyle(
                  fontSize: AppFontSize.xs,
                  fontWeight: isSelected ? AppFontWeight.bold : AppFontWeight.medium,
                  color: isSelected ? AppColors.primary : AppColors.textPrimaryLight,
                ),
                side: BorderSide(
                  color: isSelected ? AppColors.primary : Colors.transparent,
                ),
                onSelected: (_) => setState(() => _selectedNote = note),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),

          AppButton(
            text: 'Hoàn Thành Đơn Hàng',
            icon: Iconsax.tick_circle,
            onPressed: () {
              widget.onConfirm(_hasPhoto, _selectedNote);
            },
          ),
        ],
      ),
    );
  }
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
                      tooltip: restaurant['name'] as String? ?? 'Quán',
                    ),
                  ),
                  Marker(
                    point: LatLng(delivLat, delivLng),
                    width: 44,
                    height: 44,
                    child: _MapPin(
                      icon: Iconsax.location5,
                      color: AppColors.success,
                      tooltip: 'Địa chỉ khách',
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
                        ? 'Giao đến: ${order['deliveryAddress'] ?? ''}'
                        : 'Đến lấy tại: ${restaurant['address'] ?? ''}',
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
                      text: 'Xác Nhận Đang Đến Lấy Hàng',
                      icon: Iconsax.shop,
                      onPressed: () => onStatusUpdate('picking_up'),
                    )
                  else if (currentStatus == 'picking_up')
                    AppButton(
                      text: 'Đã Lấy Hàng - Bắt Đầu Giao',
                      icon: Iconsax.truck_fast,
                      onPressed: () => onStatusUpdate('delivering'),
                    )
                  else if (currentStatus == 'delivering')
                    AppButton(
                      text: 'Xác Nhận & Chụp Ảnh Giao Hàng',
                      icon: Iconsax.camera,
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
                            'Đơn hàng đã hoàn thành',
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
        'confirmed' => 'Đơn đã xác nhận - Di chuyển đến quán',
        'picking_up' => 'Đang đến lấy hàng tại quán',
        'delivering' => 'Đang giao hàng cho khách',
        'delivered' => 'Đã giao hàng thành công',
        _ => 'Đang xử lý...',
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
