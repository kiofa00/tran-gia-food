import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

enum RevenuePeriod { day, week, month }

class _RevenuePeriodNotifier extends Notifier<RevenuePeriod> {
  @override
  RevenuePeriod build() => RevenuePeriod.week;
  void set(RevenuePeriod p) => state = p;
}

final revenuePeriodProvider =
    NotifierProvider<_RevenuePeriodNotifier, RevenuePeriod>(
  _RevenuePeriodNotifier.new,
);

final revenueDataProvider = FutureProvider.autoDispose<Map<String, dynamic>>((
  ref,
) async {
  final api = ref.read(apiClientProvider);
  final period = ref.watch(revenuePeriodProvider);
  return api.get('/restaurants/my/revenue', query: {'period': period.name});
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class RevenueDashboardScreen extends ConsumerWidget {
  const RevenueDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final period = ref.watch(revenuePeriodProvider);
    final revenueAsync = ref.watch(revenueDataProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Doanh Thu',
          style: TextStyle(fontWeight: AppFontWeight.bold),
        ),
      ),
      body: Column(
        children: [
          // Period selector
          Container(
            margin: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surfaceAltLight,
              borderRadius: const BorderRadius.all(AppRadius.md),
            ),
            child: Row(
              children: RevenuePeriod.values.map((p) {
                final isSelected = period == p;
                final label = switch (p) {
                  RevenuePeriod.day => 'Hôm Nay',
                  RevenuePeriod.week => 'Tuần Này',
                  RevenuePeriod.month => 'Tháng Này',
                };
                return Expanded(
                  child: GestureDetector(
                    onTap: () =>
                        ref.read(revenuePeriodProvider.notifier).set(p),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      margin: const EdgeInsets.all(4),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppColors.primary
                            : Colors.transparent,
                        borderRadius: const BorderRadius.all(AppRadius.sm),
                      ),
                      child: Text(
                        label,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: isSelected
                              ? Colors.white
                              : AppColors.textSecondaryLight,
                          fontWeight: isSelected
                              ? AppFontWeight.bold
                              : AppFontWeight.medium,
                          fontSize: AppFontSize.sm,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          // Content
          Expanded(
            child: revenueAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Iconsax.warning_2,
                      size: 48,
                      color: AppColors.error,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      e.toString(),
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: AppColors.textSecondaryLight,
                      ),
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton.icon(
                      icon: const Icon(Iconsax.refresh),
                      label: const Text('Thử lại'),
                      onPressed: () => ref.invalidate(revenueDataProvider),
                    ),
                  ],
                ),
              ),
              data: (data) => _RevenueBody(data: data),
            ),
          ),
        ],
      ),
    );
  }
}

class _RevenueBody extends StatelessWidget {
  final Map<String, dynamic> data;

  const _RevenueBody({required this.data});

  @override
  Widget build(BuildContext context) {
    final totalRevenue = (data['totalRevenue'] as num? ?? 0).toDouble();
    final totalOrders = (data['totalOrders'] as num? ?? 0).toInt();
    final platformFee = (data['platformFee'] as num? ?? 0).toDouble();
    final netRevenue = totalRevenue - platformFee;
    final chartPoints = List<Map<String, dynamic>>.from(
      data['chartData'] ?? [],
    );

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Summary cards
          Row(
            children: [
              Expanded(
                child: _StatCard(
                  icon: Iconsax.money_recive,
                  label: 'Doanh Thu',
                  value: _currency(totalRevenue),
                  color: AppColors.success,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _StatCard(
                  icon: Iconsax.receipt_item,
                  label: 'Số Đơn',
                  value: '$totalOrders',
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _StatCard(
                  icon: Iconsax.minus_cirlce,
                  label: 'Phí Platform',
                  value: _currency(platformFee),
                  color: AppColors.warning,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _StatCard(
                  icon: Iconsax.wallet_money,
                  label: 'Thực Nhận',
                  value: _currency(netRevenue),
                  color: AppColors.info,
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Chart
          if (chartPoints.isNotEmpty) ...[
            const Text(
              'Biểu Đồ Doanh Thu',
              style: TextStyle(
                fontSize: AppFontSize.title,
                fontWeight: AppFontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              height: 200,
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                color: AppColors.surfaceLight,
                borderRadius: BorderRadius.all(AppRadius.md),
                boxShadow: AppShadows.sm,
              ),
              child: LineChart(
                LineChartData(
                  gridData: const FlGridData(show: false),
                  titlesData: const FlTitlesData(show: false),
                  borderData: FlBorderData(show: false),
                  lineBarsData: [
                    LineChartBarData(
                      spots: chartPoints.asMap().entries.map((e) {
                        final revenue = (e.value['revenue'] as num? ?? 0)
                            .toDouble();
                        return FlSpot(e.key.toDouble(), revenue);
                      }).toList(),
                      isCurved: true,
                      color: AppColors.primary,
                      barWidth: 3,
                      dotData: const FlDotData(show: false),
                      belowBarData: BarAreaData(
                        show: true,
                        color: AppColors.primary.withValues(alpha: 0.1),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],

          const SizedBox(height: 24),

          // Recent orders
          const Text(
            'Đơn Hàng Gần Đây',
            style: TextStyle(
              fontSize: AppFontSize.title,
              fontWeight: AppFontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          ...List<Map<String, dynamic>>.from(
            data['recentOrders'] ?? [],
          ).map((order) => _RecentOrderTile(order: order)),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  String _currency(double amount) {
    return '${amount.toStringAsFixed(0).replaceAllMapped(RegExp(r"(\d)(?=(\d{3})+(?!\d))"), (m) => "${m[1]}.")}đ';
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: const BoxDecoration(
        color: AppColors.surfaceLight,
        borderRadius: BorderRadius.all(AppRadius.md),
        boxShadow: AppShadows.sm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: AppFontSize.lg,
              fontWeight: AppFontWeight.extraBold,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              fontSize: AppFontSize.xs,
              color: AppColors.textSecondaryLight,
            ),
          ),
        ],
      ),
    );
  }
}

class _RecentOrderTile extends StatelessWidget {
  final Map<String, dynamic> order;

  const _RecentOrderTile({required this.order});

  @override
  Widget build(BuildContext context) {
    final id = (order['id'] as String? ?? '').substring(0, 8);
    final total = (order['subtotal'] as num? ?? 0);
    final status = order['status'] as String? ?? '';
    final customer =
        (order['customer'] as Map<String, dynamic>?)?['name'] ?? 'Khách hàng';

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: const BoxDecoration(
        color: AppColors.surfaceLight,
        borderRadius: BorderRadius.all(AppRadius.md),
        boxShadow: AppShadows.sm,
      ),
      child: Row(
        children: [
          const Icon(Iconsax.receipt_item, color: AppColors.primary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '#$id — $customer',
                  style: const TextStyle(fontWeight: AppFontWeight.bold),
                ),
                Text(
                  status,
                  style: const TextStyle(
                    fontSize: AppFontSize.sm,
                    color: AppColors.textSecondaryLight,
                  ),
                ),
              ],
            ),
          ),
          Text(
            '${total.toStringAsFixed(0).replaceAllMapped(RegExp(r"(\d)(?=(\d{3})+(?!\d))"), (m) => "${m[1]}.")}đ',
            style: const TextStyle(
              fontWeight: AppFontWeight.bold,
              color: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}
