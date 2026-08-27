import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

class VoucherDetailSheet extends StatefulWidget {
  final Map<String, dynamic> voucher;
  final bool fromCart;
  final bool isWalletItem;
  final void Function(String code) onSelect;
  final VoidCallback onClaim;

  const VoucherDetailSheet({
    super.key,
    required this.voucher,
    required this.fromCart,
    this.isWalletItem = false,
    required this.onSelect,
    required this.onClaim,
  });

  static Future<void> show({
    required BuildContext context,
    required Map<String, dynamic> voucher,
    required bool fromCart,
    bool isWalletItem = false,
    required void Function(String code) onSelect,
    required VoidCallback onClaim,
  }) {
    return AppModalBottomSheet.show(
      context: context,
      builder: (ctx) => VoucherDetailSheet(
        voucher: voucher,
        fromCart: fromCart,
        isWalletItem: isWalletItem,
        onSelect: onSelect,
        onClaim: onClaim,
      ),
    );
  }

  @override
  State<VoucherDetailSheet> createState() => _VoucherDetailSheetState();
}

class _VoucherDetailSheetState extends State<VoucherDetailSheet> {
  bool _copied = false;

  void _copyToClipboard(String code) {
    Clipboard.setData(ClipboardData(text: code));
    setState(() => _copied = true);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Đã sao chép mã "$code" vào bộ nhớ tạm! 📋'),
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
      ),
    );
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) setState(() => _copied = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final voucher = widget.voucher;
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
    final maxDiscount =
        ((voucher['max_discount'] ?? voucher['maxDiscount']) as num?)
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
    final validFrom =
        (voucher['valid_from'] ?? voucher['validFrom']) as String? ?? '';
    final validTo =
        (voucher['valid_to'] ?? voucher['validTo']) as String? ?? '';
    final usedCount =
        ((voucher['used_count'] ?? voucher['usedCount']) as num?)?.toInt() ?? 0;
    final totalLimit =
        ((voucher['total_limit'] ?? voucher['totalLimit']) as num?)?.toInt() ??
        0;
    final remaining = totalLimit > 0 ? (totalLimit - usedCount) : 0;
    final description = voucher['description'] as String? ?? '';
    final isClaimed = widget.isWalletItem || (voucher['isClaimed'] == true);

    String discountHeadline = switch (discountType) {
      'percent' => 'Giảm $discountValue%',
      'free_ship' || 'ship' => 'Miễn phí giao hàng',
      _ => 'Giảm ${AppFormatters.currency(discountValue)}',
    };

    return AppModalBottomSheet(
      title: 'Chi Tiết Voucher',
      icon: Iconsax.ticket_discount,
      child: Column(
        children: [
          Expanded(
            child: ListView(
              children: [
                // Highlight Box
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: (type == 'platform'
                            ? AppColors.primary
                            : AppColors.warning)
                        .withValues(alpha: 0.08),
                    borderRadius: const BorderRadius.all(AppRadius.md),
                    border: Border.all(
                      color: (type == 'platform'
                              ? AppColors.primary
                              : AppColors.warning)
                          .withValues(alpha: 0.25),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AppBadge(
                        label: type == 'platform'
                            ? 'VOUCHER NỀN TẢNG'
                            : 'VOUCHER TỪ QUÁN',
                        variant: type == 'platform'
                            ? AppBadgeVariant.primary
                            : AppBadgeVariant.warning,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        discountHeadline,
                        style: TextStyle(
                          fontSize: AppFontSize.h1,
                          fontWeight: AppFontWeight.bold,
                          color: type == 'platform'
                              ? AppColors.primary
                              : AppColors.warning,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: AppFontSize.sm,
                          fontWeight: AppFontWeight.medium,
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Code Copy Row
                      InkWell(
                        borderRadius: const BorderRadius.all(AppRadius.sm),
                        onTap: () => _copyToClipboard(code),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 10,
                          ),
                          decoration: BoxDecoration(
                            color: isDark
                                ? AppColors.surfaceDark
                                : Colors.white,
                            borderRadius: const BorderRadius.all(
                              AppRadius.sm,
                            ),
                            border: Border.all(
                              color: _copied
                                  ? AppColors.success
                                  : AppColors.dividerLight,
                              width: _copied ? 1.5 : 1.0,
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                Iconsax.ticket_discount,
                                size: 20,
                                color: _copied
                                    ? AppColors.success
                                    : AppColors.primary,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                code,
                                style: TextStyle(
                                  fontWeight: AppFontWeight.bold,
                                  fontSize: AppFontSize.sm,
                                  letterSpacing: 1.1,
                                  color: _copied
                                      ? AppColors.success
                                      : null,
                                ),
                              ),
                              const Spacer(),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 5,
                                ),
                                decoration: BoxDecoration(
                                  color: _copied
                                      ? AppColors.success.withValues(alpha: 0.12)
                                      : AppColors.primary.withValues(alpha: 0.1),
                                  borderRadius: const BorderRadius.all(
                                    AppRadius.full,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      _copied ? Icons.check : Iconsax.copy,
                                      size: 14,
                                      color: _copied
                                          ? AppColors.success
                                          : AppColors.primary,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      _copied ? 'Đã sao chép' : 'Sao chép',
                                      style: TextStyle(
                                        color: _copied
                                            ? AppColors.success
                                            : AppColors.primary,
                                        fontSize: AppFontSize.xs,
                                        fontWeight: AppFontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Terms section
                const Text(
                  'Điều Kiện & Chi Tiết Ưu Đãi',
                  style: TextStyle(
                    fontWeight: AppFontWeight.bold,
                    fontSize: AppFontSize.base,
                  ),
                ),
                const SizedBox(height: 12),

                _buildDetailRow(
                  icon: Iconsax.shopping_bag,
                  label: 'Đơn hàng tối thiểu',
                  value: minOrder > 0
                      ? 'Từ ${AppFormatters.currency(minOrder)}'
                      : 'Không giới hạn giá trị đơn',
                ),
                if (discountType == 'percent' && maxDiscount > 0)
                  _buildDetailRow(
                    icon: Iconsax.money_recive,
                    label: 'Giảm tối đa',
                    value: AppFormatters.currency(maxDiscount),
                  ),
                _buildDetailRow(
                  icon: Iconsax.calendar_1,
                  label: 'Thời gian áp dụng',
                  value: validFrom.isNotEmpty && validTo.isNotEmpty
                      ? '${AppFormatters.date(validFrom)} - ${AppFormatters.date(validTo)}'
                      : (validTo.isNotEmpty
                          ? 'Đến hết ${AppFormatters.date(validTo)}'
                          : 'Vô thời hạn'),
                ),
                if (totalLimit > 0) ...[
                  _buildDetailRow(
                    icon: Iconsax.user,
                    label: 'Số lượng còn lại',
                    value: '$remaining / $totalLimit lượt',
                    valueColor: remaining < totalLimit * 0.1
                        ? AppColors.error
                        : null,
                  ),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: const BorderRadius.all(AppRadius.full),
                    child: LinearProgressIndicator(
                      value: ((totalLimit - remaining) / totalLimit)
                          .toDouble()
                          .clamp(0.0, 1.0),
                      backgroundColor: AppColors.dividerLight,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        remaining < totalLimit * 0.1
                            ? AppColors.error
                            : AppColors.primary,
                      ),
                      minHeight: 6,
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                if (description.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  const Text(
                    'Mô tả chi tiết',
                    style: TextStyle(
                      fontWeight: AppFontWeight.bold,
                      fontSize: AppFontSize.base,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    description,
                    style: const TextStyle(
                      fontSize: AppFontSize.sm,
                      color: AppColors.textSecondaryLight,
                      height: 1.5,
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Bottom Action Button
          SizedBox(
            width: double.infinity,
            child: AppButton(
              text: widget.fromCart
                  ? 'Áp Dụng Voucher Này'
                  : (isClaimed
                      ? 'Đã Có Trong Ví Voucher'
                      : 'Lưu Vào Ví Voucher'),
              icon: widget.fromCart
                  ? Iconsax.tick_circle
                  : (isClaimed ? Iconsax.wallet_check : Iconsax.add_circle),
              onPressed: () {
                Navigator.of(context).pop();
                if (widget.fromCart) {
                  widget.onSelect(code);
                } else if (!isClaimed) {
                  widget.onClaim();
                }
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow({
    required IconData icon,
    required String label,
    required String value,
    Color? valueColor,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: AppColors.primary),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(
                fontSize: AppFontSize.sm,
                color: AppColors.textSecondaryLight,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: AppFontSize.sm,
              fontWeight: AppFontWeight.bold,
              color: valueColor,
            ),
          ),
        ],
      ),
    );
  }
}
