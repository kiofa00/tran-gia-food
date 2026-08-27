import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

import '../../../core/providers/api_client_provider.dart';
import 'wallet_providers.dart';
import 'widgets/transaction_item_tile.dart';
import 'widgets/wallet_balance_card.dart';
import 'widgets/wallet_deposit_modal.dart';
import 'widgets/wallet_quick_actions.dart';

class CustomerWalletScreen extends ConsumerStatefulWidget {
  const CustomerWalletScreen({super.key});

  @override
  ConsumerState<CustomerWalletScreen> createState() =>
      _CustomerWalletScreenState();
}

class _CustomerWalletScreenState extends ConsumerState<CustomerWalletScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _handleDeposit(int amount, String method) async {
    final api = ref.read(apiClientProvider);
    try {
      final res = await api.post('/users/me/wallet/deposit', {
        'amount': amount,
        'method': method,
      });
      final message = res['message'] as String? ?? 'Nạp tiền thành công!';

      ref.invalidate(walletProvider);
      ref.invalidate(transactionHistoryProvider);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('🎉 $message'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Nạp tiền thất bại: $e'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  void _showHelp(BuildContext context) {
    AppModalBottomSheet.show(
      context: context,
      builder: (ctx) => AppModalBottomSheet(
        title: 'Hướng Dẫn Ví TranGia',
        icon: Iconsax.info_circle,
        child: ListView(
          children: const [
            Text(
              '1. Nạp tiền vào ví',
              style: TextStyle(fontWeight: AppFontWeight.bold),
            ),
            SizedBox(height: 4),
            Text(
              'Bạn có thể nạp tiền qua Ví MoMo, VNPay hoặc Chuyển khoản ngân hàng 24/7.',
              style: TextStyle(
                fontSize: AppFontSize.sm,
                color: AppColors.textSecondaryLight,
              ),
            ),
            SizedBox(height: 16),
            Text(
              '2. Thanh toán đơn hàng',
              style: TextStyle(fontWeight: AppFontWeight.bold),
            ),
            SizedBox(height: 4),
            Text(
              'Số dư ví được sử dụng để thanh toán tức thì các đơn hàng mà không cần chuẩn bị tiền mặt.',
              style: TextStyle(
                fontSize: AppFontSize.sm,
                color: AppColors.textSecondaryLight,
              ),
            ),
            SizedBox(height: 16),
            Text(
              '3. Rút tiền về tài khoản',
              style: TextStyle(fontWeight: AppFontWeight.bold),
            ),
            SizedBox(height: 4),
            Text(
              'Rút tiền về tài khoản ngân hàng đã liên kết và xác minh eKYC trong vòng 5 - 15 phút.',
              style: TextStyle(
                fontSize: AppFontSize.sm,
                color: AppColors.textSecondaryLight,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final walletAsync = ref.watch(walletProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Ví & Thanh Toán',
          style: TextStyle(fontWeight: AppFontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Iconsax.info_circle),
            tooltip: 'Trợ giúp',
            onPressed: () => _showHelp(context),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(walletProvider);
          ref.invalidate(transactionHistoryProvider);
        },
        child: ListView(
          children: [
            // Balance Card
            walletAsync.when(
              loading: () => Container(
                margin: const EdgeInsets.all(16),
                height: 140,
                decoration: const BoxDecoration(
                  color: AppColors.surfaceAltLight,
                  borderRadius: BorderRadius.all(AppRadius.lg),
                ),
                child: const Center(child: CircularProgressIndicator()),
              ),
              error: (_, _) => const SizedBox.shrink(),
              data: (wallet) => WalletBalanceCard(wallet: wallet),
            ),

            // Quick Actions
            WalletQuickActions(
              onDeposit: () => WalletDepositModal.show(
                context: context,
                onConfirm: _handleDeposit,
              ),
              onWithdraw: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Chức năng rút tiền đang được xử lý'),
                    backgroundColor: AppColors.info,
                  ),
                );
              },
              onLinkBank: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Chức năng liên kết ngân hàng đang cập nhật'),
                    backgroundColor: AppColors.info,
                  ),
                );
              },
              onEkyc: () => context.push('/wallet/ekyc'),
            ),
            const SizedBox(height: 12),

            // Section Header
            AppSectionHeader(
              title: 'Lịch Sử Giao Dịch',
              icon: Iconsax.receipt_2,
              subtitle: '20 giao dịch gần nhất',
            ),

            // Transactions List
            _buildTransactionsSection(),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildTransactionsSection() {
    final txAsync = ref.watch(transactionHistoryProvider);

    return txAsync.when(
      loading: () => const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: CircularProgressIndicator(),
        ),
      ),
      error: (_, _) => const AppEmptyState(
        icon: Iconsax.receipt_2,
        title: 'Chưa có giao dịch nào',
        description:
            'Lịch sử nạp tiền, rút tiền và thanh toán của bạn sẽ hiển thị tại đây.',
      ),
      data: (list) {
        if (list.isEmpty) {
          return const AppEmptyState(
            icon: Iconsax.receipt_2,
            title: 'Chưa có giao dịch nào',
            description:
                'Lịch sử nạp tiền, rút tiền và thanh toán của bạn sẽ hiển thị tại đây.',
          );
        }

        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: Theme.of(context).brightness == Brightness.dark
                ? AppColors.surfaceAltDark
                : AppColors.surfaceLight,
            borderRadius: const BorderRadius.all(AppRadius.md),
            boxShadow: AppShadows.sm,
          ),
          child: ClipRRect(
            borderRadius: const BorderRadius.all(AppRadius.md),
            child: ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: list.length,
              separatorBuilder: (_, _) => const Divider(
                height: 1,
                indent: 72,
                color: AppColors.dividerLight,
              ),
              itemBuilder: (_, i) => TransactionItemTile(tx: list[i]),
            ),
          ),
        );
      },
    );
  }
}
