import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

class WalletDepositModal extends StatefulWidget {
  final Future<void> Function(int amount, String method) onConfirm;

  const WalletDepositModal({super.key, required this.onConfirm});

  static Future<void> show({
    required BuildContext context,
    required Future<void> Function(int amount, String method) onConfirm,
  }) {
    return AppModalBottomSheet.show(
      context: context,
      builder: (ctx) => WalletDepositModal(onConfirm: onConfirm),
    );
  }

  @override
  State<WalletDepositModal> createState() => _WalletDepositModalState();
}

class _WalletDepositModalState extends State<WalletDepositModal> {
  int _selectedAmount = 100000;
  String _selectedMethod = 'momo';
  bool _isLoading = false;

  static const _quickAmounts = [50000, 100000, 200000, 500000, 1000000];

  @override
  Widget build(BuildContext context) {
    return AppModalBottomSheet(
      title: 'Nạp Tiền Vào Ví',
      icon: Iconsax.card_receive,
      child: ListView(
        children: [
          const Text(
            'Chọn số tiền nạp',
            style: TextStyle(
              fontWeight: AppFontWeight.bold,
              fontSize: AppFontSize.base,
            ),
          ),
          const SizedBox(height: 12),

          // Quick Amounts Wrap
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _quickAmounts.map((amt) {
              return AppFilterChip(
                label: AppFormatters.currency(amt),
                isSelected: _selectedAmount == amt,
                onTap: () => setState(() => _selectedAmount = amt),
              );
            }).toList(),
          ),
          const SizedBox(height: 20),

          // Payment Methods
          const Text(
            'Phương thức thanh toán',
            style: TextStyle(
              fontWeight: AppFontWeight.bold,
              fontSize: AppFontSize.base,
            ),
          ),
          const SizedBox(height: 12),

          _buildMethodTile(
            id: 'momo',
            title: 'Ví điện tử MoMo',
            subtitle: 'Thanh toán tức thì không tốn phí',
            icon: Iconsax.wallet_3,
            iconColor: Colors.pink,
          ),
          const SizedBox(height: 8),
          _buildMethodTile(
            id: 'vnpay',
            title: 'VNPAY / QR Pay',
            subtitle: 'Quét mã qua ứng dụng ngân hàng',
            icon: Iconsax.scan_barcode,
            iconColor: Colors.blue,
          ),
          const SizedBox(height: 8),
          _buildMethodTile(
            id: 'bank',
            title: 'Chuyển khoản trực tiếp',
            subtitle: 'Vietcombank, Techcombank, MBBank...',
            icon: Iconsax.bank,
            iconColor: AppColors.primary,
          ),
          const SizedBox(height: 24),

          // Submit Button
          AppButton(
            text: 'Nạp ${AppFormatters.currency(_selectedAmount)}',
            isLoading: _isLoading,
            onPressed: () async {
              setState(() => _isLoading = true);
              try {
                await widget.onConfirm(_selectedAmount, _selectedMethod);
                if (context.mounted) Navigator.pop(context);
              } finally {
                if (mounted) setState(() => _isLoading = false);
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildMethodTile({
    required String id,
    required String title,
    required String subtitle,
    required IconData icon,
    required Color iconColor,
  }) {
    final isSelected = _selectedMethod == id;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return InkWell(
      onTap: () => setState(() => _selectedMethod = id),
      borderRadius: const BorderRadius.all(AppRadius.md),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isDark ? AppColors.surfaceAltDark : AppColors.surfaceAltLight,
          borderRadius: const BorderRadius.all(AppRadius.md),
          border: Border.all(
            color: isSelected ? AppColors.primary : Colors.transparent,
            width: 1.5,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: iconColor, size: 20),
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
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: AppFontSize.xs,
                      color: AppColors.textSecondaryLight,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              isSelected
                  ? Icons.radio_button_checked
                  : Icons.radio_button_unchecked,
              color: isSelected ? AppColors.primary : AppColors.textHintLight,
            ),
          ],
        ),
      ),
    );
  }
}
