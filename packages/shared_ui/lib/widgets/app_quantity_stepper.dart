import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Reusable quantity stepper component `[-] count [+]`
class AppQuantityStepper extends StatelessWidget {
  final int value;
  final int min;
  final int max;
  final ValueChanged<int> onChanged;
  final VoidCallback? onDelete;
  final double height;
  final double iconSize;
  final bool isCompact;

  const AppQuantityStepper({
    super.key,
    required this.value,
    this.min = 1,
    this.max = 99,
    required this.onChanged,
    this.onDelete,
    this.height = 36,
    this.iconSize = 16,
    this.isCompact = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      height: height,
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceAltDark : AppColors.surfaceAltLight,
        borderRadius: const BorderRadius.all(AppRadius.full),
        border: Border.all(
          color: isDark ? AppColors.dividerDark : AppColors.dividerLight,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Decrease / Delete button
          _buildBtn(
            icon: value <= min && onDelete != null
                ? Icons.delete_outline_rounded
                : Icons.remove_rounded,
            iconColor: value <= min && onDelete != null
                ? AppColors.error
                : (value <= min ? AppColors.textHintLight : AppColors.textPrimaryLight),
            onTap: () {
              if (value > min) {
                onChanged(value - 1);
              } else if (onDelete != null) {
                onDelete!();
              }
            },
          ),

          // Quantity text
          Padding(
            padding: EdgeInsets.symmetric(horizontal: isCompact ? 8 : 12),
            child: Text(
              '$value',
              style: const TextStyle(
                fontWeight: AppFontWeight.bold,
                fontSize: AppFontSize.sm,
              ),
            ),
          ),

          // Increase button
          _buildBtn(
            icon: Icons.add_rounded,
            iconColor: value >= max ? AppColors.textHintLight : AppColors.primary,
            onTap: () {
              if (value < max) {
                onChanged(value + 1);
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildBtn({
    required IconData icon,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: const BorderRadius.all(AppRadius.full),
      child: SizedBox(
        width: height,
        height: height,
        child: Center(
          child: Icon(icon, size: iconSize, color: iconColor),
        ),
      ),
    );
  }
}
