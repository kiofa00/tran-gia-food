import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

import '../../../core/providers/api_client_provider.dart';
import '../main/main_shell.dart';
import 'profile_provider.dart';
import 'widgets/help_center_bottom_sheet.dart';
import 'widgets/profile_menu_section.dart';
import 'widgets/rate_app_dialog.dart';
import 'widgets/saved_addresses_bottom_sheet.dart';
import 'widgets/settings_bottom_sheet.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(myProfileProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Tài Khoản',
          style: TextStyle(fontWeight: AppFontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Iconsax.setting_2),
            tooltip: 'Cài đặt',
            onPressed: () => SettingsBottomSheet.show(context),
          ),
        ],
      ),
      body: profileAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => AppEmptyState(
          icon: Iconsax.warning_2,
          iconColor: AppColors.error,
          title: 'Không thể tải thông tin',
          description: e.toString(),
          actionText: 'Tải lại',
          actionIcon: Icons.refresh_rounded,
          onAction: () => ref.invalidate(myProfileProvider),
        ),
        data: (profile) => _ProfileBody(profile: profile),
      ),
    );
  }
}

class _ProfileBody extends ConsumerWidget {
  final Map<String, dynamic>? profile;

  const _ProfileBody({required this.profile});

  void _requireAuth(BuildContext context, String actionText, VoidCallback onLoggedIn) {
    if (profile != null) {
      onLoggedIn();
    } else {
      AppDialogs.showLoginPrompt(
        context,
        actionText: actionText,
        onLogin: () => context.push('/auth'),
      );
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLoggedIn = profile != null;
    final name = profile?['name'] as String? ?? 'Khách';
    final phone = profile?['phone'] as String? ?? '';
    final email = profile?['email'] as String? ?? '';
    final avatarUrl = profile?['avatarUrl'] as String?;

    return ListView(
      children: [
        // Avatar & Name header
        Container(
          padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 20),
          decoration: const BoxDecoration(
            gradient: AppGradients.orangeGradient,
          ),
          child: Row(
            children: [
              CircleAvatar(
                radius: 36,
                backgroundColor: Colors.white,
                backgroundImage:
                    avatarUrl != null ? NetworkImage(avatarUrl) : null,
                child: avatarUrl == null
                    ? Text(
                        isLoggedIn && name.isNotEmpty
                            ? name[0].toUpperCase()
                            : 'K',
                        style: const TextStyle(
                          fontSize: AppFontSize.xl,
                          fontWeight: AppFontWeight.bold,
                          color: AppColors.primary,
                        ),
                      )
                    : null,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isLoggedIn ? name : 'Chào mừng quý khách 👋',
                      style: const TextStyle(
                        fontSize: AppFontSize.xl,
                        fontWeight: AppFontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      isLoggedIn
                          ? (phone.isNotEmpty ? phone : email)
                          : 'Đăng nhập để nhận ngập tràn ưu đãi',
                      style: const TextStyle(
                        fontSize: AppFontSize.body,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
              ),
              if (!isLoggedIn)
                ElevatedButton(
                  onPressed: () => context.push('/auth'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 8,
                    ),
                  ),
                  child: const Text(
                    'Đăng nhập',
                    style: TextStyle(fontWeight: AppFontWeight.bold),
                  ),
                )
              else
                IconButton(
                  icon: const Icon(Iconsax.edit, color: Colors.white),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text(
                          'Chức năng chỉnh sửa thông tin cá nhân đang cập nhật',
                        ),
                        backgroundColor: AppColors.info,
                      ),
                    );
                  },
                ),
            ],
          ),
        ),

        const SizedBox(height: 8),

        // Menu Sections
        ProfileMenuSection(
          title: 'Đơn Hàng & Địa Chỉ',
          items: [
            ProfileMenuItem(
              icon: Iconsax.receipt_item,
              label: 'Lịch Sử Đơn Hàng',
              onTap: () => _requireAuth(
                context,
                'xem lịch sử đơn hàng',
                () => ref.read(mainTabProvider.notifier).setTab(1),
              ),
            ),
            ProfileMenuItem(
              icon: Iconsax.location5,
              label: 'Địa Chỉ Đã Lưu',
              showDivider: false,
              onTap: () => _requireAuth(
                context,
                'quản lý địa chỉ giao nhận',
                () => SavedAddressesBottomSheet.show(context),
              ),
            ),
          ],
        ),

        ProfileMenuSection(
          title: 'Thanh Toán',
          items: [
            ProfileMenuItem(
              icon: Iconsax.wallet_3,
              label: 'Phương Thức Thanh Toán & Ví',
              onTap: () => _requireAuth(
                context,
                'quản lý ví tiền và thanh toán',
                () => context.push('/wallet'),
              ),
            ),
            ProfileMenuItem(
              icon: Iconsax.receipt_2,
              label: 'Lịch Sử Giao Dịch',
              showDivider: false,
              onTap: () => _requireAuth(
                context,
                'xem lịch sử nạp/rút và thanh toán',
                () => context.push('/wallet'),
              ),
            ),
          ],
        ),

        ProfileMenuSection(
          title: 'Hỗ Trợ & Đóng Góp',
          items: [
            ProfileMenuItem(
              icon: Iconsax.message_question,
              label: 'Trung Tâm Hỗ Trợ (FAQs)',
              onTap: () => HelpCenterBottomSheet.show(context),
            ),
            ProfileMenuItem(
              icon: Iconsax.star,
              label: 'Đánh Giá Ứng Dụng',
              showDivider: false,
              onTap: () => RateAppDialog.show(context),
            ),
          ],
        ),

        const SizedBox(height: 16),

        // Auth action button
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: isLoggedIn
              ? OutlinedButton.icon(
                  icon: const Icon(Iconsax.logout, color: AppColors.error),
                  label: const Text(
                    'Đăng Xuất',
                    style: TextStyle(
                      color: AppColors.error,
                      fontWeight: AppFontWeight.bold,
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.error),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  onPressed: () async {
                    final confirm = await AppDialogs.showConfirm(
                      context,
                      title: 'Đăng xuất tài khoản?',
                      message: 'Bạn có chắc chắn muốn đăng xuất khỏi Tran Gia Food không?',
                      confirmText: 'Đăng xuất',
                      isDestructive: true,
                      icon: Iconsax.logout,
                    );
                    if (!confirm) return;

                    final api = ref.read(apiClientProvider);
                    await api.clearToken();
                    ref.invalidate(myProfileProvider);
                    if (context.mounted) context.go('/auth');
                  },
                )
              : ElevatedButton.icon(
                  icon: const Icon(Iconsax.login),
                  label: const Text('Đăng Nhập / Đăng Ký'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  onPressed: () => context.push('/auth'),
                ),
        ),

        const SizedBox(height: 32),
      ],
    );
  }
}
