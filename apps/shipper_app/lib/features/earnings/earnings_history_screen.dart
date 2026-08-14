import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

enum EarningsPeriod { week, month, all }

class _EarningsPeriodNotifier extends Notifier<EarningsPeriod> {
  @override
  EarningsPeriod build() => EarningsPeriod.week;
  void set(EarningsPeriod p) => state = p;
}

final earningsPeriodProvider =
    NotifierProvider<_EarningsPeriodNotifier, EarningsPeriod>(
  _EarningsPeriodNotifier.new,
);

final earningsProvider =
    FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  final period = ref.watch(earningsPeriodProvider);
  return api.get('/shippers/me/earnings', query: {'period': period.name});
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class EarningsHistoryScreen extends ConsumerWidget {
  const EarningsHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final period = ref.watch(earningsPeriodProvider);
    final earningsAsync = ref.watch(earningsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Lịch Sử Thu Nhập', style: TextStyle(fontWeight: AppFontWeight.bold)),
      ),
      body: Column(
        children: [
          // Period toggle
          Container(
            margin: const EdgeInsets.all(16),
            decoration: const BoxDecoration(color: AppColors.surfaceAltLight, borderRadius: BorderRadius.all(AppRadius.md)),
            child: Row(
              children: EarningsPeriod.values.map((p) {
                final isSelected = period == p;
                final label = switch (p) {
                  EarningsPeriod.week => 'Tuần Này',
                  EarningsPeriod.month => 'Tháng Này',
                  EarningsPeriod.all => 'Tất Cả',
                };
                return Expanded(
                  child: GestureDetector(
                    onTap: () => ref.read(earningsPeriodProvider.notifier).set(p),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      margin: const EdgeInsets.all(4),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary : Colors.transparent,
                        borderRadius: const BorderRadius.all(AppRadius.sm),
                      ),
                      child: Text(label, textAlign: TextAlign.center, style: TextStyle(
                        color: isSelected ? Colors.white : AppColors.textSecondaryLight,
                        fontWeight: isSelected ? AppFontWeight.bold : AppFontWeight.medium,
                        fontSize: AppFontSize.sm,
                      )),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          Expanded(
            child: earningsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(
                child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  const Icon(Iconsax.warning_2, size: 48, color: AppColors.error),
                  const SizedBox(height: 12),
                  Text(e.toString(), textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textSecondaryLight)),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(icon: const Icon(Iconsax.refresh), label: const Text('Thử lại'), onPressed: () => ref.invalidate(earningsProvider)),
                ]),
              ),
              data: (res) => _EarningsBody(data: res),
            ),
          ),
        ],
      ),
    );
  }
}

class _EarningsBody extends StatelessWidget {
  final Map<String, dynamic> data;
  const _EarningsBody({required this.data});

  @override
  Widget build(BuildContext context) {
    final totalEarnings = (data['totalEarnings'] as num? ?? 0).toDouble();
    final totalOrders = (data['totalOrders'] as num? ?? 0).toInt();
    final avgPerOrder = totalOrders > 0 ? totalEarnings / totalOrders : 0.0;
    final orders = List<Map<String, dynamic>>.from(data['orders'] ?? []);

    return RefreshIndicator(
      onRefresh: () async {},
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          // Summary
          Row(children: [
            Expanded(child: _EarningCard(icon: Iconsax.money_recive, label: 'Tổng Thu Nhập', value: _currency(totalEarnings), color: AppColors.success)),
            const SizedBox(width: 12),
            Expanded(child: _EarningCard(icon: Iconsax.receipt_item, label: 'Số Đơn', value: '$totalOrders', color: AppColors.primary)),
          ]),
          const SizedBox(height: 12),
          _EarningCard(icon: Iconsax.chart, label: 'Trung Bình / Đơn', value: _currency(avgPerOrder.toDouble()), color: AppColors.info),

          const SizedBox(height: 24),
          const Text('Chi Tiết Từng Đơn', style: TextStyle(fontSize: AppFontSize.title, fontWeight: AppFontWeight.bold)),
          const SizedBox(height: 12),

          if (orders.isEmpty)
            const Center(child: Padding(
              padding: EdgeInsets.all(24),
              child: Text('Chưa có đơn hàng nào trong kỳ này', style: TextStyle(color: AppColors.textSecondaryLight)),
            ))
          else
            ...orders.map((order) => _OrderEarningTile(order: order)),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  String _currency(double v) => '${v.toStringAsFixed(0).replaceAllMapped(RegExp(r"(\d)(?=(\d{3})+(?!\d))"), (m) => "${m[1]}.")}đ';
}

class _EarningCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;
  const _EarningCard({required this.icon, required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: const BoxDecoration(color: AppColors.surfaceLight, borderRadius: BorderRadius.all(AppRadius.md), boxShadow: AppShadows.sm),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(height: 8),
        Text(value, style: TextStyle(fontSize: AppFontSize.lg, fontWeight: AppFontWeight.extraBold, color: color)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(fontSize: AppFontSize.xs, color: AppColors.textSecondaryLight)),
      ]),
    );
  }
}

class _OrderEarningTile extends StatelessWidget {
  final Map<String, dynamic> order;
  const _OrderEarningTile({required this.order});

  @override
  Widget build(BuildContext context) {
    final restaurant = order['restaurant'] as Map<String, dynamic>? ?? {};
    final shipFee = (order['shipFee'] as num? ?? 0).toDouble();
    final shipperEarning = shipFee * 0.85; // 85% cho shipper
    final status = order['status'] as String? ?? '';
    final createdAt = order['createdAt'] as String?;
    final statusColor = status == 'completed' ? AppColors.success : AppColors.warning;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: const BoxDecoration(color: AppColors.surfaceLight, borderRadius: BorderRadius.all(AppRadius.md), boxShadow: AppShadows.sm),
      child: Row(children: [
        Container(
          width: 40, height: 40,
          decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), shape: BoxShape.circle),
          child: const Icon(Iconsax.truck_fast, color: AppColors.primary, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(restaurant['name'] as String? ?? 'Nhà hàng', style: const TextStyle(fontWeight: AppFontWeight.bold)),
          if (createdAt != null) Text(_formatDate(createdAt), style: const TextStyle(fontSize: AppFontSize.xs, color: AppColors.textSecondaryLight)),
        ])),
        Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Text(
            '+${shipperEarning.toStringAsFixed(0).replaceAllMapped(RegExp(r"(\d)(?=(\d{3})+(?!\d))"), (m) => "${m[1]}.")}đ',
            style: const TextStyle(fontWeight: AppFontWeight.extraBold, color: AppColors.success, fontSize: AppFontSize.md),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.1), borderRadius: const BorderRadius.all(AppRadius.full)),
            child: Text(status == 'completed' ? 'Hoàn thành' : 'Đang giao', style: TextStyle(fontSize: AppFontSize.xs, color: statusColor, fontWeight: AppFontWeight.bold)),
          ),
        ]),
      ]),
    );
  }

  String _formatDate(String iso) {
    try {
      final dt = DateTime.parse(iso).toLocal();
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return '';
    }
  }
}
