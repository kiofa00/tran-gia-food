import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import 'package:shared_models/enums/index.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

final orderHistoryProvider = FutureProvider.autoDispose
    .family<Map<String, dynamic>, int>((ref, page) async {
  final api = ref.read(apiClientProvider);
  return api.get('/users/me/orders', query: {'page': '$page', 'limit': '20'});
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class OrderHistoryScreen extends ConsumerStatefulWidget {
  const OrderHistoryScreen({super.key});

  @override
  ConsumerState<OrderHistoryScreen> createState() => _OrderHistoryScreenState();
}

class _OrderHistoryScreenState extends ConsumerState<OrderHistoryScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  static const _tabs = [
    ('Đang Xử Lý', [
      OrderStatus.pending,
      OrderStatus.confirmed,
      OrderStatus.pickingUp,
      OrderStatus.delivering,
      OrderStatus.delivered,
    ]),
    ('Hoàn Thành', [OrderStatus.completed]),
    ('Đã Hủy', [OrderStatus.cancelled]),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Đơn Hàng Của Tôi',
          style: TextStyle(fontWeight: AppFontWeight.bold),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondaryLight,
          indicatorColor: AppColors.primary,
          tabs: _tabs
              .map((t) => Tab(text: t.$1))
              .toList(),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: _tabs
            .map((t) => _OrderTab(statuses: t.$2))
            .toList(),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Tab content
// ---------------------------------------------------------------------------

class _OrderTab extends ConsumerWidget {
  final List<OrderStatus> statuses;

  const _OrderTab({required this.statuses});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncValue = ref.watch(orderHistoryProvider(1));

    return asyncValue.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => _ErrorView(message: e.toString()),
      data: (res) {
        final allOrders = List<Map<String, dynamic>>.from(res['data'] ?? []);
        final filtered = allOrders.where((o) {
          final raw = o['status'] as String? ?? '';
          return statuses.any((s) => s.name == _toCamel(raw));
        }).toList();

        if (filtered.isEmpty) {
          return const _EmptyOrdersView();
        }

        return RefreshIndicator(
          onRefresh: () async => ref.invalidate(orderHistoryProvider),
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            itemCount: filtered.length,
            separatorBuilder: (_, _) => const SizedBox(height: 12),
            itemBuilder: (_, i) => _OrderCard(order: filtered[i]),
          ),
        );
      },
    );
  }

  /// Convert snake_case backend status to camelCase enum name
  String _toCamel(String raw) {
    final parts = raw.split('_');
    if (parts.length <= 1) return raw.toLowerCase();
    return parts.first.toLowerCase() +
        parts.skip(1).map((p) => p[0].toUpperCase() + p.substring(1).toLowerCase()).join();
  }
}

// ---------------------------------------------------------------------------
// Order card
// ---------------------------------------------------------------------------

class _OrderCard extends StatelessWidget {
  final Map<String, dynamic> order;

  const _OrderCard({required this.order});

  @override
  Widget build(BuildContext context) {
    final restaurant = order['restaurant'] as Map<String, dynamic>? ?? {};
    final items = List<Map<String, dynamic>>.from(order['items'] ?? []);
    final status = order['status'] as String? ?? '';
    final total = (order['subtotal'] as num? ?? 0) +
        (order['shipFee'] as num? ?? 0) -
        (order['discountAmount'] as num? ?? 0);
    final orderId = order['id'] as String? ?? '';
    final isActive = ['pending', 'confirmed', 'picking_up', 'delivering', 'delivered']
        .contains(status);

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surfaceLight,
        borderRadius: BorderRadius.all(AppRadius.md),
        boxShadow: AppShadows.sm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.all(AppRadius.sm),
                  child: Container(
                    width: 44,
                    height: 44,
                    color: AppColors.surfaceAltLight,
                    child: restaurant['avatarUrl'] != null
                        ? Image.network(restaurant['avatarUrl'] as String, fit: BoxFit.cover)
                        : const Icon(Iconsax.shop, color: AppColors.primary),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        restaurant['name'] as String? ?? 'Nhà hàng',
                        style: const TextStyle(
                          fontWeight: AppFontWeight.bold,
                          fontSize: AppFontSize.md,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${items.length} món · ${_formatCurrency(total)}',
                        style: const TextStyle(
                          fontSize: AppFontSize.sm,
                          color: AppColors.textSecondaryLight,
                        ),
                      ),
                    ],
                  ),
                ),
                _StatusBadge(status: status),
              ],
            ),
          ),

          // Items preview
          if (items.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              child: Text(
                items
                    .take(3)
                    .map((i) {
                      final item = i['menuItem'] as Map<String, dynamic>? ?? {};
                      return '${i['quantity']}x ${item['name'] ?? ''}';
                    })
                    .join(', '),
                style: const TextStyle(
                  fontSize: AppFontSize.sm,
                  color: AppColors.textSecondaryLight,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),

          const SizedBox(height: 12),
          const Divider(height: 1),

          // Actions
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (isActive)
                  OutlinedButton.icon(
                    icon: const Icon(Iconsax.location5, size: 16),
                    label: const Text('Theo Dõi'),
                    onPressed: () => context.push('/tracking/$orderId'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: const BorderSide(color: AppColors.primary),
                    ),
                  ),
                if (!isActive) ...[
                  OutlinedButton.icon(
                    icon: const Icon(Iconsax.refresh, size: 16),
                    label: const Text('Đặt Lại'),
                    onPressed: () => context.push('/restaurant/${restaurant['id']}'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: const BorderSide(color: AppColors.primary),
                    ),
                  ),
                  if (status == 'completed') ...[
                    const SizedBox(width: 8),
                    ElevatedButton.icon(
                      icon: const Icon(Iconsax.star, size: 16),
                      label: const Text('Đánh Giá'),
                      onPressed: () => context.push('/review/$orderId'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ],
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatCurrency(num amount) {
    final formatted = amount.toStringAsFixed(0).replaceAllMapped(
          RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
        );
    return '$formattedđ';
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;

  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (status) {
      'pending' => ('Chờ xác nhận', AppColors.warning),
      'confirmed' => ('Đã xác nhận', AppColors.info),
      'picking_up' => ('Đang lấy hàng', AppColors.info),
      'delivering' => ('Đang giao', AppColors.primary),
      'delivered' => ('Đã giao', AppColors.success),
      'completed' => ('Hoàn thành', AppColors.success),
      'cancelled' => ('Đã hủy', AppColors.error),
      _ => (status, AppColors.textSecondaryLight),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: const BorderRadius.all(AppRadius.full),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: AppFontSize.xs,
          fontWeight: AppFontWeight.bold,
          color: color,
        ),
      ),
    );
  }
}

class _EmptyOrdersView extends StatelessWidget {
  const _EmptyOrdersView();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Iconsax.receipt_item, size: 64, color: AppColors.textSecondaryLight),
          const SizedBox(height: 16),
          const Text(
            'Chưa có đơn hàng nào',
            style: TextStyle(fontSize: AppFontSize.lg, fontWeight: AppFontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text(
            'Đặt đơn ngay để thưởng thức món ngon!',
            style: TextStyle(fontSize: AppFontSize.body, color: AppColors.textSecondaryLight),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            icon: const Icon(Iconsax.home_2),
            label: const Text('Khám Phá Ngay'),
            onPressed: () => context.go('/main'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;

  const _ErrorView({required this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Iconsax.warning_2, size: 48, color: AppColors.error),
            const SizedBox(height: 12),
            const Text('Không thể tải đơn hàng', style: TextStyle(fontWeight: AppFontWeight.bold)),
            const SizedBox(height: 8),
            Text(message, style: const TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
