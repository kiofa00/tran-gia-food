import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Styled input textfield for Tran Gia Food apps
class AppTextField extends StatelessWidget {
  final String hintText;
  final String? labelText;
  final TextEditingController? controller;
  final TextInputType keyboardType;
  final TextInputAction? textInputAction;
  final bool obscureText;
  final IconData? prefixIcon;
  final Widget? suffixIcon;
  final String? Function(String?)? validator;
  final void Function(String)? onChanged;
  final void Function(String)? onFieldSubmitted;

  final bool enabled;
  final bool readOnly;

  const AppTextField({
    super.key,
    required this.hintText,
    this.labelText,
    this.controller,
    this.keyboardType = TextInputType.text,
    this.textInputAction,
    this.obscureText = false,
    this.enabled = true,
    this.readOnly = false,
    this.prefixIcon,
    this.suffixIcon,
    this.validator,
    this.onChanged,
    this.onFieldSubmitted,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (labelText != null) ...[
          Text(
            labelText!,
            style: TextStyle(
              fontSize: AppFontSize.md,
              fontWeight: AppFontWeight.semiBold,
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            ),
          ),
          const SizedBox(height: 6),
        ],
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          textInputAction: textInputAction,
          obscureText: obscureText,
          enabled: enabled,
          readOnly: readOnly,
          validator: validator,
          onChanged: onChanged,
          onFieldSubmitted: onFieldSubmitted,
          style: TextStyle(
            fontSize: AppFontSize.base,
            color: (!enabled || readOnly)
                ? (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight)
                : (isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight),
          ),
          decoration: InputDecoration(
            hintText: hintText,
            prefixIcon: prefixIcon != null
                ? Icon(
                    prefixIcon,
                    size: 20,
                    color: (!enabled || readOnly)
                        ? AppColors.textHintLight
                        : AppColors.primary,
                  )
                : null,
            suffixIcon: suffixIcon,
            filled: true,
            fillColor: (!enabled || readOnly)
                ? (isDark ? AppColors.surfaceDark : AppColors.dividerLight.withValues(alpha: 0.5))
                : (isDark ? AppColors.surfaceAltDark : AppColors.surfaceAltLight),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            border: const OutlineInputBorder(
              borderRadius: BorderRadius.all(AppRadius.sm),
              borderSide: BorderSide.none,
            ),
            enabledBorder: const OutlineInputBorder(
              borderRadius: BorderRadius.all(AppRadius.sm),
              borderSide: BorderSide.none,
            ),
            focusedBorder: const OutlineInputBorder(
              borderRadius: BorderRadius.all(AppRadius.sm),
              borderSide: BorderSide(color: AppColors.primary, width: 1.5),
            ),
            disabledBorder: const OutlineInputBorder(
              borderRadius: BorderRadius.all(AppRadius.sm),
              borderSide: BorderSide.none,
            ),
          ),
        ),
      ],
    );
  }
}
