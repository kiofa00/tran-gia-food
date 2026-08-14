import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final myProfileProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  return api.get('/users/me');
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(myProfileProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tài Khoản', style: TextStyle(fontWeight: AppFontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Iconsax.setting_2),
            onPressed: () {},
          ),
        ],
      ),
      body: profileAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _buildError(e.toString()),
        data: (profile) => _ProfileBody(profile: profile),
      ),
    );
  }

  Widget _buildError(String msg) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Iconsax.warning_2, size: 48, color: AppColors.error),
            const SizedBox(height: 12),
            const Text('Không thể tải thông tin'),
            const SizedBox(height: 8),
            Text(msg, style: const TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight), textAlign: TextAlign.center),
          ],
        ),
      );
}

class _ProfileBody extends ConsumerWidget {
  final Map<String, dynamic> profile;

  const _ProfileBody({required this.profile});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final name = profile['name'] as String? ?? 'Người dùng';
    final phone = profile['phone'] as String? ?? '';
    final email = profile['email'] as String? ?? '';
    final avatarUrl = profile['avatarUrl'] as String?;

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
                backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
                child: avatarUrl == null
                    ? Text(
                        name.isNotEmpty ? name[0].toUpperCase() : 'U',
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
                      name,
                      style: const TextStyle(
                        fontSize: AppFontSize.xl,
                        fontWeight: AppFontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      phone.isNotEmpty ? phone : email,
                      style: const TextStyle(
                        fontSize: AppFontSize.body,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Iconsax.edit, color: Colors.white),
                onPressed: () {},
              ),
            ],
          ),
        ),

        const SizedBox(height: 8),

        // Menu items
        _MenuSection(
          title: 'Đơn Hàng & Địa Chỉ',
          items: [
            _MenuItem(icon: Iconsax.receipt_item, label: 'Lịch Sử Đơn Hàng', onTap: () {}),
            _MenuItem(icon: Iconsax.location5, label: 'Địa Chỉ Đã Lưu', onTap: () {}),
          ],
        ),

        _MenuSection(
          title: 'Thanh Toán',
          items: [
            _MenuItem(icon: Iconsax.wallet_3, label: 'Phương Thức Thanh Toán', onTap: () {}),
            _MenuItem(icon: Iconsax.receipt_2, label: 'Lịch Sử Giao Dịch', onTap: () {}),
          ],
        ),

        _MenuSection(
          title: 'Hỗ Trợ',
          items: [
            _MenuItem(icon: Iconsax.message_question, label: 'Trung Tâm Hỗ Trợ', onTap: () {}),
            _MenuItem(icon: Iconsax.star, label: 'Đánh Giá Ứng Dụng', onTap: () {}),
          ],
        ),

        const SizedBox(height: 12),

        // Logout button
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: OutlinedButton.icon(
            icon: const Icon(Iconsax.logout, color: AppColors.error),
            label: const Text('Đăng Xuất', style: TextStyle(color: AppColors.error, fontWeight: AppFontWeight.bold)),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AppColors.error),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            onPressed: () async {
              final api = ref.read(apiClientProvider);
              await api.clearToken();
              if (context.mounted) context.go('/auth');
            },
          ),
        ),

        const SizedBox(height: 32),
      ],
    );
  }
}

class _MenuSection extends StatelessWidget {
  final String title;
  final List<_MenuItem> items;

  const _MenuSection({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text(
            title,
            style: const TextStyle(
              fontSize: AppFontSize.sm,
              fontWeight: AppFontWeight.bold,
              color: AppColors.textSecondaryLight,
            ),
          ),
        ),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          decoration: const BoxDecoration(
            color: AppColors.surfaceLight,
            borderRadius: BorderRadius.all(AppRadius.md),
            boxShadow: AppShadows.sm,
          ),
          child: Column(
            children: items.map((item) {
              final isLast = items.last == item;
              return Column(
                children: [
                  item,
                  if (!isLast) const Divider(height: 1, indent: 52),
                ],
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _MenuItem({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primary),
      title: Text(label, style: const TextStyle(fontWeight: AppFontWeight.medium)),
      trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.textSecondaryLight),
      onTap: onTap,
    );
  }
}
