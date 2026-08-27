import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import '../theme/app_theme.dart';

/// Centralized standard dialogs across the application
class AppDialogs {
  AppDialogs._();

  /// Show standard Login Prompt dialog when user attempts an unauthenticated action
  static Future<void> showLoginPrompt(
    BuildContext context, {
    required String actionText,
    required VoidCallback onLogin,
  }) {
    return showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(AppRadius.lg),
        ),
        title: const Row(
          children: [
            Icon(Iconsax.login_1, color: AppColors.primary),
            SizedBox(width: 8),
            Text('Yêu cầu đăng nhập'),
          ],
        ),
        content: Text(
          'Vui lòng đăng nhập tài khoản để $actionText nhé!',
          style: const TextStyle(height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text(
              'Để sau',
              style: TextStyle(color: AppColors.textSecondaryLight),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              onLogin();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: const RoundedRectangleBorder(
                borderRadius: BorderRadius.all(AppRadius.sm),
              ),
            ),
            child: const Text('Đăng nhập', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  /// Show standard Confirmation dialog (delete cart, cancel order, logout, etc.)
  static Future<bool> showConfirm(
    BuildContext context, {
    required String title,
    required String message,
    String confirmText = 'Xác nhận',
    String cancelText = 'Hủy',
    bool isDestructive = false,
    IconData? icon,
  }) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(AppRadius.lg),
        ),
        title: Row(
          children: [
            if (icon != null) ...[
              Icon(
                icon,
                color: isDestructive ? AppColors.error : AppColors.primary,
              ),
              const SizedBox(width: 8),
            ],
            Expanded(child: Text(title)),
          ],
        ),
        content: Text(
          message,
          style: const TextStyle(height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(
              cancelText,
              style: const TextStyle(color: AppColors.textSecondaryLight),
            ),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor:
                  isDestructive ? AppColors.error : AppColors.primary,
              shape: const RoundedRectangleBorder(
                borderRadius: BorderRadius.all(AppRadius.sm),
              ),
            ),
            child: Text(confirmText, style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
    return result ?? false;
  }
}
