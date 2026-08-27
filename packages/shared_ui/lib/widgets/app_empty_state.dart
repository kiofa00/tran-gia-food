import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'app_button.dart';

/// Standardized Empty / Placeholder / Unauthenticated UI state component
class AppEmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final String? actionText;
  final IconData? actionIcon;
  final VoidCallback? onAction;
  final Color? iconColor;
  final bool showIconCircle;
  final double iconSize;

  const AppEmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.description,
    this.actionText,
    this.actionIcon,
    this.onAction,
    this.iconColor,
    this.showIconCircle = true,
    this.iconSize = 44,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final effectiveIconColor = iconColor ?? AppColors.primary;

    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Icon container with subtle circular glow
            if (showIconCircle)
              Container(
                width: 96,
                height: 96,
                decoration: BoxDecoration(
                  color: effectiveIconColor.withValues(alpha: isDark ? 0.18 : 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icon,
                  size: iconSize,
                  color: effectiveIconColor,
                ),
              )
            else
              Icon(
                icon,
                size: iconSize * 1.4,
                color: effectiveIconColor,
              ),

            const SizedBox(height: 24),

            // Title (Theme-aware typography)
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: AppFontSize.lg,
                fontWeight: AppFontWeight.bold,
              ),
            ),

            const SizedBox(height: 10),

            // Description
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 340),
              child: Text(
                description,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: AppFontSize.body,
                  color: isDark
                      ? AppColors.textSecondaryDark
                      : AppColors.textSecondaryLight,
                  height: 1.5,
                ),
              ),
            ),

            // Action Button
            if (actionText != null && onAction != null) ...[
              const SizedBox(height: 28),
              ConstrainedBox(
                constraints: const BoxConstraints(minWidth: 200, maxWidth: 280),
                child: AppButton(
                  text: actionText!,
                  icon: actionIcon,
                  onPressed: onAction,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
