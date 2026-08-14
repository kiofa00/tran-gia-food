import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';
import '../delivery/order_accept_dialog.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

class _ShipperStatusNotifier extends Notifier<bool> {
  @override
  bool build() => false; // isOnline
  void toggle() => state = !state;
  void set(bool val) => state = val;
}

final shipperStatusProvider =
    NotifierProvider<_ShipperStatusNotifier, bool>(
  _ShipperStatusNotifier.new,
);

final availableOrdersProvider =
    FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  return api.get('/shippers/available-orders');
});

final activeOrderProvider =
    FutureProvider.autoDispose<Map<String, dynamic>?>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    return await api.get('/shippers/active-order');
  } catch (_) {
    return null;
  }
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class AvailableOrdersScreen extends ConsumerWidget {
  const AvailableOrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isOnline = ref.watch(shipperStatusProvider);
    final activeOrderAsync = ref.watch(activeOrderProvider);
    final availableAsync = ref.watch(availableOrdersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Shipper Driver 🚴',
          style: TextStyle(fontWeight: AppFontWeight.bold),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: Row(
              children: [
                Text(
                  isOnline ? 'Sẵn sàng' : 'Nghỉ',
                  style: TextStyle(
                    fontWeight: AppFontWeight.bold,
                    color: isOnline ? AppColors.success : AppColors.error,
                  ),
                ),
                Switch(
                  value: isOnline,
                  activeTrackColor: AppColors.success,
                  onChanged: (val) => _toggleOnlineStatus(ref, val),
                ),
              ],
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(activeOrderProvider);
          ref.invalidate(availableOrdersProvider);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Earnings today summary
              _EarningsBanner(),
              const SizedBox(height: 20),

              // Active order (if any)
              activeOrderAsync.when(
                loading: () => const SizedBox.shrink(),
                error: (_, _) => const SizedBox.shrink(),
                data: (order) {
                  if (order == null) return const SizedBox.shrink();
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Đơn Đang Thực Hiện',
                        style: TextStyle(fontSize: AppFontSize.title, fontWeight: AppFontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      _ActiveOrderCard(order: order),
                      const SizedBox(height: 20),
                    ],
                  );
                },
              ),

              // Available orders
              if (!isOnline)
                _OfflineCard()
              else
                availableAsync.when(
                  loading: () => const Center(child: Padding(
                    padding: EdgeInsets.all(40),
                    child: CircularProgressIndicator(),
                  )),
                  error: (e, _) => _ErrorCard(message: e.toString()),
                  data: (res) {
                    final orders = List<Map<String, dynamic>>.from(res['data'] ?? []);
                    if (orders.isEmpty) return _EmptyOrdersCard();
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Đơn Chờ Nhận (${orders.length})',
                          style: const TextStyle(fontSize: AppFontSize.title, fontWeight: AppFontWeight.bold),
                        ),
                        const SizedBox(height: 12),
                        ...orders.map((order) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _AvailableOrderCard(
                            order: order,
                            onAccept: () => _acceptOrder(context, ref, order),
                          ),
                        )),
                      ],
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _toggleOnlineStatus(WidgetRef ref, bool val) async {
    try {
      final api = ref.read(apiClientProvider);
      await api.patch('/shippers/me/status', {'isActive': val});
      ref.read(shipperStatusProvider.notifier).set(val);
    } catch (_) {
      // revert on error - state stays unchanged
    }
  }

  void _acceptOrder(BuildContext context, WidgetRef ref, Map<String, dynamic> order) {
    final restaurant = order['restaurant'] as Map<String, dynamic>? ?? {};
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => OrderAcceptDialog(
        orderId: order['id'] as String? ?? '',
        restaurantName: restaurant['name'] as String? ?? 'Nhà hàng',
        pickupAddress: restaurant['address'] as String? ?? '',
        deliveryAddress: order['deliveryAddress'] as String? ?? '',
        shipFee: ((order['shipFee'] as num? ?? 0) * 0.85).round(),
        onAccept: () async {
          Navigator.of(context).pop();
          try {
            final api = ref.read(apiClientProvider);
            await api.post('/orders/${order['id']}/accept', {});
            ref.invalidate(availableOrdersProvider);
            ref.invalidate(activeOrderProvider);
            if (context.mounted) {
              context.push('/navigate/${order['id']}');
            }
          } catch (e) {
            if (context.mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Lỗi nhận đơn: ${e.toString()}')),
              );
            }
          }
        },
        onReject: () => Navigator.of(context).pop(),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Sub-widgets
// ---------------------------------------------------------------------------

class _EarningsBanner extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return FutureBuilder<Map<String, dynamic>>(
      future: ref.read(apiClientProvider).get('/shippers/me/earnings/today'),
      builder: (context, snap) {
        final amount = snap.hasData
            ? (snap.data!['total'] as num? ?? 0)
            : 0;
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: AppGradients.orangeGradient,
            borderRadius: const BorderRadius.all(AppRadius.md),
          ),
          child: Row(
            children: [
              const Icon(Iconsax.wallet_25, color: Colors.white, size: 32),
              const SizedBox(width: 14),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Thu Nhập Hôm Nay', style: TextStyle(color: Colors.white70, fontSize: AppFontSize.sm)),
                  Text(
                    '${amount.toStringAsFixed(0).replaceAllMapped(RegExp(r"(\d)(?=(\d{3})+(?!\d))"), (m) => "${m[1]}.")}đ',
                    style: const TextStyle(color: Colors.white, fontSize: AppFontSize.xl, fontWeight: AppFontWeight.extraBold),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class _ActiveOrderCard extends StatelessWidget {
  final Map<String, dynamic> order;
  const _ActiveOrderCard({required this.order});

  @override
  Widget build(BuildContext context) {
    final restaurant = order['restaurant'] as Map<String, dynamic>? ?? {};
    final status = order['status'] as String? ?? '';
    final orderId = order['id'] as String? ?? '';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.1),
        borderRadius: const BorderRadius.all(AppRadius.md),
        border: const Border.fromBorderSide(BorderSide(color: AppColors.primary, width: 1.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Iconsax.truck_fast, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(restaurant['name'] as String? ?? 'Nhà hàng', style: const TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.md)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: AppColors.primary, borderRadius: const BorderRadius.all(AppRadius.full)),
                child: Text(_statusLabel(status), style: const TextStyle(color: Colors.white, fontSize: AppFontSize.xs, fontWeight: AppFontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(order['deliveryAddress'] as String? ?? '', style: const TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight)),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            icon: const Icon(Iconsax.routing5),
            label: const Text('Xem Bản Đồ'),
            onPressed: () => context.push('/navigate/$orderId'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 44),
            ),
          ),
        ],
      ),
    );
  }

  String _statusLabel(String s) => switch (s) {
    'picking_up' => 'Đang lấy hàng',
    'delivering' => 'Đang giao',
    _ => s,
  };
}

class _AvailableOrderCard extends StatelessWidget {
  final Map<String, dynamic> order;
  final VoidCallback onAccept;

  const _AvailableOrderCard({required this.order, required this.onAccept});

  @override
  Widget build(BuildContext context) {
    final restaurant = order['restaurant'] as Map<String, dynamic>? ?? {};
    final distanceKm = (order['distanceKm'] as num? ?? 0).toStringAsFixed(1);
    final shipFee = ((order['shipFee'] as num? ?? 0) * 0.85).toStringAsFixed(0);
    final deliveryAddress = order['deliveryAddress'] as String? ?? '';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: AppColors.surfaceAltLight,
        borderRadius: BorderRadius.all(AppRadius.md),
        boxShadow: AppShadows.sm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '+${shipFee.replaceAllMapped(RegExp(r"(\d)(?=(\d{3})+(?!\d))"), (m) => "${m[1]}.")}đ',
                style: const TextStyle(fontWeight: AppFontWeight.extraBold, color: AppColors.primary, fontSize: AppFontSize.title),
              ),
              Text('$distanceKm km', style: const TextStyle(fontWeight: AppFontWeight.bold, color: AppColors.textSecondaryLight)),
            ],
          ),
          const SizedBox(height: 12),
          Row(children: [
            const Icon(Iconsax.shop, color: AppColors.primary, size: 18),
            const SizedBox(width: 8),
            Expanded(child: Text(restaurant['name'] as String? ?? '', style: const TextStyle(fontWeight: AppFontWeight.bold))),
          ]),
          const SizedBox(height: 4),
          Row(children: [
            const Icon(Iconsax.location5, color: AppColors.success, size: 18),
            const SizedBox(width: 8),
            Expanded(child: Text(deliveryAddress, style: const TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight))),
          ]),
          const SizedBox(height: 16),
          AppButton(text: 'Nhận Đơn Ngay', icon: Iconsax.routing, onPressed: onAccept),
        ],
      ),
    );
  }
}

class _OfflineCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.error.withValues(alpha: 0.08),
        borderRadius: const BorderRadius.all(AppRadius.md),
        border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
      ),
      child: const Column(
        children: [
          Icon(Iconsax.pause_circle, size: 48, color: AppColors.error),
          SizedBox(height: 12),
          Text('Bạn Đang Offline', style: TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.lg, color: AppColors.error)),
          SizedBox(height: 8),
          Text('Bật trạng thái Sẵn sàng để nhận đơn hàng', style: TextStyle(color: AppColors.textSecondaryLight), textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

class _EmptyOrdersCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: AppColors.surfaceAltLight,
        borderRadius: BorderRadius.all(AppRadius.md),
      ),
      child: const Column(
        children: [
          Icon(Iconsax.routing, size: 48, color: AppColors.textSecondaryLight),
          SizedBox(height: 12),
          Text('Chưa có đơn mới', style: TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.lg)),
          SizedBox(height: 8),
          Text('Hệ thống sẽ thông báo ngay khi có đơn mới gần bạn', style: TextStyle(color: AppColors.textSecondaryLight), textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

class _ErrorCard extends StatelessWidget {
  final String message;
  const _ErrorCard({required this.message});
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: AppColors.surfaceAltLight,
        borderRadius: BorderRadius.all(AppRadius.md),
      ),
      child: Column(
        children: [
          const Icon(Iconsax.warning_2, color: AppColors.error, size: 36),
          const SizedBox(height: 8),
          Text(message, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textSecondaryLight, fontSize: AppFontSize.sm)),
        ],
      ),
    );
  }
}
