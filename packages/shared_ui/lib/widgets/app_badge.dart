import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

enum AppBadgeVariant {
  primary,
  success,
  warning,
  error,
  info,
  neutral,
}

/// Standard status badge & tag component
class AppBadge extends StatelessWidget {
  final String label;
  final IconData? icon;
  final AppBadgeVariant variant;
  final Color? customColor;
  final bool isOutline;
  final double fontSize;
  final EdgeInsets padding;

  const AppBadge({
    super.key,
    required this.label,
    this.icon,
    this.variant = AppBadgeVariant.primary,
    this.customColor,
    this.isOutline = false,
    this.fontSize = AppFontSize.xs,
    this.padding = const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
  });

  @override
  Widget build(BuildContext context) {
    final color = customColor ?? _getVariantColor();

    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: isOutline ? Colors.transparent : color.withValues(alpha: 0.12),
        borderRadius: const BorderRadius.all(AppRadius.full),
        border: Border.all(
          color: isOutline ? color : color.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: fontSize + 2, color: color),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: fontSize,
              fontWeight: AppFontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Color _getVariantColor() => switch (variant) {
        AppBadgeVariant.primary => AppColors.primary,
        AppBadgeVariant.success => AppColors.success,
        AppBadgeVariant.warning => AppColors.warning,
        AppBadgeVariant.error => AppColors.error,
        AppBadgeVariant.info => AppColors.info,
        AppBadgeVariant.neutral => AppColors.textSecondaryLight,
      };
}
