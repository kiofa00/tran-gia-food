import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

class CartVoucherSection extends StatelessWidget {
  final TextEditingController controller;
  final String? appliedCode;
  final int discountAmount;
  final bool isLoading;
  final VoidCallback onApply;
  final VoidCallback onRemove;
  final VoidCallback onOpenPicker;

  const CartVoucherSection({
    super.key,
    required this.controller,
    this.appliedCode,
    this.discountAmount = 0,
    this.isLoading = false,
    required this.onApply,
    required this.onRemove,
    required this.onOpenPicker,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final hasApplied = appliedCode != null && appliedCode!.isNotEmpty;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceAltDark : AppColors.surfaceLight,
        borderRadius: const BorderRadius.all(AppRadius.md),
        boxShadow: AppShadows.sm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Iconsax.ticket_discount, color: AppColors.primary, size: 20),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  'Ưu Đãi & Khuyến Mãi',
                  style: TextStyle(
                    fontWeight: AppFontWeight.bold,
                    fontSize: AppFontSize.title,
                  ),
                ),
              ),
              InkWell(
                onTap: onOpenPicker,
                borderRadius: const BorderRadius.all(AppRadius.sm),
                child: const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                  child: Row(
                    children: [
                      Text(
                        'Chọn voucher',
                        style: TextStyle(
                          fontSize: AppFontSize.sm,
                          color: AppColors.primary,
                          fontWeight: AppFontWeight.bold,
                        ),
                      ),
                      SizedBox(width: 2),
                      Icon(
                        Icons.arrow_forward_ios_rounded,
                        size: 12,
                        color: AppColors.primary,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          if (hasApplied) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.success.withValues(alpha: 0.1),
                borderRadius: const BorderRadius.all(AppRadius.sm),
                border: Border.all(
                  color: AppColors.success.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                children: [
                  const Icon(
                    Iconsax.ticket_star,
                    color: AppColors.success,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Mã: $appliedCode',
                          style: const TextStyle(
                            fontWeight: AppFontWeight.bold,
                            fontSize: AppFontSize.sm,
                            color: AppColors.success,
                          ),
                        ),
                        Text(
                          'Tiết kiệm ${AppFormatters.currency(discountAmount)}',
                          style: const TextStyle(
                            fontSize: AppFontSize.xs,
                            color: AppColors.textSecondaryLight,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(
                      Icons.cancel,
                      color: AppColors.error,
                      size: 20,
                    ),
                    onPressed: onRemove,
                    tooltip: 'Bỏ mã',
                  ),
                ],
              ),
            ),
          ] else ...[
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: controller,
                    textCapitalization: TextCapitalization.characters,
                    decoration: const InputDecoration(
                      hintText: 'Nhập mã giảm giá...',
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 10,
                      ),
                      prefixIcon: Icon(Iconsax.ticket, size: 18),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: isLoading ? null : onApply,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    shape: const RoundedRectangleBorder(
                      borderRadius: BorderRadius.all(AppRadius.sm),
                    ),
                  ),
                  child: isLoading
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Áp dụng',
                          style: TextStyle(color: Colors.white),
                        ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
