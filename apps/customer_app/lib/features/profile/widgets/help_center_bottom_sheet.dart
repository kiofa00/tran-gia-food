import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

class HelpCenterBottomSheet extends StatefulWidget {
  const HelpCenterBottomSheet({super.key});

  static Future<void> show(BuildContext context) {
    return AppModalBottomSheet.show(
      context: context,
      builder: (ctx) => const HelpCenterBottomSheet(),
    );
  }

  @override
  State<HelpCenterBottomSheet> createState() => _HelpCenterBottomSheetState();
}

class _HelpCenterBottomSheetState extends State<HelpCenterBottomSheet> {
  int? _expandedIndex;

  static const _faqs = [
    (
      'Làm sao để áp dụng mã giảm giá / voucher?',
      'Tại màn hình Giỏ Hàng, bạn nhấn vào mục "Ưu Đãi & Khuyến Mãi" để chọn mã trong ví của bạn hoặc nhập trực tiếp mã khuyến mãi vào ô nhập.',
    ),
    (
      'Thời gian giao món ăn là bao lâu?',
      'Thời gian giao hàng trung bình từ 15 đến 30 phút tùy thuộc vào khoảng cách và thời gian chuẩn bị món của quán ăn.',
    ),
    (
      'Những hình thức thanh toán nào được hỗ trợ?',
      'Tran Gia Food hỗ trợ thanh toán tiền mặt khi nhận hàng (COD), Ví điện tử MoMo và chuyển khoản ngân hàng qua cổng thanh toán.',
    ),
    (
      'Làm thế nào để liên hệ trực tiếp với tài xế?',
      'Sau khi đơn hàng được tài xế tiếp nhận, bạn có thể vào màn hình Theo Dõi Đơn Hàng để gọi điện hoặc nhắn tin trực tiếp với tài xế.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AppModalBottomSheet(
      title: 'Trung Tâm Hỗ Trợ 24/7',
      icon: Iconsax.message_question,
      child: ListView(
        children: [
          // Contact Hotline card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: const BorderRadius.all(AppRadius.md),
              border:
                  Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                const Icon(Iconsax.call, color: AppColors.primary, size: 28),
                const SizedBox(width: 14),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Tổng đài chăm sóc khách hàng',
                        style: TextStyle(
                          fontSize: AppFontSize.xs,
                          color: AppColors.textSecondaryLight,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        '1900 6868 (Phím 1)',
                        style: TextStyle(
                          fontSize: AppFontSize.lg,
                          fontWeight: AppFontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content:
                            Text('Đang kết nối tổng đài 1900 6868... 📞'),
                        backgroundColor: AppColors.primary,
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    shape: const RoundedRectangleBorder(
                      borderRadius: BorderRadius.all(AppRadius.sm),
                    ),
                  ),
                  child: const Text(
                    'Gọi ngay',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // FAQs
          const Text(
            'Câu Hỏi Thường Gặp (FAQs)',
            style: TextStyle(
              fontSize: AppFontSize.title,
              fontWeight: AppFontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),

          ...List.generate(_faqs.length, (index) {
            final faq = _faqs[index];
            final isExpanded = _expandedIndex == index;
            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              decoration: BoxDecoration(
                color: isDark
                    ? AppColors.surfaceAltDark
                    : AppColors.surfaceAltLight,
                borderRadius: const BorderRadius.all(AppRadius.md),
              ),
              child: InkWell(
                borderRadius: const BorderRadius.all(AppRadius.md),
                onTap: () {
                  setState(() {
                    _expandedIndex = isExpanded ? null : index;
                  });
                },
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              faq.$1,
                              style: const TextStyle(
                                fontSize: AppFontSize.sm,
                                fontWeight: AppFontWeight.bold,
                              ),
                            ),
                          ),
                          Icon(
                            isExpanded
                                ? Icons.keyboard_arrow_up
                                : Icons.keyboard_arrow_down,
                            color: AppColors.textSecondaryLight,
                          ),
                        ],
                      ),
                      if (isExpanded) ...[
                        const SizedBox(height: 10),
                        const Divider(
                          height: 1,
                          color: AppColors.dividerLight,
                        ),
                        const SizedBox(height: 10),
                        Text(
                          faq.$2,
                          style: const TextStyle(
                            fontSize: AppFontSize.sm,
                            color: AppColors.textSecondaryLight,
                            height: 1.4,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
