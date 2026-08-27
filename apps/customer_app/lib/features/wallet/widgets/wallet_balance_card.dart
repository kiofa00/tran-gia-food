import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

class WalletBalanceCard extends StatefulWidget {
  final Map<String, dynamic> wallet;

  const WalletBalanceCard({super.key, required this.wallet});

  @override
  State<WalletBalanceCard> createState() => _WalletBalanceCardState();
}

class _WalletBalanceCardState extends State<WalletBalanceCard> {
  bool _showBalance = true;

  @override
  Widget build(BuildContext context) {
    final balance = (widget.wallet['balance'] as num?)?.toInt() ?? 0;
    final pendingRefund =
        (widget.wallet['pending_refund'] as num?)?.toInt() ?? 0;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primary, AppColors.primaryDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: const BorderRadius.all(AppRadius.lg),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.35),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Iconsax.wallet_3, color: Colors.white70, size: 18),
              const SizedBox(width: 6),
              const Text(
                'Số dư ví TranGia',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: AppFontSize.sm,
                ),
              ),
              const SizedBox(width: 6),
              InkWell(
                onTap: () => setState(() => _showBalance = !_showBalance),
                child: Icon(
                  _showBalance ? Iconsax.eye : Iconsax.eye_slash,
                  color: Colors.white70,
                  size: 16,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: const BorderRadius.all(AppRadius.full),
                ),
                child: const Row(
                  children: [
                    Icon(Iconsax.shield_tick, color: Colors.white, size: 14),
                    SizedBox(width: 4),
                    Text(
                      'Đã xác minh',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: AppFontSize.xs,
                        fontWeight: AppFontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            _showBalance ? AppFormatters.currency(balance) : '******đ',
            style: const TextStyle(
              color: Colors.white,
              fontSize: AppFontSize.h1,
              fontWeight: AppFontWeight.bold,
              letterSpacing: 1,
            ),
          ),
          if (pendingRefund > 0) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 10,
                vertical: 4,
              ),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                borderRadius: const BorderRadius.all(AppRadius.sm),
              ),
              child: Text(
                '⏳ Đang hoàn tiền: ${AppFormatters.currency(pendingRefund)}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: AppFontSize.sm,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
