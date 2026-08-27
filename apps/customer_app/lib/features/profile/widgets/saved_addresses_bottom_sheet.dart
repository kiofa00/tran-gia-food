import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

class SavedAddressesBottomSheet extends StatelessWidget {
  const SavedAddressesBottomSheet({super.key});

  static Future<void> show(BuildContext context) {
    return AppModalBottomSheet.show(
      context: context,
      builder: (ctx) => const SavedAddressesBottomSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AppModalBottomSheet(
      title: 'Địa Chỉ Đã Lưu',
      icon: Iconsax.location5,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color:
                  isDark ? AppColors.surfaceAltDark : AppColors.surfaceAltLight,
              borderRadius: const BorderRadius.all(AppRadius.md),
            ),
            child: const Row(
              children: [
                Icon(Iconsax.home, color: AppColors.primary),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Nhà Riêng (Mặc định)',
                        style: TextStyle(
                          fontWeight: AppFontWeight.bold,
                          fontSize: AppFontSize.base,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        '123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM',
                        style: TextStyle(
                          fontSize: AppFontSize.sm,
                          color: AppColors.textSecondaryLight,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(Icons.check_circle, color: AppColors.primary),
              ],
            ),
          ),
          const Spacer(),
          SizedBox(
            width: double.infinity,
            child: AppButton(
              text: '+ Thêm Địa Chỉ Mới',
              icon: Iconsax.add,
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content:
                        Text('Chức năng thêm địa chỉ mới đang được cập nhật'),
                    backgroundColor: AppColors.info,
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
