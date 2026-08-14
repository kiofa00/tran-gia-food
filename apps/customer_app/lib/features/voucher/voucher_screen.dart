import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

enum VoucherFilter { all, platform, restaurant, freeShip }

class _VoucherFilterNotifier extends Notifier<VoucherFilter> {
  @override
  VoucherFilter build() => VoucherFilter.all;
  void set(VoucherFilter f) => state = f;
}

final voucherFilterProvider =
    NotifierProvider<_VoucherFilterNotifier, VoucherFilter>(
  _VoucherFilterNotifier.new,
);

final availableVouchersProvider =
    FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  final result = await api.get('/vouchers/available');
  final list = result['data'] as List? ?? [];
  return list.cast<Map<String, dynamic>>();
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class VoucherScreen extends ConsumerStatefulWidget {
  /// Náº¿u Ä‘Æ°á»£c má»Ÿ tá»« giá» hÃ ng, set [fromCart] = true
  /// â†’ hiá»ƒn thá»‹ nÃºt "Ãp dá»¥ng" thay vÃ¬ chá»‰ xem
  final bool fromCart;

  const VoucherScreen({super.key, this.fromCart = false});

  @override
  ConsumerState<VoucherScreen> createState() => _VoucherScreenState();
}

class _VoucherScreenState extends ConsumerState<VoucherScreen> {
  final _searchController = TextEditingController();
  final _manualCodeController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    _manualCodeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final filter = ref.watch(voucherFilterProvider);
    final vouchersAsync = ref.watch(availableVouchersProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.fromCart ? 'Chá»n Voucher' : 'VÃ­ Voucher',
          style: const TextStyle(fontWeight: AppFontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => context.pop(),
        ),
      ),
      body: Column(
        children: [
          // â”€â”€â”€ Manual code input â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: Row(
              children: [
                Expanded(
                  child: AppTextField(
                    controller: _manualCodeController,
                    hintText: 'Nháº­p mÃ£ voucher thá»§ cÃ´ng...',
                    prefixIcon: Iconsax.ticket_discount,
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton(
                  onPressed: _applyManualCode,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 14,
                    ),
                    shape: const RoundedRectangleBorder(
                      borderRadius: BorderRadius.all(AppRadius.sm),
                    ),
                  ),
                  child: const Text(
                    'Ãp Dá»¥ng',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: AppFontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // â”€â”€â”€ Search bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: AppTextField(
              controller: _searchController,
              hintText: 'TÃ¬m voucher theo tÃªn, mÃ£...',
              prefixIcon: Iconsax.search_normal_1,
              onChanged: (v) => setState(() => _searchQuery = v.toLowerCase()),
            ),
          ),

          // â”€â”€â”€ Filter chips â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: VoucherFilter.values
                  .map((f) => _FilterChip(f, filter))
                  .toList(),
            ),
          ),
          const SizedBox(height: 8),

          // â”€â”€â”€ Voucher list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          Expanded(
            child: vouchersAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (_, _) => _buildFallbackList(filter),
              data: (list) {
                final filtered = _applyFilter(list, filter);
                if (filtered.isEmpty) {
                  return _EmptyState(filter: filter);
                }
                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: filtered.length,
                  itemBuilder: (ctx, i) => _VoucherCard(
                    voucher: filtered[i],
                    fromCart: widget.fromCart,
                    onSelect: (code) => context.pop(code),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  List<Map<String, dynamic>> _applyFilter(
    List<Map<String, dynamic>> list,
    VoucherFilter filter,
  ) {
    return list.where((v) {
      final matchSearch = _searchQuery.isEmpty ||
          (v['code'] as String? ?? '').toLowerCase().contains(_searchQuery) ||
          (v['title'] as String? ?? '').toLowerCase().contains(_searchQuery);
      final matchFilter = switch (filter) {
        VoucherFilter.all => true,
        VoucherFilter.platform => v['type'] == 'platform',
        VoucherFilter.restaurant => v['type'] == 'restaurant',
        VoucherFilter.freeShip => v['discount_type'] == 'free_ship',
      };
      return matchSearch && matchFilter;
    }).toList();
  }

  // Fallback mock list khi API chÆ°a cÃ³
  Widget _buildFallbackList(VoucherFilter filter) {
    final mockVouchers = [
      {
        'code': 'SUMMER20',
        'title': 'Giáº£m 20.000Ä‘ cho Ä‘Æ¡n tá»« 100k',
        'discount_type': 'fixed',
        'discount_value': 20000,
        'min_order': 100000,
        'type': 'platform',
        'valid_to': '2026-12-31',
        'used_count': 312,
        'total_limit': 1000,
      },
      {
        'code': 'FREESHIP',
        'title': 'Miá»…n phÃ­ váº­n chuyá»ƒn (Ä‘Æ¡n tá»« 50k)',
        'discount_type': 'free_ship',
        'discount_value': 0,
        'min_order': 50000,
        'type': 'platform',
        'valid_to': '2026-09-30',
        'used_count': 88,
        'total_limit': 500,
      },
      {
        'code': 'PHO15',
        'title': 'Giáº£m 15% tá»‘i Ä‘a 30k â€” Phá»Ÿ Báº¯c HÃ ',
        'discount_type': 'percent',
        'discount_value': 15,
        'min_order': 80000,
        'type': 'restaurant',
        'valid_to': '2026-10-01',
        'used_count': 45,
        'total_limit': 200,
      },
      {
        'code': 'NEWUSER',
        'title': 'ChÃ o má»«ng khÃ¡ch má»›i â€” Giáº£m 30.000Ä‘',
        'discount_type': 'fixed',
        'discount_value': 30000,
        'min_order': 0,
        'type': 'platform',
        'valid_to': '2026-08-31',
        'used_count': 999,
        'total_limit': 1000,
      },
    ];
    final filtered = _applyFilter(mockVouchers, filter);
    if (filtered.isEmpty) return _EmptyState(filter: filter);
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: filtered.length,
      itemBuilder: (ctx, i) => _VoucherCard(
        voucher: filtered[i],
        fromCart: widget.fromCart,
        onSelect: (code) => context.pop(code),
      ),
    );
  }

  void _applyManualCode() {
    final code = _manualCodeController.text.trim().toUpperCase();
    if (code.isEmpty) return;
    if (widget.fromCart) {
      context.pop(code);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('ÄÃ£ lÆ°u mÃ£: $code')),
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Filter Chip
// ---------------------------------------------------------------------------

class _FilterChip extends ConsumerWidget {
  final VoucherFilter filter;
  final VoucherFilter current;

  const _FilterChip(this.filter, this.current);

  static const _labels = {
    VoucherFilter.all: 'Táº¥t cáº£',
    VoucherFilter.platform: 'Ná»n táº£ng',
    VoucherFilter.restaurant: 'Tá»« quÃ¡n',
    VoucherFilter.freeShip: 'Miá»…n ship',
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isSelected = filter == current;
    return GestureDetector(
      onTap: () =>
          ref.read(voucherFilterProvider.notifier).set(filter),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.surfaceAltLight,
          borderRadius: const BorderRadius.all(AppRadius.full),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.dividerLight,
          ),
        ),
        child: Text(
          _labels[filter]!,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.textPrimaryLight,
            fontWeight:
                isSelected ? AppFontWeight.bold : AppFontWeight.medium,
            fontSize: AppFontSize.sm,
          ),
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
  final bool fromCart;
  final void Function(String code) onSelect;

  const _VoucherCard({
    required this.voucher,
    required this.fromCart,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final code = voucher['code'] as String? ?? '';
    final title = voucher['title'] as String? ?? '';
    final discountType = voucher['discount_type'] as String? ?? 'fixed';
    final discountValue = (voucher['discount_value'] as num?)?.toInt() ?? 0;
    final minOrder = (voucher['min_order'] as num?)?.toInt() ?? 0;
    final type = voucher['type'] as String? ?? 'platform';
    final validTo = voucher['valid_to'] as String? ?? '';
    final usedCount = (voucher['used_count'] as num?)?.toInt() ?? 0;
    final totalLimit = (voucher['total_limit'] as num?)?.toInt() ?? 0;
    final remaining = totalLimit - usedCount;
    final isNearlyGone = remaining < totalLimit * 0.1;

    String discountText = switch (discountType) {
      'percent' => 'Giáº£m $discountValue%',
      'free_ship' => 'Miá»…n phÃ­ ship',
      _ => 'Giáº£m ${_formatMoney(discountValue)}',
    };

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.all(AppRadius.md),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Left strip
          Container(
            width: 8,
            height: 110,
            decoration: BoxDecoration(
              color: type == 'platform' ? AppColors.primary : AppColors.warning,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                bottomLeft: Radius.circular(16),
              ),
            ),
          ),

          // Content
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: (type == 'platform'
                                  ? AppColors.primary
                                  : AppColors.warning)
                              .withValues(alpha: 0.12),
                          borderRadius:
                              const BorderRadius.all(AppRadius.full),
                        ),
                        child: Text(
                          type == 'platform' ? 'Ná»n táº£ng' : 'QuÃ¡n táº·ng',
                          style: TextStyle(
                            fontSize: AppFontSize.xs,
                            fontWeight: AppFontWeight.bold,
                            color: type == 'platform'
                                ? AppColors.primary
                                : AppColors.warning,
                          ),
                        ),
                      ),
                      if (isNearlyGone) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.error.withValues(alpha: 0.1),
                            borderRadius: const BorderRadius.all(AppRadius.full),
                          ),
                          child: Text(
                            'Sáº¯p háº¿t!',
                            style: TextStyle(
                              fontSize: AppFontSize.xs,
                              fontWeight: AppFontWeight.bold,
                              color: AppColors.error,
                            ),
                          ),
                        ),
                      ],
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
                  const SizedBox(height: 2),
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: AppFontSize.sm,
                      color: AppColors.textSecondaryLight,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(
                        Iconsax.calendar_1,
                        size: 12,
                        color: AppColors.textSecondaryLight,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'HSD: $validTo',
                        style: const TextStyle(
                          fontSize: AppFontSize.xs,
                          color: AppColors.textSecondaryLight,
                        ),
                      ),
                      if (minOrder > 0) ...[
                        const SizedBox(width: 12),
                        Icon(
                          Iconsax.receipt_item,
                          size: 12,
                          color: AppColors.textSecondaryLight,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Tá»« ${_formatMoney(minOrder)}',
                          style: const TextStyle(
                            fontSize: AppFontSize.xs,
                            color: AppColors.textSecondaryLight,
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Dashed divider
          SizedBox(
            height: 110,
            child: VerticalDivider(
              width: 1,
              color: AppColors.dividerLight,
            ),
          ),

          // Code + button
          SizedBox(
            width: 90,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    code,
                    style: const TextStyle(
                      fontSize: AppFontSize.sm,
                      fontWeight: AppFontWeight.bold,
                      letterSpacing: 1.2,
                      color: AppColors.textPrimaryLight,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  GestureDetector(
                    onTap: () => fromCart ? onSelect(code) : _copyCode(context, code),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.all(AppRadius.sm),
                      ),
                      child: Text(
                        fromCart ? 'DÃ¹ng' : 'Sao chÃ©p',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: AppFontSize.xs,
                          fontWeight: AppFontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _copyCode(BuildContext context, String code) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('ÄÃ£ sao chÃ©p mÃ£: $code ðŸ“‹'),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  String _formatMoney(int value) {
    return '${value.toString().replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
        )}Ä‘';
  }
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

class _EmptyState extends StatelessWidget {
  final VoucherFilter filter;
  const _EmptyState({required this.filter});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Iconsax.ticket_discount, size: 64, color: AppColors.dividerLight),
          const SizedBox(height: 16),
          Text(
            'KhÃ´ng cÃ³ voucher nÃ o',
            style: TextStyle(
              fontSize: AppFontSize.title,
              fontWeight: AppFontWeight.bold,
              color: AppColors.textSecondaryLight,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Thá»­ Ä‘á»•i bá»™ lá»c hoáº·c nháº­p mÃ£ thá»§ cÃ´ng bÃªn trÃªn',
            style: TextStyle(
              fontSize: AppFontSize.base,
              color: AppColors.textSecondaryLight,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

