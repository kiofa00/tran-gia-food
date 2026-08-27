import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_ui/shared_ui.dart';
import 'package:iconsax/iconsax.dart';
import 'package:go_router/go_router.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final orderTrackingProvider =
    FutureProvider.autoDispose.family<Map<String, dynamic>, String>((ref, orderId) async {
  final api = ref.read(apiClientProvider);
  final hasToken = await api.hasToken();
  if (!hasToken) return {};
  try {
    return await api.get('/orders/$orderId');
  } catch (e) {
    if (e is ApiException && e.isUnauthorized) return {};
    rethrow;
  }
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/// Real-time Order Tracking Screen displaying shipper movement and order status
class OrderTrackingScreen extends ConsumerWidget {
  final String orderId;

  const OrderTrackingScreen({
    super.key,
    required this.orderId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final orderAsync = ref.watch(orderTrackingProvider(orderId));

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Theo Dõi Đơn #${orderId.length > 6 ? orderId.substring(0, 6) : orderId}',
          style: const TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.title),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => context.pop(),
        ),
      ),
      body: orderAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text('Lỗi: $e', style: const TextStyle(color: AppColors.error)),
          ),
        ),
        data: (order) {
          final status = order['status'] as String? ?? 'pending';
          final shipper = order['shipper'] as Map<String, dynamic>?;
          final shipperUser = shipper?['user'] as Map<String, dynamic>?;
          final shipperName = shipperUser?['name'] as String? ?? 'Tài xế đang điều phối';
          final shipperPhone = shipperUser?['phone'] as String? ?? '';
          final vehiclePlate = shipper?['licensePlate'] as String? ?? 'Đang cập nhật';

          final (statusText, progressVal) = switch (status) {
            'pending' => ('Đơn hàng đang chờ quán nhận...', 0.2),
            'confirmed' => ('Quán đã nhận đơn & đang chuẩn bị món', 0.4),
            'picking_up' => ('Tài xế đang đến quán lấy món', 0.6),
            'delivering' => ('Tài xế đã lấy món, đang giao đến bạn 🛵', 0.8),
            'delivered' => ('Đơn hàng đã giao thành công! 🎉', 1.0),
            'cancelled' => ('Đơn hàng đã bị hủy', 0.0),
            _ => ('Đang xử lý đơn hàng', 0.5),
          };

          return Column(
            children: [
              // Simulated Google Maps Container View
              Expanded(
                child: Container(
                  width: double.infinity,
                  color: isDark ? AppColors.surfaceDark : AppColors.surfaceAltLight,
                  child: Stack(
                    children: [
                      Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Iconsax.map5, size: 64, color: AppColors.primaryLight),
                            const SizedBox(height: 12),
                            Text(
                              'Bản Đồ Giao Hàng Trực Tiếp',
                              style: TextStyle(
                                fontSize: AppFontSize.title,
                                fontWeight: AppFontWeight.bold,
                                color: isDark ? Colors.white70 : AppColors.textSecondaryLight,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Positioned(
                        left: 140,
                        top: 160,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: const BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                            boxShadow: AppShadows.md,
                          ),
                          child: const Icon(Iconsax.user_tag, color: Colors.white, size: 24),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Bottom Real-time Status Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
                  borderRadius: const BorderRadius.vertical(top: AppRadius.lg),
                  boxShadow: AppShadows.md,
                ),
                child: SafeArea(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Progress Bar
                      ClipRRect(
                        borderRadius: const BorderRadius.all(AppRadius.full),
                        child: LinearProgressIndicator(
                          value: progressVal,
                          minHeight: 8,
                          backgroundColor: AppColors.surfaceAltLight,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Status Text
                      Row(
                        children: [
                          const Icon(Iconsax.truck_fast, color: AppColors.primary, size: 28),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  statusText,
                                  style: const TextStyle(fontSize: AppFontSize.base, fontWeight: AppFontWeight.bold),
                                ),
                                const SizedBox(height: 2),
                                const Text(
                                  'Cập nhật trực tiếp từ hệ thống',
                                  style: TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Shipper Profile Card
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: const BoxDecoration(
                          color: AppColors.surfaceAltLight,
                          borderRadius: BorderRadius.all(AppRadius.md),
                        ),
                        child: Row(
                          children: [
                            const CircleAvatar(
                              backgroundColor: AppColors.primary,
                              child: Icon(Icons.person, color: Colors.white),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Tài Xế: $shipperName', style: const TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.md)),
                                  Text('Biển số: $vehiclePlate', style: const TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight)),
                                ],
                              ),
                            ),
                            if (shipperPhone.isNotEmpty)
                              IconButton(
                                icon: const Icon(Iconsax.call5, color: AppColors.success),
                                onPressed: () {},
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
