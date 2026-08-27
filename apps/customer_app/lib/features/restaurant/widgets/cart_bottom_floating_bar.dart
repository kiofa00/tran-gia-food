import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

class CartBottomFloatingBar extends StatelessWidget {
  final int totalCount;
  final int totalMoney;
  final VoidCallback? onViewCart;

  const CartBottomFloatingBar({
    super.key,
    required this.totalCount,
    required this.totalMoney,
    this.onViewCart,
  });

  @override
  Widget build(BuildContext context) {
    if (totalCount <= 0) return const SizedBox.shrink();

    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceAltDark : AppColors.surfaceDark,
        borderRadius: const BorderRadius.all(AppRadius.lg),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.25),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Iconsax.shopping_cart,
              color: AppColors.primary,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$totalCount món đã chọn',
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: AppFontSize.xs,
                  ),
                ),
                Text(
                  AppFormatters.currency(totalMoney),
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: AppFontWeight.bold,
                    fontSize: AppFontSize.base,
                  ),
                ),
              ],
            ),
          ),
          ElevatedButton.icon(
            onPressed: onViewCart ?? () => context.push('/cart'),
            icon: const Icon(Iconsax.arrow_right_3, size: 16, color: Colors.white),
            label: const Text('Xem Giỏ Hàng', style: TextStyle(color: Colors.white, fontWeight: AppFontWeight.bold)),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: const RoundedRectangleBorder(
                borderRadius: BorderRadius.all(AppRadius.full),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            ),
          ),
        ],
      ),
    );
  }
}
