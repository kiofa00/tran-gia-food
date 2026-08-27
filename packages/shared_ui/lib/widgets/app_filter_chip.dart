import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Reusable filter chip with animated selection state
class AppFilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;
  final IconData? icon;
  final EdgeInsets margin;
  final EdgeInsets padding;

  const AppFilterChip({
    super.key,
    required this.label,
    required this.isSelected,
    required this.onTap,
    this.icon,
    this.margin = const EdgeInsets.only(right: 8),
    this.padding = const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: margin,
        padding: padding,
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary
              : (isDark ? AppColors.surfaceAltDark : AppColors.surfaceAltLight),
          borderRadius: const BorderRadius.all(AppRadius.full),
          border: Border.all(
            color: isSelected
                ? AppColors.primary
                : (isDark ? AppColors.dividerDark : AppColors.dividerLight),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(
                icon,
                size: 16,
                color: isSelected
                    ? Colors.white
                    : (isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight),
              ),
              const SizedBox(width: 6),
            ],
            Text(
              label,
              style: TextStyle(
                color: isSelected
                    ? Colors.white
                    : (isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight),
                fontWeight:
                    isSelected ? AppFontWeight.bold : AppFontWeight.medium,
                fontSize: AppFontSize.sm,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
