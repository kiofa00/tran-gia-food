import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final restaurantProfileProvider =
    FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  return api.get('/restaurants/my');
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class RestaurantSettingsScreen extends ConsumerStatefulWidget {
  const RestaurantSettingsScreen({super.key});

  @override
  ConsumerState<RestaurantSettingsScreen> createState() =>
      _RestaurantSettingsScreenState();
}

class _RestaurantSettingsScreenState
    extends ConsumerState<RestaurantSettingsScreen> {
  bool _isUpdating = false;

  Future<void> _toggleManualOverride(bool currentIsOpen) async {
    setState(() => _isUpdating = true);
    try {
      final api = ref.read(apiClientProvider);
      await api.patch('/restaurants/my/toggle-open', {
        'isManualOverride': true,
        'isOpen': !currentIsOpen,
      });
      ref.invalidate(restaurantProfileProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(!currentIsOpen ? 'Quán đã mở cửa ✅' : 'Quán đã đóng cửa 🔴'),
            backgroundColor: !currentIsOpen ? AppColors.success : AppColors.error,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) setState(() => _isUpdating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final profileAsync = ref.watch(restaurantProfileProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cài Đặt Quán', style: TextStyle(fontWeight: AppFontWeight.bold)),
      ),
      body: profileAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Iconsax.warning_2, size: 48, color: AppColors.error),
              const SizedBox(height: 12),
              Text(e.toString(), textAlign: TextAlign.center),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                icon: const Icon(Iconsax.refresh),
                label: const Text('Thử lại'),
                onPressed: () => ref.invalidate(restaurantProfileProvider),
              ),
            ],
          ),
        ),
        data: (restaurant) => _SettingsBody(
          restaurant: restaurant,
          isUpdating: _isUpdating,
          onToggleOpen: () => _toggleManualOverride(restaurant['isOpen'] as bool? ?? false),
        ),
      ),
    );
  }
}

class _SettingsBody extends StatelessWidget {
  final Map<String, dynamic> restaurant;
  final bool isUpdating;
  final VoidCallback onToggleOpen;

  const _SettingsBody({
    required this.restaurant,
    required this.isUpdating,
    required this.onToggleOpen,
  });

  @override
  Widget build(BuildContext context) {
    final isOpen = restaurant['isOpen'] as bool? ?? false;
    final isManualOverride = restaurant['isManualOverride'] as bool? ?? false;
    final radiusKm = (restaurant['radiusKm'] as num? ?? 5).toDouble();
    final openingHours = restaurant['openingHours'] as Map<String, dynamic>? ?? {};

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Open/Close status card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isOpen
                ? AppColors.success.withValues(alpha: 0.1)
                : AppColors.error.withValues(alpha: 0.1),
            borderRadius: const BorderRadius.all(AppRadius.md),
            border: Border.all(
              color: isOpen ? AppColors.success : AppColors.error,
              width: 1.5,
            ),
          ),
          child: Row(
            children: [
              Icon(
                isOpen ? Iconsax.shop : Iconsax.shop_remove,
                color: isOpen ? AppColors.success : AppColors.error,
                size: 28,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isOpen ? 'Đang Mở Cửa' : 'Đang Đóng Cửa',
                      style: TextStyle(
                        fontWeight: AppFontWeight.bold,
                        fontSize: AppFontSize.title,
                        color: isOpen ? AppColors.success : AppColors.error,
                      ),
                    ),
                    Text(
                      isManualOverride ? 'Ghi đè thủ công' : 'Theo lịch tự động',
                      style: const TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight),
                    ),
                  ],
                ),
              ),
              isUpdating
                  ? const SizedBox(
                      width: 24, height: 24,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : ElevatedButton(
                      onPressed: onToggleOpen,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isOpen ? AppColors.error : AppColors.success,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      ),
                      child: Text(isOpen ? 'Đóng Cửa' : 'Mở Cửa'),
                    ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        // Delivery radius
        const Text('Bán Kính Giao Hàng', style: TextStyle(fontSize: AppFontSize.title, fontWeight: AppFontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Giới hạn khu vực nhận đơn của quán', style: TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight)),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: const BoxDecoration(
            color: AppColors.surfaceLight,
            borderRadius: BorderRadius.all(AppRadius.md),
            boxShadow: AppShadows.sm,
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Bán kính hiện tại', style: TextStyle(fontWeight: AppFontWeight.medium)),
                  Text(
                    '${radiusKm.toStringAsFixed(1)} km',
                    style: const TextStyle(color: AppColors.primary, fontWeight: AppFontWeight.extraBold, fontSize: AppFontSize.title),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Slider(
                value: radiusKm,
                min: 0.5,
                max: 10,
                divisions: 19,
                activeColor: AppColors.primary,
                label: '${radiusKm.toStringAsFixed(1)} km',
                onChanged: (_) {}, // read-only display — chỉnh qua PATCH
              ),
              const Text(
                'Kéo thanh để điều chỉnh bán kính (tối đa theo giới hạn hệ thống)',
                style: TextStyle(fontSize: AppFontSize.xs, color: AppColors.textSecondaryLight),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        // Opening hours
        const Text('Giờ Mở Cửa Tự Động', style: TextStyle(fontSize: AppFontSize.title, fontWeight: AppFontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Hệ thống tự động bật/tắt quán theo lịch này', style: TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight)),
        const SizedBox(height: 12),

        if (openingHours.isEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: AppColors.surfaceAltLight,
              borderRadius: BorderRadius.all(AppRadius.md),
            ),
            child: const Row(
              children: [
                Icon(Iconsax.info_circle, color: AppColors.warning),
                SizedBox(width: 8),
                Expanded(child: Text('Chưa cấu hình giờ mở cửa. Quán sẽ không tự động mở/đóng.')),
              ],
            ),
          )
        else
          ...['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) {
            final hours = openingHours[day] as Map<String, dynamic>?;
            final label = switch (day) {
              'mon' => 'Thứ Hai',
              'tue' => 'Thứ Ba',
              'wed' => 'Thứ Tư',
              'thu' => 'Thứ Năm',
              'fri' => 'Thứ Sáu',
              'sat' => 'Thứ Bảy',
              'sun' => 'Chủ Nhật',
              _ => day,
            };

            return Container(
              margin: const EdgeInsets.only(bottom: 6),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: const BoxDecoration(
                color: AppColors.surfaceLight,
                borderRadius: BorderRadius.all(AppRadius.md),
                boxShadow: AppShadows.sm,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(label, style: const TextStyle(fontWeight: AppFontWeight.medium)),
                  hours != null
                      ? Text(
                          '${hours['open']} - ${hours['close']}',
                          style: const TextStyle(color: AppColors.primary, fontWeight: AppFontWeight.bold),
                        )
                      : const Text('Đóng cửa', style: TextStyle(color: AppColors.error)),
                ],
              ),
            );
          }),

        const SizedBox(height: 24),

        // Quick nav buttons
        const Text('Quản Lý Nhanh', style: TextStyle(fontSize: AppFontSize.title, fontWeight: AppFontWeight.bold)),
        const SizedBox(height: 12),
        _QuickNavTile(
          icon: Iconsax.document_text,
          title: 'Hồ Sơ eKYC Đối Tác',
          subtitle: 'Xác minh CCCD & Giấy phép ATTP / ĐKKD',
          onTap: () => context.push('/kyc'),
        ),
        const SizedBox(height: 8),
        _QuickNavTile(
          icon: Iconsax.clock,
          title: 'Giờ Mở Cửa Chi Tiết',
          subtitle: 'Chỉnh lịch theo từng ngày trong tuần',
          onTap: () => context.push('/settings/opening-hours'),
        ),
        const SizedBox(height: 8),
        _QuickNavTile(
          icon: Iconsax.ticket_discount,
          title: 'Voucher Của Quán',
          subtitle: 'Tạo và quản lý mã giảm giá riêng',
          onTap: () => context.push('/vouchers'),
        ),
        const SizedBox(height: 24),

        OutlinedButton.icon(
          icon: const Icon(Iconsax.logout, color: AppColors.error),
          label: const Text('Đăng Xuất Tài Khoản Quán', style: TextStyle(color: AppColors.error, fontWeight: AppFontWeight.bold)),
          style: OutlinedButton.styleFrom(
            side: const BorderSide(color: AppColors.error),
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(AppRadius.sm)),
          ),
          onPressed: () {
            context.go('/login');
          },
        ),
        const SizedBox(height: 32),
      ],
    );
  }
}

class _QuickNavTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _QuickNavTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.all(AppRadius.md),
          border: Border.all(color: AppColors.dividerLight),
          boxShadow: AppShadows.sm,
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: const BorderRadius.all(AppRadius.sm),
              ),
              child: Icon(icon, color: AppColors.primary, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.base)),
                  Text(subtitle, style: const TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, size: 16, color: AppColors.textSecondaryLight),
          ],
        ),
      ),
    );
  }
}
