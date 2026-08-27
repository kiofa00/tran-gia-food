import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

class TransactionItemTile extends StatelessWidget {
  final Map<String, dynamic> tx;

  const TransactionItemTile({super.key, required this.tx});

  @override
  Widget build(BuildContext context) {
    final type = tx['type'] as String? ?? 'deposit';
    final amount = (tx['amount'] as num?)?.toInt() ?? 0;
    final status = tx['status'] as String? ?? 'completed';
    final createdAt = tx['created_at'] ?? tx['createdAt'] ?? '';
    final isPositive = type == 'deposit' || type == 'refund';

    final iconData = switch (type) {
      'deposit' => Iconsax.card_receive,
      'withdraw' => Iconsax.card_send,
      'payment' => Iconsax.shopping_cart,
      'refund' => Iconsax.refresh,
      _ => Iconsax.wallet_money,
    };

    final title = switch (type) {
      'deposit' => 'Nạp tiền vào ví',
      'withdraw' => 'Rút tiền về ngân hàng',
      'payment' => 'Thanh toán đơn hàng',
      'refund' => 'Hoàn tiền đơn hàng',
      _ => 'Giao dịch ví',
    };

    final badgeVariant = switch (status) {
      'completed' || 'success' => AppBadgeVariant.success,
      'pending' || 'processing' => AppBadgeVariant.warning,
      'failed' || 'cancelled' => AppBadgeVariant.error,
      _ => AppBadgeVariant.neutral,
    };

    final statusText = switch (status) {
      'completed' || 'success' => 'Thành công',
      'pending' || 'processing' => 'Chờ xử lý',
      'failed' || 'cancelled' => 'Thất bại',
      _ => status,
    };

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: (isPositive ? AppColors.success : AppColors.primary)
                  .withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              iconData,
              color: isPositive ? AppColors.success : AppColors.primary,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: AppFontWeight.bold,
                    fontSize: AppFontSize.sm,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  AppFormatters.relativeTime(createdAt),
                  style: const TextStyle(
                    fontSize: AppFontSize.xs,
                    color: AppColors.textSecondaryLight,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${isPositive ? '+' : '-'}${AppFormatters.currency(amount)}',
                style: TextStyle(
                  fontWeight: AppFontWeight.bold,
                  fontSize: AppFontSize.base,
                  color: isPositive ? AppColors.success : AppColors.error,
                ),
              ),
              const SizedBox(height: 2),
              AppBadge(
                label: statusText,
                variant: badgeVariant,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
