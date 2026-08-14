import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final walletProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  return api.get('/shippers/me/wallet');
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class WalletScreen extends ConsumerWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final walletAsync = ref.watch(walletProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ví Tiền', style: TextStyle(fontWeight: AppFontWeight.bold)),
      ),
      body: walletAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _ErrorView(message: e.toString(), onRetry: () => ref.invalidate(walletProvider)),
        data: (wallet) => _WalletBody(wallet: wallet),
      ),
    );
  }
}

class _WalletBody extends ConsumerWidget {
  final Map<String, dynamic> wallet;
  const _WalletBody({required this.wallet});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final balance = (wallet['balance'] as num? ?? 0).toDouble();
    final pendingAmount = (wallet['pendingAmount'] as num? ?? 0).toDouble();
    final transactions = List<Map<String, dynamic>>.from(wallet['recentTransactions'] ?? []);

    return RefreshIndicator(
      onRefresh: () async => ref.invalidate(walletProvider),
      child: ListView(
        children: [
          // Balance card
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: AppGradients.orangeGradient,
              borderRadius: const BorderRadius.all(AppRadius.lg),
              boxShadow: AppShadows.md,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Số Dư Khả Dụng', style: TextStyle(color: Colors.white70, fontSize: AppFontSize.sm)),
                const SizedBox(height: 8),
                Text(
                  _currency(balance),
                  style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: AppFontWeight.extraBold),
                ),
                const SizedBox(height: 16),
                const Divider(color: Colors.white30),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Đang chờ giải ngân', style: TextStyle(color: Colors.white70, fontSize: AppFontSize.xs)),
                        Text(_currency(pendingAmount), style: const TextStyle(color: Colors.white, fontWeight: AppFontWeight.bold, fontSize: AppFontSize.md)),
                      ],
                    ),
                    ElevatedButton.icon(
                      icon: const Icon(Iconsax.money_send, color: Colors.white),
                      label: const Text('Rút Tiền', style: TextStyle(color: Colors.white, fontWeight: AppFontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white.withValues(alpha: 0.2),
                        elevation: 0,
                        side: const BorderSide(color: Colors.white54),
                      ),
                      onPressed: () => _showWithdrawDialog(context, ref, balance),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Summary stats
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Expanded(child: _StatCard(icon: Iconsax.money_recive, label: 'Tổng nhận hôm nay', value: _currency((wallet['todayEarnings'] as num? ?? 0).toDouble()), color: AppColors.success)),
                const SizedBox(width: 12),
                Expanded(child: _StatCard(icon: Iconsax.receipt_item, label: 'Số đơn hôm nay', value: '${wallet['todayOrders'] ?? 0}', color: AppColors.primary)),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Transaction history
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text('Lịch Sử Giao Dịch', style: TextStyle(fontSize: AppFontSize.title, fontWeight: AppFontWeight.bold)),
          ),
          const SizedBox(height: 12),

          if (transactions.isEmpty)
            const Padding(
              padding: EdgeInsets.all(24),
              child: Center(child: Text('Chưa có giao dịch nào', style: TextStyle(color: AppColors.textSecondaryLight))),
            )
          else
            ...transactions.map((tx) => _TransactionTile(transaction: tx)),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  void _showWithdrawDialog(BuildContext context, WidgetRef ref, double balance) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Rút Tiền'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Số dư: ${_currency(balance)}', style: const TextStyle(color: AppColors.textSecondaryLight)),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Số tiền rút (đồng)', border: OutlineInputBorder()),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
            onPressed: () async {
              final amount = double.tryParse(controller.text.trim());
              if (amount == null || amount <= 0 || amount > balance) {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Số tiền không hợp lệ')));
                return;
              }
              Navigator.pop(ctx);
              try {
                final api = ref.read(apiClientProvider);
                await api.post('/shippers/me/wallet/withdraw', {'amount': amount});
                ref.invalidate(walletProvider);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Đã yêu cầu rút ${_currency(amount)}'), backgroundColor: AppColors.success));
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Lỗi: ${e.toString()}')));
                }
              }
            },
            child: const Text('Xác Nhận'),
          ),
        ],
      ),
    );
  }

  String _currency(double v) => '${v.toStringAsFixed(0).replaceAllMapped(RegExp(r"(\d)(?=(\d{3})+(?!\d))"), (m) => "${m[1]}.")}đ';
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({required this.icon, required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: const BoxDecoration(color: AppColors.surfaceLight, borderRadius: BorderRadius.all(AppRadius.md), boxShadow: AppShadows.sm),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: AppFontSize.lg, fontWeight: AppFontWeight.extraBold, color: color)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontSize: AppFontSize.xs, color: AppColors.textSecondaryLight)),
        ],
      ),
    );
  }
}

class _TransactionTile extends StatelessWidget {
  final Map<String, dynamic> transaction;
  const _TransactionTile({required this.transaction});

  @override
  Widget build(BuildContext context) {
    final amount = (transaction['amount'] as num? ?? 0).toDouble();
    final type = transaction['type'] as String? ?? 'earning';
    final isIncome = type == 'earning' || type == 'bonus';
    final desc = transaction['description'] as String? ?? '';
    final createdAt = transaction['createdAt'] as String?;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: const BoxDecoration(color: AppColors.surfaceLight, borderRadius: BorderRadius.all(AppRadius.md), boxShadow: AppShadows.sm),
      child: Row(
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              color: (isIncome ? AppColors.success : AppColors.error).withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(isIncome ? Iconsax.money_recive : Iconsax.money_send, color: isIncome ? AppColors.success : AppColors.error, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(desc, style: const TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.body)),
                if (createdAt != null) Text(_formatTime(createdAt), style: const TextStyle(fontSize: AppFontSize.xs, color: AppColors.textSecondaryLight)),
              ],
            ),
          ),
          Text(
            '${isIncome ? "+" : "-"}${amount.toStringAsFixed(0).replaceAllMapped(RegExp(r"(\d)(?=(\d{3})+(?!\d))"), (m) => "${m[1]}.")}đ',
            style: TextStyle(fontWeight: AppFontWeight.extraBold, color: isIncome ? AppColors.success : AppColors.error, fontSize: AppFontSize.md),
          ),
        ],
      ),
    );
  }

  String _formatTime(String iso) {
    try {
      final dt = DateTime.parse(iso).toLocal();
      return '${dt.day}/${dt.month}/${dt.year} ${dt.hour.toString().padLeft(2, "0")}:${dt.minute.toString().padLeft(2, "0")}';
    } catch (_) {
      return '';
    }
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Iconsax.warning_2, size: 48, color: AppColors.error),
          const SizedBox(height: 12),
          const Text('Không thể tải ví tiền', style: TextStyle(fontWeight: AppFontWeight.bold)),
          const SizedBox(height: 8),
          Text(message, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textSecondaryLight)),
          const SizedBox(height: 16),
          OutlinedButton.icon(icon: const Icon(Iconsax.refresh), label: const Text('Thử lại'), onPressed: onRetry),
        ],
      ),
    );
  }
}
