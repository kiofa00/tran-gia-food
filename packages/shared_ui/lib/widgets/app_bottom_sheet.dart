import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Standard modal bottom sheet container with drag handle, header, and theme styling
class AppModalBottomSheet extends StatelessWidget {
  final String title;
  final IconData? icon;
  final Color? iconColor;
  final Widget? trailing;
  final Widget child;
  final double maxHeightFactor;
  final EdgeInsets padding;
  final bool showDivider;

  const AppModalBottomSheet({
    super.key,
    required this.title,
    this.icon,
    this.iconColor,
    this.trailing,
    required this.child,
    this.maxHeightFactor = 0.85,
    this.padding = const EdgeInsets.all(20),
    this.showDivider = true,
  });

  /// Static helper to open a standard modal bottom sheet
  static Future<T?> show<T>({
    required BuildContext context,
    required Widget Function(BuildContext) builder,
    bool isScrollControlled = true,
  }) {
    return showModalBottomSheet<T>(
      context: context,
      isScrollControlled: isScrollControlled,
      backgroundColor: Colors.transparent,
      builder: builder,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.sizeOf(context).height * maxHeightFactor,
      ),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? AppColors.dividerDark : AppColors.dividerLight,
                borderRadius: const BorderRadius.all(AppRadius.full),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Row(
              children: [
                if (icon != null) ...[
                  Icon(icon, color: iconColor ?? AppColors.primary),
                  const SizedBox(width: 10),
                ],
                Expanded(
                  child: Text(
                    title,
                    style: const TextStyle(
                      fontSize: AppFontSize.lg,
                      fontWeight: AppFontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (trailing != null)
                  trailing!
                else
                  IconButton(
                    icon: const Icon(Icons.close, color: AppColors.textSecondaryLight),
                    onPressed: () => Navigator.pop(context),
                  ),
              ],
            ),
          ),

          if (showDivider)
            Container(
              height: 1,
              color: isDark ? AppColors.dividerDark : AppColors.dividerLight,
            ),

          // Content body
          Expanded(
            child: Padding(
              padding: padding,
              child: child,
            ),
          ),
        ],
      ),
    );
  }
}
