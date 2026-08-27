import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

import '../../../../core/providers/app_info_provider.dart';

class SettingsBottomSheet extends ConsumerStatefulWidget {
  const SettingsBottomSheet({super.key});

  static Future<void> show(BuildContext context) {
    return AppModalBottomSheet.show(
      context: context,
      builder: (ctx) => const SettingsBottomSheet(),
    );
  }

  @override
  ConsumerState<SettingsBottomSheet> createState() =>
      _SettingsBottomSheetState();
}

class _SettingsBottomSheetState extends ConsumerState<SettingsBottomSheet> {
  String _selectedLanguage = 'vi';

  @override
  Widget build(BuildContext context) {
    final currentTheme = ref.watch(themeProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AppModalBottomSheet(
      title: 'Cài Đặt Ứng Dụng',
      icon: Iconsax.setting_2,
      child: ListView(
        children: [
          // Section 1: Theme Mode
          const Text(
            'Giao Diện',
            style: TextStyle(
              fontSize: AppFontSize.sm,
              fontWeight: AppFontWeight.bold,
              color: AppColors.textSecondaryLight,
            ),
          ),
          const SizedBox(height: 10),

          Container(
            decoration: BoxDecoration(
              color: isDark
                  ? AppColors.surfaceAltDark
                  : AppColors.surfaceAltLight,
              borderRadius: const BorderRadius.all(AppRadius.md),
            ),
            child: ClipRRect(
              borderRadius: const BorderRadius.all(AppRadius.md),
              child: Column(
                children: [
                  _buildThemeOption(
                    title: 'Chế độ Sáng (Light)',
                    icon: Iconsax.sun_1,
                    iconColor: AppColors.warning,
                    mode: ThemeMode.light,
                    currentMode: currentTheme,
                    onTap: () {
                      ref
                          .read(themeProvider.notifier)
                          .setTheme(ThemeMode.light);
                    },
                  ),
                  const Divider(
                    height: 1,
                    indent: 48,
                    color: AppColors.dividerLight,
                  ),
                  _buildThemeOption(
                    title: 'Chế độ Tối (Dark)',
                    icon: Iconsax.moon,
                    iconColor: AppColors.primary,
                    mode: ThemeMode.dark,
                    currentMode: currentTheme,
                    onTap: () {
                      ref.read(themeProvider.notifier).setTheme(ThemeMode.dark);
                    },
                  ),
                  const Divider(
                    height: 1,
                    indent: 48,
                    color: AppColors.dividerLight,
                  ),
                  _buildThemeOption(
                    title: 'Theo hệ thống (System)',
                    icon: Iconsax.mobile,
                    iconColor: AppColors.textSecondaryLight,
                    mode: ThemeMode.system,
                    currentMode: currentTheme,
                    onTap: () {
                      ref
                          .read(themeProvider.notifier)
                          .setTheme(ThemeMode.system);
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Section 2: Language
          const Text(
            'Ngôn Ngữ (Language)',
            style: TextStyle(
              fontSize: AppFontSize.sm,
              fontWeight: AppFontWeight.bold,
              color: AppColors.textSecondaryLight,
            ),
          ),
          const SizedBox(height: 10),

          Container(
            decoration: BoxDecoration(
              color: isDark
                  ? AppColors.surfaceAltDark
                  : AppColors.surfaceAltLight,
              borderRadius: const BorderRadius.all(AppRadius.md),
            ),
            child: ClipRRect(
              borderRadius: const BorderRadius.all(AppRadius.md),
              child: Column(
                children: [
                  _buildLanguageOption(
                    flag: '🇻🇳',
                    title: 'Tiếng Việt (Mặc định)',
                    code: 'vi',
                  ),
                  const Divider(
                    height: 1,
                    indent: 48,
                    color: AppColors.dividerLight,
                  ),
                  _buildLanguageOption(
                    flag: '🇬🇧',
                    title: 'English',
                    code: 'en',
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Section 3: App Info
          const Text(
            'Thông Tin Ứng Dụng',
            style: TextStyle(
              fontSize: AppFontSize.sm,
              fontWeight: AppFontWeight.bold,
              color: AppColors.textSecondaryLight,
            ),
          ),
          const SizedBox(height: 10),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark
                  ? AppColors.surfaceAltDark
                  : AppColors.surfaceAltLight,
              borderRadius: const BorderRadius.all(AppRadius.md),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.15),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Iconsax.shop,
                        color: AppColors.primary,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Tran Gia Food',
                          style: TextStyle(
                            fontWeight: AppFontWeight.bold,
                            fontSize: AppFontSize.title,
                          ),
                        ),
                        ref
                            .watch(appInfoProvider)
                            .when(
                              data: (info) => Text(
                                'Phiên bản ${info.version} (Build ${info.buildNumber})',
                                style: const TextStyle(
                                  fontSize: AppFontSize.xs,
                                  color: AppColors.textSecondaryLight,
                                ),
                              ),
                              loading: () => const SizedBox.shrink(),
                              error: (_, __) => const SizedBox.shrink(),
                            ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Divider(height: 1, color: AppColors.dividerLight),
                const SizedBox(height: 12),
                _buildInfoRow('Hotline hỗ trợ', '1900 6868'),
                const SizedBox(height: 8),
                _buildInfoRow('Email liên hệ', 'support@trangiafood.vn'),
                const SizedBox(height: 8),
                _buildInfoRow('Bản quyền', '© 2026 Tran Gia Food Platform'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildThemeOption({
    required String title,
    required IconData icon,
    required Color iconColor,
    required ThemeMode mode,
    required ThemeMode currentMode,
    required VoidCallback onTap,
  }) {
    final isSelected = mode == currentMode;
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Icon(icon, color: iconColor, size: 22),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontWeight: isSelected
                      ? AppFontWeight.bold
                      : AppFontWeight.regular,
                  color: isSelected ? AppColors.primary : null,
                ),
              ),
            ),
            if (isSelected)
              const Icon(
                Icons.check_circle_rounded,
                color: AppColors.primary,
                size: 20,
              )
            else
              const Icon(
                Icons.circle_outlined,
                color: AppColors.textHintLight,
                size: 20,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildLanguageOption({
    required String flag,
    required String title,
    required String code,
  }) {
    final isSelected = _selectedLanguage == code;
    return InkWell(
      onTap: () => setState(() => _selectedLanguage = code),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Text(flag, style: const TextStyle(fontSize: 20)),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontWeight: isSelected
                      ? AppFontWeight.bold
                      : AppFontWeight.regular,
                  color: isSelected ? AppColors.primary : null,
                ),
              ),
            ),
            if (isSelected)
              const Icon(
                Icons.check_circle_rounded,
                color: AppColors.primary,
                size: 20,
              )
            else
              const Icon(
                Icons.circle_outlined,
                color: AppColors.textHintLight,
                size: 20,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: AppFontSize.sm,
            color: AppColors.textSecondaryLight,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: AppFontSize.sm,
            fontWeight: AppFontWeight.bold,
          ),
        ),
      ],
    );
  }
}
