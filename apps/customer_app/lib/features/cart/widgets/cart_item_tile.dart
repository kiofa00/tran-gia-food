import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../cart_provider.dart';

class CartItemTile extends StatelessWidget {
  final CartItem item;
  final ValueChanged<int> onQuantityChanged;
  final VoidCallback onRemove;

  const CartItemTile({
    super.key,
    required this.item,
    required this.onQuantityChanged,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

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
            imageUrl: item.imageUrl,
            width: 76,
            height: 76,
            borderRadius: const BorderRadius.all(AppRadius.sm),
            errorIcon: Iconsax.cake,
          ),
          const SizedBox(width: 12),

          // Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        item.name,
                        style: const TextStyle(
                          fontWeight: AppFontWeight.bold,
                          fontSize: AppFontSize.base,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    InkWell(
                      onTap: onRemove,
                      borderRadius: const BorderRadius.all(AppRadius.full),
                      child: const Padding(
                        padding: EdgeInsets.all(4),
                        child: Icon(
                          Icons.close,
                          size: 16,
                          color: AppColors.textSecondaryLight,
                        ),
                      ),
                    ),
                  ],
                ),
                if (item.restaurantName.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(
                    item.restaurantName,
                    style: const TextStyle(
                      fontSize: AppFontSize.xs,
                      color: AppColors.textSecondaryLight,
                    ),
                  ),
                ],
                const SizedBox(height: 8),

                // Price and Quantity Stepper
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    AppPriceTag(
                      price: item.price,
                      fontSize: AppFontSize.title,
                    ),
                    AppQuantityStepper(
                      value: item.quantity,
                      onChanged: onQuantityChanged,
                      onDelete: onRemove,
                      height: 32,
                      isCompact: true,
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
