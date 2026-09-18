import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../address/providers/address_provider.dart';
import '../../address/widgets/guest_location_picker_sheet.dart';
import '../../notifications/notification_screen.dart';
import '../../profile/widgets/saved_addresses_bottom_sheet.dart';
import '../../../core/providers/auth_provider.dart';
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
    final selectedAddress = ref.watch(selectedAddressProvider);
    final userAddressAsync = ref.watch(userAddressDisplayNameProvider);
    final authState = ref.watch(authStateProvider);

    final String displayAddress = customAddress ??
        (selectedAddress != null
            ? selectedAddress.fullAddress
            : userAddressAsync.when<String>(
                data: (addr) => addr,
                loading: () => 'Đang tìm vị trí...',
                error: (_, _) => 'Chọn địa chỉ giao hàng',
              ));

    return Row(
      children: [
        Expanded(
          child: InkWell(
            borderRadius: const BorderRadius.all(AppRadius.md),
            onTap: onAddressTap ??
                () {
                  if (authState.isAuthenticated) {
                    SavedAddressesBottomSheet.show(context);
                  } else {
                    GuestLocationPickerSheet.show(context);
                  }
                },
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                children: [
                  const Icon(Iconsax.location5, color: AppColors.primary, size: 22),
                  const SizedBox(width: 8),
                  Expanded(
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
                ],
              ),
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
