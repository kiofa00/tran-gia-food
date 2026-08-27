import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../utils/formatters.dart';

/// Reusable price tag displaying current discounted price and optional original price
class AppPriceTag extends StatelessWidget {
  final num price;
  final num? originalPrice;
  final double fontSize;
  final Color? priceColor;
  final bool isVertical;

  const AppPriceTag({
    super.key,
    required this.price,
    this.originalPrice,
    this.fontSize = AppFontSize.base,
    this.priceColor,
    this.isVertical = false,
  });

  @override
  Widget build(BuildContext context) {
    final hasDiscount =
        originalPrice != null && originalPrice! > price && price > 0;

    final priceWidget = Text(
      AppFormatters.currency(price),
      style: TextStyle(
        fontSize: fontSize,
        fontWeight: AppFontWeight.bold,
        color: priceColor ?? AppColors.primary,
      ),
    );

    if (!hasDiscount) return priceWidget;

    final originalWidget = Text(
      AppFormatters.currency(originalPrice),
      style: TextStyle(
        fontSize: fontSize * 0.8,
        decoration: TextDecoration.lineThrough,
        color: AppColors.textHintLight,
      ),
    );

    if (isVertical) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          priceWidget,
          const SizedBox(height: 2),
          originalWidget,
        ],
      );
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        priceWidget,
        const SizedBox(width: 6),
        originalWidget,
      ],
    );
  }
}
