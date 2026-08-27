import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../notifications/notification_screen.dart';
import '../../../core/providers/location_provider.dart';

class HomeLocationHeader extends ConsumerWidget {
  final String? customAddress;
  final VoidCallback? onAddressTap;

  const HomeLocationHeader({
    super.key,
    this.customAddress,
    this.onAddressTap,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unreadAsync = ref.watch(unreadCountProvider);
    final locationAsync = ref.watch(userLocationProvider);

    final String displayAddress = customAddress ??
        locationAsync.when<String>(
          data: (pos) => pos != null
              ? 'Vị trí hiện tại (${pos.latitude.toStringAsFixed(3)}, ${pos.longitude.toStringAsFixed(3)})'
              : 'Chưa xác định vị trí GPS',
          loading: () => 'Đang tìm vị trí của bạn...',
          error: (_, _) => '123 Nguyễn Trãi, Q5, TP.HCM',
        );

    return Row(
      children: [
        const Icon(Iconsax.location5, color: AppColors.primary, size: 22),
        const SizedBox(width: 8),
        Expanded(
          child: InkWell(
            onTap: onAddressTap ?? () => ref.invalidate(userLocationProvider),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Giao đến địa chỉ',
                  style: TextStyle(
                    fontSize: AppFontSize.xs,
                    color: AppColors.textSecondaryLight,
                  ),
                ),
                Text(
                  displayAddress,
                  style: const TextStyle(
                    fontSize: AppFontSize.md,
                    fontWeight: AppFontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ),
        IconButton(
          icon: Stack(
            clipBehavior: Clip.none,
            children: [
              const Icon(Iconsax.notification),
              unreadAsync.maybeWhen(
                data: (count) => count > 0
                    ? Positioned(
                        top: -2,
                        right: -2,
                        child: Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: AppColors.error,
                            shape: BoxShape.circle,
                          ),
                        ),
                      )
                    : const SizedBox.shrink(),
                orElse: () => const SizedBox.shrink(),
              ),
            ],
          ),
          tooltip: 'Thông báo',
          onPressed: () => context.push('/notifications'),
        ),
      ],
    );
  }
}
