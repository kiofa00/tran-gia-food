import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

import '../../../core/providers/api_client_provider.dart';
import 'voucher_providers.dart';
import 'widgets/voucher_card.dart';

class VoucherScreen extends ConsumerStatefulWidget {
  final bool fromCart;

  const VoucherScreen({super.key, this.fromCart = false});

  @override
  ConsumerState<VoucherScreen> createState() => _VoucherScreenState();
}

class _VoucherScreenState extends ConsumerState<VoucherScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  VoucherFilter _filter = VoucherFilter.all;

  static const _filterLabels = {
    VoucherFilter.all: 'Tất cả',
    VoucherFilter.platform: 'Nền tảng',
    VoucherFilter.restaurant: 'Từ quán',
    VoucherFilter.freeShip: 'Miễn ship',
  };

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String val) {
    setState(() => _searchQuery = val.trim());
  }

  void _onClearSearch() {
    _searchController.clear();
    setState(() => _searchQuery = '');
  }

  Future<void> _claimVoucher(String voucherId) async {
    final api = ref.read(apiClientProvider);
    if (!await api.hasToken()) {
      if (!mounted) return;
      AppDialogs.showLoginPrompt(
        context,
        actionText: 'lưu voucher vào ví',
        onLogin: () => context.push('/auth'),
      );
      return;
    }

    try {
      final result = await api.post('/vouchers/$voucherId/claim', {});
      final message = result['message'] as String? ?? 'Đã lưu voucher vào ví!';

      ref.invalidate(myWalletVouchersProvider);
      ref.invalidate(
        vouchersProvider(
          VoucherQueryArgs(search: _searchQuery, filter: _filter),
        ),
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(message),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Không thể lưu voucher: $e'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.fromCart ? 'Chọn Mã Giảm Giá' : 'Kho & Ví Ưu Đãi',
          style: const TextStyle(fontWeight: AppFontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => context.pop(),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            height: 38,
            decoration: BoxDecoration(
              color:
                  isDark ? AppColors.surfaceAltDark : AppColors.surfaceAltLight,
              borderRadius: const BorderRadius.all(AppRadius.full),
            ),
            child: TabBar(
              controller: _tabController,
              indicator: const BoxDecoration(
                borderRadius: BorderRadius.all(AppRadius.full),
                color: AppColors.primary,
              ),
              labelColor: Colors.white,
              unselectedLabelColor: AppColors.textSecondaryLight,
              labelStyle: const TextStyle(
                fontWeight: AppFontWeight.bold,
                fontSize: AppFontSize.sm,
              ),
              unselectedLabelStyle: const TextStyle(
                fontWeight: AppFontWeight.medium,
                fontSize: AppFontSize.sm,
              ),
              indicatorSize: TabBarIndicatorSize.tab,
              dividerColor: Colors.transparent,
              tabs: const [
                Tab(text: '🎁 Kho Voucher'),
                Tab(text: '👛 Ví Của Tôi'),
              ],
            ),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildExploreTab(),
          _buildMyWalletTab(),
        ],
      ),
    );
  }

  Widget _buildExploreTab() {
    final vouchersAsync = ref.watch(
      vouchersProvider(VoucherQueryArgs(search: _searchQuery, filter: _filter)),
    );

    return Column(
      children: [
        // Search & Filter
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: AppSearchBar(
            controller: _searchController,
            hintText: 'Nhập mã voucher hoặc tìm ưu đãi...',
            onChanged: _onSearchChanged,
            onClear: _onClearSearch,
          ),
        ),

        // Filter chips
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: Row(
            children: VoucherFilter.values.map((f) {
              return AppFilterChip(
                label: _filterLabels[f]!,
                isSelected: _filter == f,
                onTap: () => setState(() => _filter = f),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 6),

        // List
        Expanded(
          child: vouchersAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (_, _) => _buildEmptyState(false),
            data: (list) {
              if (list.isEmpty) return _buildEmptyState(false);
              return RefreshIndicator(
                color: AppColors.primary,
                onRefresh: () async {
                  ref.invalidate(
                    vouchersProvider(
                      VoucherQueryArgs(search: _searchQuery, filter: _filter),
                    ),
                  );
                },
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: list.length,
                  itemBuilder: (ctx, i) => VoucherCard(
                    voucher: list[i],
                    fromCart: widget.fromCart,
                    onSelect: (code) => context.pop(code),
                    onClaim: () => _claimVoucher(list[i]['id'] as String),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildMyWalletTab() {
    final walletAsync = ref.watch(myWalletVouchersProvider);

    return walletAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, _) => _buildEmptyState(true),
      data: (list) {
        if (list.isEmpty) return _buildEmptyState(true);
        return RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async => ref.invalidate(myWalletVouchersProvider),
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: list.length,
            itemBuilder: (ctx, i) => VoucherCard(
              voucher: list[i],
              fromCart: widget.fromCart,
              isWalletItem: true,
              onSelect: (code) => context.pop(code),
              onClaim: () {},
            ),
          ),
        );
      },
    );
  }

  Widget _buildEmptyState(bool isWalletTab) {
    if (isWalletTab) {
      return AppEmptyState(
        icon: Iconsax.wallet_2,
        title: 'Ví voucher của bạn đang trống',
        description:
            'Hãy khám phá Kho Voucher và lưu các mã ưu đãi hấp dẫn để sử dụng khi đặt món nhé!',
        actionText: 'Khám Phá Kho Voucher',
        actionIcon: Iconsax.discover,
        onAction: () => _tabController.animateTo(0),
      );
    }

    final title = _searchQuery.isNotEmpty
        ? 'Không tìm thấy voucher phù hợp'
        : 'Chưa có voucher nào';

    final desc = _searchQuery.isNotEmpty
        ? 'Không có voucher nào khớp với từ khóa "$_searchQuery". Vui lòng thử tìm kiếm với từ khóa khác.'
        : switch (_filter) {
            VoucherFilter.platform => 'Hiện chưa có voucher từ nền tảng',
            VoucherFilter.restaurant => 'Hiện chưa có voucher từ các quán ăn',
            VoucherFilter.freeShip => 'Hiện chưa có voucher miễn phí vận chuyển',
            VoucherFilter.all => 'Các chương trình khuyến mãi sẽ sớm quay trở lại!',
          };

    return AppEmptyState(
      icon: Iconsax.ticket_discount,
      iconColor: AppColors.textSecondaryLight,
      title: title,
      description: desc,
      actionText: _searchQuery.isNotEmpty ? 'Xem tất cả voucher' : null,
      actionIcon: Icons.refresh_rounded,
      onAction: _onClearSearch,
    );
  }
}
