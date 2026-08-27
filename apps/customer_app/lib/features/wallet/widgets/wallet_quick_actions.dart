import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

class WalletQuickActions extends StatelessWidget {
  final VoidCallback onDeposit;
  final VoidCallback onWithdraw;
  final VoidCallback onLinkBank;
  final VoidCallback onEkyc;

  const WalletQuickActions({
    super.key,
    required this.onDeposit,
    required this.onWithdraw,
    required this.onLinkBank,
    required this.onEkyc,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceAltDark : AppColors.surfaceLight,
        borderRadius: const BorderRadius.all(AppRadius.md),
        boxShadow: AppShadows.sm,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildItem(
            icon: Iconsax.card_receive,
            label: 'Nạp tiền',
            color: AppColors.success,
            onTap: onDeposit,
          ),
          _buildItem(
            icon: Iconsax.card_send,
            label: 'Rút tiền',
            color: AppColors.primary,
            onTap: onWithdraw,
          ),
          _buildItem(
            icon: Iconsax.bank,
            label: 'Liên kết',
            color: AppColors.info,
            onTap: onLinkBank,
          ),
          _buildItem(
            icon: Iconsax.verify,
            label: 'eKYC',
            color: AppColors.warning,
            onTap: onEkyc,
          ),
        ],
      ),
    );
  }

  Widget _buildItem({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: const BorderRadius.all(AppRadius.md),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(height: 6),
            Text(
              label,
              style: const TextStyle(
                fontSize: AppFontSize.xs,
                fontWeight: AppFontWeight.medium,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
