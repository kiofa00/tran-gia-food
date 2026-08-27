import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import 'voucher_detail_sheet.dart';

class VoucherCard extends StatelessWidget {
  final Map<String, dynamic> voucher;
  final bool fromCart;
  final bool isWalletItem;
  final void Function(String code) onSelect;
  final VoidCallback onClaim;

  const VoucherCard({
    super.key,
    required this.voucher,
    required this.fromCart,
    this.isWalletItem = false,
    required this.onSelect,
    required this.onClaim,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final code = (voucher['code'] as String? ?? '').toUpperCase();
    final title = voucher['title'] as String? ??
        (voucher['name'] as String? ?? 'Ưu đãi đặc biệt');
    final discountType =
        (voucher['discount_type'] ?? voucher['discountType'] ?? 'fixed')
            as String;
    final discountValue =
        ((voucher['discount_value'] ?? voucher['discountValue']) as num?)
            ?.toInt() ??
        0;
    final minOrder =
        ((voucher['min_order'] ??
                    voucher['minOrderValue'] ??
                    voucher['min_order_value'])
                as num?)
            ?.toInt() ??
        0;
    final type = voucher['type'] as String? ?? 'platform';
    final validTo =
        (voucher['valid_to'] ?? voucher['validTo']) as String? ?? '';
    final usedCount =
        ((voucher['used_count'] ?? voucher['usedCount']) as num?)?.toInt() ?? 0;
    final totalLimit =
        ((voucher['total_limit'] ?? voucher['totalLimit']) as num?)?.toInt() ??
        0;
    final remaining = totalLimit > 0 ? (totalLimit - usedCount) : 0;
    final isNearlyGone = totalLimit > 0 && remaining < totalLimit * 0.1;
    final isClaimed = isWalletItem || (voucher['isClaimed'] == true);

    String discountText = switch (discountType) {
      'percent' => 'GIẢM $discountValue%',
      'free_ship' || 'ship' => 'FREE SHIP',
      _ => 'GIẢM ${AppFormatters.currency(discountValue)}',
    };

    String minOrderText = minOrder > 0
        ? 'Đơn tối thiểu ${AppFormatters.currency(minOrder)}'
        : 'Mọi giá trị đơn hàng';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceAltDark : AppColors.surfaceLight,
        borderRadius: const BorderRadius.all(AppRadius.md),
        boxShadow: AppShadows.sm,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: const BorderRadius.all(AppRadius.md),
          onTap: () {
            VoucherDetailSheet.show(
              context: context,
              voucher: voucher,
              fromCart: fromCart,
              isWalletItem: isWalletItem,
              onSelect: onSelect,
              onClaim: onClaim,
            );
          },
          child: Row(
            children: [
              // Left Accent Strip
              Container(
                width: 8,
                height: 115,
                decoration: BoxDecoration(
                  color: type == 'platform'
                      ? AppColors.primary
                      : AppColors.warning,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(16),
                    bottomLeft: Radius.circular(16),
                  ),
                ),
              ),

              // Content Area
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 12,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Tag row
                      Row(
                        children: [
                          AppBadge(
                            label: type == 'platform' ? 'Nền tảng' : 'Quán tặng',
                            variant: type == 'platform'
                                ? AppBadgeVariant.primary
                                : AppBadgeVariant.warning,
                          ),
                          if (isNearlyGone) ...[
                            const SizedBox(width: 6),
                            const AppBadge(
                              label: 'Sắp hết!',
                              variant: AppBadgeVariant.error,
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 6),

                      // Discount Value
                      Text(
                        discountText,
                        style: TextStyle(
                          fontSize: AppFontSize.title,
                          fontWeight: AppFontWeight.bold,
                          color: type == 'platform'
                              ? AppColors.primary
                              : AppColors.warning,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: AppFontSize.xs,
                          fontWeight: AppFontWeight.medium,
                        ),
                      ),
                      const SizedBox(height: 2),

                      // Min Order Text
                      Text(
                        minOrderText,
                        style: const TextStyle(
                          fontSize: AppFontSize.xs,
                          color: AppColors.textSecondaryLight,
                        ),
                      ),
                      const SizedBox(height: 6),

                      // Expiry Date
                      Row(
                        children: [
                          const Icon(
                            Iconsax.clock,
                            size: 12,
                            color: AppColors.textSecondaryLight,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            validTo.isNotEmpty
                                ? 'HSD: ${AppFormatters.date(validTo)}'
                                : 'Không giới hạn',
                            style: const TextStyle(
                              fontSize: AppFontSize.xs,
                              color: AppColors.textSecondaryLight,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              // Dashed divider
              const SizedBox(
                height: 115,
                child: VerticalDivider(width: 1, color: AppColors.dividerLight),
              ),

              // Action button (Lưu / Dùng / Đã lưu)
              Container(
                width: 90,
                padding: const EdgeInsets.symmetric(horizontal: 10),
                child: Center(
                  child: fromCart
                      ? ElevatedButton(
                          onPressed: () => onSelect(code),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 8,
                            ),
                            shape: const RoundedRectangleBorder(
                              borderRadius:
                                  BorderRadius.all(AppRadius.full),
                            ),
                          ),
                          child: const Text(
                            'Dùng',
                            style: TextStyle(
                              fontSize: AppFontSize.xs,
                              fontWeight: AppFontWeight.bold,
                            ),
                          ),
                        )
                      : (isClaimed
                          ? Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(
                                    color: AppColors.success
                                        .withValues(alpha: 0.12),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.check,
                                    color: AppColors.success,
                                    size: 16,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                const Text(
                                  'Đã lưu ví',
                                  style: TextStyle(
                                    fontSize: AppFontSize.xs,
                                    color: AppColors.success,
                                    fontWeight: AppFontWeight.bold,
                                  ),
                                ),
                              ],
                            )
                          : OutlinedButton(
                              onPressed: onClaim,
                              style: OutlinedButton.styleFrom(
                                foregroundColor: AppColors.primary,
                                side: const BorderSide(
                                  color: AppColors.primary,
                                  width: 1.2,
                                ),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 8,
                                ),
                                shape: const RoundedRectangleBorder(
                                  borderRadius:
                                      BorderRadius.all(AppRadius.full),
                                ),
                              ),
                              child: const Text(
                                'Lưu',
                                style: TextStyle(
                                  fontSize: AppFontSize.xs,
                                  fontWeight: AppFontWeight.bold,
                                ),
                              ),
                            )),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
