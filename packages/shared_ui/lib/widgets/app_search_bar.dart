import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import '../theme/app_theme.dart';

/// Reusable search bar with clear button, submit action, and debouncing support
class AppSearchBar extends StatelessWidget {
  final TextEditingController? controller;
  final String hintText;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final VoidCallback? onClear;
  final VoidCallback? onTap;
  final bool readOnly;
  final bool autofocus;
  final EdgeInsets margin;

  const AppSearchBar({
    super.key,
    this.controller,
    this.hintText = 'Tìm kiếm món ăn, quán ngon...',
    this.onChanged,
    this.onSubmitted,
    this.onClear,
    this.onTap,
    this.readOnly = false,
    this.autofocus = false,
    this.margin = EdgeInsets.zero,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final borderColor = isDark ? AppColors.dividerDark : AppColors.dividerLight;
    final fillColor = isDark
        ? AppColors.surfaceAltDark
        : AppColors.surfaceAltLight;

    return Padding(
      padding: margin,
      child: TextField(
        controller: controller,
        readOnly: readOnly,
        autofocus: autofocus,
        onTap: onTap,
        onChanged: onChanged,
        onSubmitted: onSubmitted,
        textInputAction: TextInputAction.search,
        textAlignVertical: TextAlignVertical.center,
        style: TextStyle(
          fontSize: AppFontSize.base,
          color: isDark
              ? AppColors.textPrimaryDark
              : AppColors.textPrimaryLight,
        ),
        decoration: InputDecoration(
          isDense: true,
          hintText: hintText,
          hintStyle: const TextStyle(
            fontSize: AppFontSize.sm,
            color: AppColors.textHintLight,
          ),
          filled: true,
          fillColor: fillColor,
          prefixIcon: const Icon(
            Iconsax.search_normal_1,
            size: 20,
            color: AppColors.textSecondaryLight,
          ),
          suffixIcon: controller != null && controller!.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(
                    Icons.cancel,
                    size: 18,
                    color: AppColors.textSecondaryLight,
                  ),
                  onPressed: () {
                    controller!.clear();
                    onClear?.call();
                    onChanged?.call('');
                  },
                )
              : null,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 12,
          ),
          border: OutlineInputBorder(
            borderRadius: const BorderRadius.all(AppRadius.full),
            borderSide: BorderSide(color: borderColor),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: const BorderRadius.all(AppRadius.full),
            borderSide: BorderSide(color: borderColor),
          ),
          focusedBorder: const OutlineInputBorder(
            borderRadius: BorderRadius.all(AppRadius.full),
            borderSide: BorderSide(color: AppColors.primary, width: 1.5),
          ),
        ),
      ),
    );
  }
}
