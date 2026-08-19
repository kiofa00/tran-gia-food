import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final shipperProfileProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  return api.get('/shippers/me');
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class ShipperProfileScreen extends ConsumerWidget {
  const ShipperProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(shipperProfileProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tài Khoản', style: TextStyle(fontWeight: AppFontWeight.bold)),
      ),
      body: profileAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (profile) => _ProfileBody(profile: profile),
      ),
    );
  }
}

class _ProfileBody extends ConsumerWidget {
  final Map<String, dynamic> profile;
  const _ProfileBody({required this.profile});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = profile['user'] as Map<String, dynamic>? ?? {};
    final name = user['name'] as String? ?? 'Tài xế';
    final phone = user['phone'] as String? ?? '';
    final avatarUrl = user['avatarUrl'] as String?;
    final avgRating = (profile['avgRating'] as num? ?? 0).toDouble();
    final totalDeliveries = profile['totalDeliveries'] as int? ?? 0;
    final vehicle = profile['vehiclePlate'] as String? ?? '';
    final penaltyLevel = profile['penaltyLevel'] as int? ?? 0;
    final kycStatus = profile['kycStatus'] as String? ?? 'PENDING';

    return ListView(
      children: [
        // Header
        Container(
          padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 20),
          decoration: const BoxDecoration(gradient: AppGradients.orangeGradient),
          child: Row(children: [
            CircleAvatar(
              radius: 36,
              backgroundColor: Colors.white,
              backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
              child: avatarUrl == null ? Text(name.isNotEmpty ? name[0].toUpperCase() : 'S', style: const TextStyle(fontSize: AppFontSize.xl, fontWeight: AppFontWeight.bold, color: AppColors.primary)) : null,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(name, style: const TextStyle(fontSize: AppFontSize.xl, fontWeight: AppFontWeight.bold, color: Colors.white)),
                const SizedBox(height: 4),
                Text(phone, style: const TextStyle(fontSize: AppFontSize.body, color: Colors.white70)),
                if (vehicle.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text('🏍️ $vehicle', style: const TextStyle(fontSize: AppFontSize.sm, color: Colors.white70)),
                ],
              ]),
            ),
          ]),
        ),

        // Stats
        Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(16),
          decoration: const BoxDecoration(color: AppColors.surfaceLight, borderRadius: BorderRadius.all(AppRadius.md), boxShadow: AppShadows.sm),
          child: Row(children: [
            Expanded(child: _StatItem(value: avgRating.toStringAsFixed(1), label: 'Đánh giá', icon: Iconsax.star5, color: AppColors.warning)),
            const VerticalDivider(),
            Expanded(child: _StatItem(value: '$totalDeliveries', label: 'Đơn đã giao', icon: Iconsax.truck_fast, color: AppColors.primary)),
            const VerticalDivider(),
            Expanded(child: _StatItem(value: _penaltyLabel(penaltyLevel), label: 'Mức phạt', icon: Iconsax.warning_2, color: penaltyLevel == 0 ? AppColors.success : AppColors.warning)),
          ]),
        ),

        // KYC status
        if (kycStatus != 'APPROVED')
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: kycStatus == 'PENDING' ? AppColors.warning.withValues(alpha: 0.1) : AppColors.error.withValues(alpha: 0.1),
              borderRadius: const BorderRadius.all(AppRadius.md),
              border: Border.all(color: kycStatus == 'PENDING' ? AppColors.warning : AppColors.error),
            ),
            child: Row(children: [
              Icon(Iconsax.document_text, color: kycStatus == 'PENDING' ? AppColors.warning : AppColors.error),
              const SizedBox(width: 10),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(kycStatus == 'PENDING' ? 'KYC Đang Chờ Duyệt' : 'KYC Bị Từ Chối', style: TextStyle(fontWeight: AppFontWeight.bold, color: kycStatus == 'PENDING' ? AppColors.warning : AppColors.error)),
                const Text('Cần xác minh danh tính để nhận đơn hàng', style: TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight)),
              ])),
              TextButton(onPressed: () {}, child: const Text('Xem')),
            ]),
          ),

        const SizedBox(height: 8),

        // Menu
        _MenuSection(title: 'Thông Tin Cá Nhân', items: [
          _MenuItem(icon: Iconsax.user_edit, label: 'Chỉnh Sửa Hồ Sơ', onTap: () {}),
          _MenuItem(icon: Iconsax.document_text, label: 'Hồ Sơ KYC / Xác Minh', onTap: () => context.push('/kyc')),
          _MenuItem(icon: Iconsax.car, label: 'Thông Tin Xe', onTap: () {}),
        ]),

        _MenuSection(title: 'Hiệu Suất', items: [
          _MenuItem(icon: Iconsax.chart_2, label: 'Thống Kê Của Tôi', onTap: () {}),
          _MenuItem(icon: Iconsax.star, label: 'Đánh Giá Nhận Được', onTap: () {}),
          _MenuItem(icon: Iconsax.warning_2, label: 'Lịch Sử Vi Phạm', onTap: () => context.push('/penalties')),
        ]),

        _MenuSection(title: 'Hỗ Trợ', items: [
          _MenuItem(icon: Iconsax.message_question, label: 'Liên Hệ Hỗ Trợ', onTap: () {}),
          _MenuItem(icon: Iconsax.info_circle, label: 'Điều Khoản & Chính Sách', onTap: () {}),
        ]),

        const SizedBox(height: 12),

        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: OutlinedButton.icon(
            icon: const Icon(Iconsax.logout, color: AppColors.error),
            label: const Text('Đăng Xuất', style: TextStyle(color: AppColors.error, fontWeight: AppFontWeight.bold)),
            style: OutlinedButton.styleFrom(side: const BorderSide(color: AppColors.error), padding: const EdgeInsets.symmetric(vertical: 14)),
            onPressed: () async {
              final api = ref.read(apiClientProvider);
              await api.clearToken();
              if (context.mounted) context.go('/login');
            },
          ),
        ),

        const SizedBox(height: 32),
      ],
    );
  }

  String _penaltyLabel(int level) => switch (level) {
    0 => 'Tốt',
    1 => 'Cảnh báo',
    2 => 'Hạ ưu tiên',
    _ => 'Bị khóa',
  };
}

class _StatItem extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;
  final Color color;
  const _StatItem({required this.value, required this.label, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Icon(icon, color: color, size: 22),
      const SizedBox(height: 6),
      Text(value, style: TextStyle(fontSize: AppFontSize.lg, fontWeight: AppFontWeight.extraBold, color: color)),
      Text(label, style: const TextStyle(fontSize: AppFontSize.xs, color: AppColors.textSecondaryLight), textAlign: TextAlign.center),
    ]);
  }
}

class _MenuSection extends StatelessWidget {
  final String title;
  final List<_MenuItem> items;
  const _MenuSection({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
        child: Text(title, style: const TextStyle(fontSize: AppFontSize.sm, fontWeight: AppFontWeight.bold, color: AppColors.textSecondaryLight)),
      ),
      Container(
        margin: const EdgeInsets.symmetric(horizontal: 16),
        decoration: const BoxDecoration(color: AppColors.surfaceLight, borderRadius: BorderRadius.all(AppRadius.md), boxShadow: AppShadows.sm),
        child: Column(children: items.map((item) {
          final isLast = items.last == item;
          return Column(children: [
            item,
            if (!isLast) const Divider(height: 1, indent: 52),
          ]);
        }).toList()),
      ),
    ]);
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
