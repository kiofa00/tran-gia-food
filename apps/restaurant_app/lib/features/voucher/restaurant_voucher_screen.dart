import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final restaurantVouchersProvider =
    FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  final result = await api.get('/restaurants/my/vouchers');
  final list = result['data'] as List? ?? [];
  return list.cast<Map<String, dynamic>>();
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class RestaurantVoucherScreen extends ConsumerWidget {
  const RestaurantVoucherScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final vouchersAsync = ref.watch(restaurantVouchersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Voucher Của Quán',
          style: TextStyle(fontWeight: AppFontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => context.pop(),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreateSheet(context, ref),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text(
          'Tạo Voucher',
          style: TextStyle(color: Colors.white, fontWeight: AppFontWeight.bold),
        ),
      ),
      body: vouchersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => _buildMockList(context, ref),
        data: (list) =>
            list.isEmpty ? _buildMockList(context, ref) : _buildList(context, ref, list),
      ),
    );
  }

  Widget _buildMockList(BuildContext context, WidgetRef ref) {
    final mock = [
      {
        'code': 'PHO10',
        'title': 'Giảm 10% khi đặt phở',
        'discount_type': 'percent',
        'discount_value': 10,
        'min_order': 60000,
        'valid_to': '2026-09-30',
        'total_limit': 100,
        'used_count': 34,
        'is_active': true,
      },
      {
        'code': 'WEEKEND',
        'title': 'Cuối tuần giảm 20k',
        'discount_type': 'fixed',
        'discount_value': 20000,
        'min_order': 80000,
        'valid_to': '2026-12-31',
        'total_limit': 200,
        'used_count': 12,
        'is_active': false,
      },
    ];
    return _buildList(context, ref, mock);
  }

  Widget _buildList(
    BuildContext context,
    WidgetRef ref,
    List<Map<String, dynamic>> list,
  ) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      children: [
        // Summary cards
        Row(
          children: [
            _StatCard(
              label: 'Đang active',
              value: list.where((v) => v['is_active'] == true).length.toString(),
              icon: Iconsax.tick_circle5,
              color: AppColors.success,
            ),
            const SizedBox(width: 12),
            _StatCard(
              label: 'Tổng voucher',
              value: list.length.toString(),
              icon: Iconsax.ticket_discount,
              color: AppColors.primary,
            ),
            const SizedBox(width: 12),
            _StatCard(
              label: 'Lượt dùng',
              value: list
                  .fold<int>(
                    0,
                    (sum, v) => sum + ((v['used_count'] as num?)?.toInt() ?? 0),
                  )
                  .toString(),
              icon: Iconsax.people,
              color: AppColors.warning,
            ),
          ],
        ),
        const SizedBox(height: 20),
        ...list.map((v) => _VoucherCard(voucher: v, onRefresh: () => ref.invalidate(restaurantVouchersProvider))),
      ],
    );
  }

  void _showCreateSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _CreateVoucherSheet(
        onCreated: () => ref.invalidate(restaurantVouchersProvider),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: const BorderRadius.all(AppRadius.md),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 6),
            Text(
              value,
              style: TextStyle(
                fontSize: AppFontSize.xl,
                fontWeight: AppFontWeight.bold,
                color: color,
              ),
            ),
            Text(
              label,
              style: const TextStyle(
                fontSize: AppFontSize.xs,
                color: AppColors.textSecondaryLight,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Voucher Card
// ---------------------------------------------------------------------------

class _VoucherCard extends StatelessWidget {
  final Map<String, dynamic> voucher;
  final VoidCallback onRefresh;

  const _VoucherCard({required this.voucher, required this.onRefresh});

  @override
  Widget build(BuildContext context) {
    final code = voucher['code'] as String? ?? '';
    final title = voucher['title'] as String? ?? '';
    final discountType = voucher['discount_type'] as String? ?? 'fixed';
    final discountValue = (voucher['discount_value'] as num?)?.toInt() ?? 0;
    final minOrder = (voucher['min_order'] as num?)?.toInt() ?? 0;
    final validTo = voucher['valid_to'] as String? ?? '';
    final usedCount = (voucher['used_count'] as num?)?.toInt() ?? 0;
    final totalLimit = (voucher['total_limit'] as num?)?.toInt() ?? 0;
    final isActive = voucher['is_active'] as bool? ?? false;

    final progress = totalLimit > 0 ? usedCount / totalLimit : 0.0;

    String discountText = switch (discountType) {
      'percent' => 'Giảm $discountValue%',
      'free_ship' => 'Miễn ship',
      _ => 'Giảm ${_fmt(discountValue)}',
    };

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.all(AppRadius.md),
        border: Border.all(
          color: isActive ? AppColors.primary.withValues(alpha: 0.3) : AppColors.dividerLight,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: isActive
                                  ? AppColors.success.withValues(alpha: 0.1)
                                  : AppColors.dividerLight,
                              borderRadius: const BorderRadius.all(AppRadius.full),
                            ),
                            child: Text(
                              isActive ? '● Active' : '● Tạm dừng',
                              style: TextStyle(
                                fontSize: AppFontSize.xs,
                                fontWeight: AppFontWeight.bold,
                                color: isActive ? AppColors.success : AppColors.textSecondaryLight,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            code,
                            style: const TextStyle(
                              fontWeight: AppFontWeight.bold,
                              fontSize: AppFontSize.base,
                              letterSpacing: 1.2,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        discountText,
                        style: const TextStyle(
                          fontSize: AppFontSize.title,
                          fontWeight: AppFontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: AppFontSize.sm,
                          color: AppColors.textSecondaryLight,
                        ),
                      ),
                    ],
                  ),
                ),
                PopupMenuButton<String>(
                  onSelected: (action) => _handleAction(context, action),
                  itemBuilder: (_) => [
                    PopupMenuItem(
                      value: 'toggle',
                      child: Row(
                        children: [
                          Icon(
                            isActive ? Iconsax.pause : Iconsax.play,
                            size: 18,
                          ),
                          const SizedBox(width: 8),
                          Text(isActive ? 'Tạm dừng' : 'Kích hoạt'),
                        ],
                      ),
                    ),
                    const PopupMenuItem(
                      value: 'delete',
                      child: Row(
                        children: [
                          Icon(Iconsax.trash, size: 18, color: AppColors.error),
                          SizedBox(width: 8),
                          Text('Xóa', style: TextStyle(color: AppColors.error)),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Progress bar
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '$usedCount / $totalLimit lượt dùng',
                      style: const TextStyle(
                        fontSize: AppFontSize.sm,
                        color: AppColors.textSecondaryLight,
                      ),
                    ),
                    Row(
                      children: [
                        const Icon(Iconsax.calendar_1, size: 12, color: AppColors.textSecondaryLight),
                        const SizedBox(width: 4),
                        Text(
                          'HSD: $validTo',
                          style: const TextStyle(
                            fontSize: AppFontSize.sm,
                            color: AppColors.textSecondaryLight,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: const BorderRadius.all(AppRadius.full),
                  child: LinearProgressIndicator(
                    value: progress.clamp(0.0, 1.0),
                    backgroundColor: AppColors.surfaceAltLight,
                    color: progress > 0.8
                        ? AppColors.error
                        : AppColors.primary,
                    minHeight: 6,
                  ),
                ),
                if (minOrder > 0) ...[
                  const SizedBox(height: 4),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Đơn tối thiểu: ${_fmt(minOrder)}',
                      style: const TextStyle(
                        fontSize: AppFontSize.xs,
                        color: AppColors.textSecondaryLight,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _handleAction(BuildContext context, String action) {
    if (action == 'delete') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đã xóa voucher')),
      );
    } else if (action == 'toggle') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cập nhật trạng thái voucher')),
      );
    }
    onRefresh();
  }

  String _fmt(int v) =>
      '${v.toString().replaceAllMapped(
        RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
        (m) => '${m[1]}.',
      )}đ';
}

// ---------------------------------------------------------------------------
// Create Voucher Sheet
// ---------------------------------------------------------------------------

class _CreateVoucherSheet extends StatefulWidget {
  final VoidCallback onCreated;
  const _CreateVoucherSheet({required this.onCreated});

  @override
  State<_CreateVoucherSheet> createState() => _CreateVoucherSheetState();
}

class _CreateVoucherSheetState extends State<_CreateVoucherSheet> {
  final _codeController = TextEditingController();
  final _titleController = TextEditingController();
  final _valueController = TextEditingController();
  final _minOrderController = TextEditingController();
  final _limitController = TextEditingController();
  String _discountType = 'fixed';
  bool _isCreating = false;

  @override
  void dispose() {
    _codeController.dispose();
    _titleController.dispose();
    _valueController.dispose();
    _minOrderController.dispose();
    _limitController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 24,
        bottom: MediaQuery.viewInsetsOf(context).bottom + 24,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Tạo Voucher Mới',
              style: TextStyle(fontSize: AppFontSize.xl, fontWeight: AppFontWeight.bold),
            ),
            const SizedBox(height: 16),
            AppTextField(
              controller: _codeController,
              labelText: 'Mã voucher',
              hintText: 'VD: PHO15 (chỉ chữ hoa + số)',
              prefixIcon: Iconsax.ticket_discount,
            ),
            const SizedBox(height: 12),
            AppTextField(
              controller: _titleController,
              labelText: 'Mô tả ngắn',
              hintText: 'VD: Giảm 15% khi đặt phở',
              prefixIcon: Iconsax.edit_2,
            ),
            const SizedBox(height: 12),
            // Discount type
            Row(
              children: [
                Expanded(child: _TypeBtn('fixed', 'Tiền cố định', _discountType, (v) => setState(() => _discountType = v))),
                const SizedBox(width: 8),
                Expanded(child: _TypeBtn('percent', 'Phần trăm %', _discountType, (v) => setState(() => _discountType = v))),
                const SizedBox(width: 8),
                Expanded(child: _TypeBtn('free_ship', 'Miễn ship', _discountType, (v) => setState(() => _discountType = v))),
              ],
            ),
            const SizedBox(height: 12),
            if (_discountType != 'free_ship')
              AppTextField(
                controller: _valueController,
                labelText: _discountType == 'percent' ? 'Phần trăm (%)' : 'Số tiền giảm (đ)',
                hintText: _discountType == 'percent' ? 'VD: 15' : 'VD: 20000',
                prefixIcon: Iconsax.percentage_square,
                keyboardType: TextInputType.number,
              ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: AppTextField(
                    controller: _minOrderController,
                    labelText: 'Đơn tối thiểu (đ)',
                    hintText: '50000',
                    prefixIcon: Iconsax.receipt_item,
                    keyboardType: TextInputType.number,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: AppTextField(
                    controller: _limitController,
                    labelText: 'Giới hạn lượt',
                    hintText: '100',
                    prefixIcon: Iconsax.people,
                    keyboardType: TextInputType.number,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            AppButton(
              text: 'Tạo Voucher',
              isLoading: _isCreating,
              onPressed: _create,
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _create() async {
    setState(() => _isCreating = true);
    await Future.delayed(const Duration(seconds: 1));
    if (mounted) {
      Navigator.pop(context);
      widget.onCreated();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('✅ Voucher đã được tạo!')),
      );
    }
  }
}

class _TypeBtn extends StatelessWidget {
  final String value;
  final String label;
  final String current;
  final ValueChanged<String> onSelect;

  const _TypeBtn(this.value, this.label, this.current, this.onSelect);

  @override
  Widget build(BuildContext context) {
    final isSelected = value == current;
    return GestureDetector(
      onTap: () => onSelect(value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.surfaceAltLight,
          borderRadius: const BorderRadius.all(AppRadius.sm),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.dividerLight,
          ),
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: AppFontSize.xs,
            fontWeight: isSelected ? AppFontWeight.bold : AppFontWeight.regular,
            color: isSelected ? Colors.white : AppColors.textPrimaryLight,
          ),
        ),
      ),
    );
  }
}
