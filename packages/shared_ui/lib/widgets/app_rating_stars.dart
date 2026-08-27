import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Reusable rating stars component (either read-only display or interactive star selector)
class AppRatingStars extends StatelessWidget {
  final double rating;
  final int maxStars;
  final double size;
  final Color color;
  final Color emptyColor;
  final ValueChanged<int>? onRatingChanged;
  final bool showScoreText;

  const AppRatingStars({
    super.key,
    required this.rating,
    this.maxStars = 5,
    this.size = 18,
    this.color = AppColors.warning,
    this.emptyColor = AppColors.textHintLight,
    this.onRatingChanged,
    this.showScoreText = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ...List.generate(maxStars, (index) {
          final starIndex = index + 1;
          final isFilled = rating >= starIndex;
          final isHalf = rating > index && rating < starIndex;

          final icon = Icon(
            isFilled
                ? Icons.star_rounded
                : (isHalf ? Icons.star_half_rounded : Icons.star_outline_rounded),
            color: isFilled || isHalf ? color : emptyColor,
            size: size,
          );

          if (onRatingChanged != null) {
            return IconButton(
              iconSize: size,
              padding: EdgeInsets.zero,
              constraints: BoxConstraints(minWidth: size + 8, minHeight: size + 8),
              icon: icon,
              onPressed: () => onRatingChanged!(starIndex),
            );
          }

          return icon;
        }),
        if (showScoreText) ...[
          const SizedBox(width: 6),
          Text(
            rating.toStringAsFixed(1),
            style: TextStyle(
              fontSize: size * 0.8,
              fontWeight: AppFontWeight.bold,
              color: color,
            ),
          ),
        ],
      ],
    );
  }
}
