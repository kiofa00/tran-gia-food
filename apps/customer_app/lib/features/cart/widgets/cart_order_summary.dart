import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';

class CartOrderSummary extends StatelessWidget {
  final int subtotal;
  final int shippingFee;
  final int discountAmount;
  final int total;

  const CartOrderSummary({
    super.key,
    required this.subtotal,
    required this.shippingFee,
    required this.discountAmount,
    required this.total,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

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
          const Text(
            'Chi Tiết Thanh Toán',
            style: TextStyle(
              fontWeight: AppFontWeight.bold,
              fontSize: AppFontSize.title,
            ),
          ),
          const SizedBox(height: 12),
          _buildRow('Tạm tính tiền món', AppFormatters.currency(subtotal)),
          const SizedBox(height: 8),
          _buildRow(
            'Phí giao hàng',
            shippingFee > 0 ? AppFormatters.currency(shippingFee) : 'Miễn phí',
            valueColor: shippingFee == 0 ? AppColors.success : null,
          ),
          if (discountAmount > 0) ...[
            const SizedBox(height: 8),
            _buildRow(
              'Giảm giá ưu đãi',
              '-${AppFormatters.currency(discountAmount)}',
              valueColor: AppColors.success,
            ),
          ],
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12),
            child: Divider(height: 1, color: AppColors.dividerLight),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Tổng thanh toán',
                style: TextStyle(
                  fontWeight: AppFontWeight.bold,
                  fontSize: AppFontSize.base,
                ),
              ),
              Text(
                AppFormatters.currency(total),
                style: const TextStyle(
                  fontWeight: AppFontWeight.bold,
                  fontSize: AppFontSize.h3,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRow(String label, String value, {Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: AppFontSize.sm,
            color: AppColors.textSecondaryLight,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: AppFontSize.sm,
            fontWeight: AppFontWeight.medium,
            color: valueColor,
          ),
        ),
      ],
    );
  }
}
