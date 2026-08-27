import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final restaurantOrdersProvider =
    FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  final result = await api.get('/orders/my-orders');
  final raw = result['data'] ?? result;
  if (raw is List) return raw.cast<Map<String, dynamic>>();
  return [];
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class RestaurantOrdersScreen extends ConsumerStatefulWidget {
  const RestaurantOrdersScreen({super.key});

  @override
  ConsumerState<RestaurantOrdersScreen> createState() =>
      _RestaurantOrdersScreenState();
}

class _RestaurantOrdersScreenState extends ConsumerState<RestaurantOrdersScreen> {
  bool _isOpen = true;

  Future<void> _updateStatus(String orderId, String status) async {
    try {
      final api = ref.read(apiClientProvider);
      await api.patch('/orders/$orderId/status', {'status': status});
      ref.invalidate(restaurantOrdersProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(status == 'confirmed' ? 'Đã nhận đơn hàng thành công!' : 'Đã từ chối đơn hàng'),
            backgroundColor: status == 'confirmed' ? AppColors.success : AppColors.error,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi cập nhật đơn: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final ordersAsync = ref.watch(restaurantOrdersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Quản Lý Đơn Hàng 🔔', style: TextStyle(fontWeight: AppFontWeight.bold)),
        actions: [
          Row(
            children: [
              Text(_isOpen ? 'Mở cửa' : 'Đóng cửa', style: TextStyle(fontWeight: AppFontWeight.bold, color: _isOpen ? AppColors.success : AppColors.error)),
              Switch(
                value: _isOpen,
                activeTrackColor: AppColors.success,
                onChanged: (val) => setState(() => _isOpen = val),
              ),
            ],
          ),
        ],
      ),
      body: ordersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Iconsax.warning_2, size: 48, color: AppColors.error),
              const SizedBox(height: 12),
              Text('Lỗi: $e', style: const TextStyle(color: AppColors.error)),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () => ref.invalidate(restaurantOrdersProvider),
                child: const Text('Thử lại'),
              ),
            ],
          ),
        ),
        data: (orders) {
          if (orders.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Iconsax.receipt_item, size: 56, color: AppColors.textHintLight),
                    SizedBox(height: 12),
                    Text(
                      'Hiện tại chưa có đơn hàng nào',
                      style: TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.title),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Đơn hàng mới từ khách sẽ xuất hiện tại đây theo thời gian thực',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight),
                    ),
                  ],
                ),
              ),
            );
          }

          final pendingOrders = orders.where((o) => o['status'] == 'pending').toList();
          final activeOrders = orders.where((o) => o['status'] != 'pending' && o['status'] != 'delivered' && o['status'] != 'cancelled').toList();

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(restaurantOrdersProvider),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (pendingOrders.isNotEmpty) ...[
                    Text(
                      'Đơn Hàng Mới Cần Nhận (${pendingOrders.length})',
                      style: const TextStyle(fontSize: AppFontSize.title, fontWeight: AppFontWeight.bold, color: AppColors.primary),
                    ),
                    const SizedBox(height: 12),
                    ...pendingOrders.map((o) => _buildOrderCard(order: o, showActions: true)),
                    const SizedBox(height: 24),
                  ],

                  if (activeOrders.isNotEmpty) ...[
                    Text(
                      'Đơn Đang Chế Biến / Giao (${activeOrders.length})',
                      style: const TextStyle(fontSize: AppFontSize.title, fontWeight: AppFontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    ...activeOrders.map((o) => _buildOrderCard(order: o, showActions: false)),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildOrderCard({
    required Map<String, dynamic> order,
    required bool showActions,
  }) {
    final id = (order['id'] as String? ?? '').substring(0, 8);
    final customer = order['customer'] as Map<String, dynamic>?;
    final customerName = customer?['name'] as String? ?? 'Khách hàng';
    final customerPhone = customer?['phone'] as String? ?? '';
    final total = (order['subtotal'] as num?)?.toInt() ?? 0;
    final status = order['status'] as String? ?? 'pending';

    final (statusText, statusColor) = switch (status) {
      'pending' => ('CHỜ XÁC NHẬN', AppColors.warning),
      'confirmed' => ('ĐANG CHẾ BIẾN', AppColors.info),
      'picking_up' => ('TÀI XẾ ĐANG ĐẾN', AppColors.primary),
      'delivering' => ('ĐANG GIAO HÀNG', AppColors.primary),
      'delivered' => ('HOÀN THÀNH', AppColors.success),
      _ => (status.toUpperCase(), AppColors.textSecondaryLight),
    };

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: AppColors.surfaceAltLight,
        borderRadius: BorderRadius.all(AppRadius.md),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('#$id', style: const TextStyle(fontWeight: AppFontWeight.extraBold, fontSize: AppFontSize.title)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.15), borderRadius: const BorderRadius.all(AppRadius.full)),
                child: Text(statusText, style: TextStyle(color: statusColor, fontWeight: AppFontWeight.bold, fontSize: AppFontSize.sm)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text('$customerName — $customerPhone', style: const TextStyle(fontWeight: AppFontWeight.semiBold, fontSize: AppFontSize.base)),
          const SizedBox(height: 12),
          Text('Tổng tiền: ${total.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ', style: const TextStyle(fontWeight: AppFontWeight.bold, color: AppColors.primary, fontSize: AppFontSize.base)),
          if (showActions) ...[
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _updateStatus(order['id'] as String, 'cancelled'),
                    style: OutlinedButton.styleFrom(foregroundColor: AppColors.error),
                    child: const Text('Từ Chối'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => _updateStatus(order['id'] as String, 'confirmed'),
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                    child: const Text('Nhận Đơn', style: TextStyle(color: Colors.white, fontWeight: AppFontWeight.bold)),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
