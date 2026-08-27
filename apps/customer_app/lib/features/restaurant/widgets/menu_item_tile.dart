import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

class MenuItemTile extends StatelessWidget {
  final Map<String, dynamic> item;
  final VoidCallback onAdd;

  const MenuItemTile({
    super.key,
    required this.item,
    required this.onAdd,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final name = item['name'] as String? ?? 'Món ngon';
    final description = item['description'] as String? ?? '';
    final price = (item['price'] as num?)?.toInt() ?? 0;
    final originalPrice = (item['originalPrice'] as num?)?.toInt();
    final imageUrl = item['imageUrl'] as String?;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceAltDark : AppColors.surfaceLight,
        borderRadius: const BorderRadius.all(AppRadius.md),
        boxShadow: AppShadows.sm,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Food Image
          AppNetworkImage(
            imageUrl: imageUrl,
            width: 84,
            height: 84,
            borderRadius: const BorderRadius.all(AppRadius.sm),
            errorIcon: Iconsax.cake,
          ),
          const SizedBox(width: 12),

          // Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    fontWeight: AppFontWeight.bold,
                    fontSize: AppFontSize.base,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (description.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(
                    description,
                    style: const TextStyle(
                      fontSize: AppFontSize.xs,
                      color: AppColors.textSecondaryLight,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                const SizedBox(height: 8),

                // Price and Add Button
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    AppPriceTag(
                      price: price,
                      originalPrice: originalPrice,
                      fontSize: AppFontSize.title,
                    ),
                    InkWell(
                      onTap: onAdd,
                      borderRadius: const BorderRadius.all(AppRadius.full),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.add,
                          color: Colors.white,
                          size: 18,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
