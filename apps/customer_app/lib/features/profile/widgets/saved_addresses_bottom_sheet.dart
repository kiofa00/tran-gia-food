import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/auth_provider.dart';
import '../../address/providers/address_provider.dart';
import '../../address/widgets/add_edit_address_sheet.dart';
import '../../address/widgets/guest_location_picker_sheet.dart';

class SavedAddressesBottomSheet extends ConsumerWidget {
  const SavedAddressesBottomSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const SavedAddressesBottomSheet(),
    );
  }

  IconData _getIconForTitle(String title) {
    final lower = title.toLowerCase();
    if (lower.contains('nhà') || lower.contains('home')) {
      return Iconsax.home;
    } else if (lower.contains('công ty') || lower.contains('work') || lower.contains('văn phòng')) {
      return Iconsax.buildings_2;
    }
    return Iconsax.location;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final altColor = isDark ? AppColors.surfaceAltDark : AppColors.surfaceAltLight;
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final secColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    final authState = ref.watch(authStateProvider);
    final addressesAsync = ref.watch(addressListProvider);
    final selectedAddress = ref.watch(selectedAddressProvider);

    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: const BorderRadius.vertical(top: AppRadius.lg),
      ),
      child: Column(
        children: [
          // Header Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                const Icon(Iconsax.location5, color: AppColors.primary),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Địa Chỉ Đã Lưu',
                    style: TextStyle(
                      fontSize: AppFontSize.lg,
                      fontWeight: AppFontWeight.bold,
                      color: textColor,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Address List Content
          Expanded(
            child: !authState.isAuthenticated
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Iconsax.profile_circle,
                              size: 44,
                              color: AppColors.primary,
                            ),
                          ),
                          const SizedBox(height: 18),
                          Text(
                            'Chế Độ Khách',
                            style: TextStyle(
                              fontSize: AppFontSize.lg,
                              fontWeight: AppFontWeight.bold,
                              color: textColor,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Bạn đang duyệt món ăn với tư cách Khách. Đăng nhập để lưu địa chỉ cố định vào danh bạ và đồng bộ trên mọi thiết bị.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: AppFontSize.sm,
                              color: secColor,
                              height: 1.4,
                            ),
                          ),
                          const SizedBox(height: 24),
                          SizedBox(
                            width: double.infinity,
                            child: AppButton(
                              text: 'Đăng nhập ngay',
                              icon: Iconsax.login,
                              onPressed: () {
                                Navigator.of(context).pop();
                                context.push('/auth');
                              },
                            ),
                          ),
                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            child: OutlinedButton.icon(
                              icon: const Icon(Iconsax.location, size: 18),
                              label: const Text('Chọn vị trí xem món ăn xung quanh'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: AppColors.primary,
                                side: const BorderSide(color: AppColors.primary),
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                shape: const RoundedRectangleBorder(
                                  borderRadius: BorderRadius.all(AppRadius.md),
                                ),
                              ),
                              onPressed: () {
                                Navigator.of(context).pop();
                                GuestLocationPickerSheet.show(context);
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                : addressesAsync.when(
                    loading: () => const Center(
                      child: CircularProgressIndicator(),
                    ),
                    error: (err, _) => Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Iconsax.danger, size: 48, color: AppColors.error),
                            const SizedBox(height: 12),
                            Text(
                              'Không thể tải danh sách địa chỉ: $err',
                              textAlign: TextAlign.center,
                              style: const TextStyle(fontSize: AppFontSize.sm),
                            ),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              onPressed: () => ref.read(addressListProvider.notifier).refresh(),
                              child: const Text('Thử lại'),
                            ),
                          ],
                        ),
                      ),
                    ),
                    data: (addresses) {
                      if (addresses.isEmpty) {
                        return Center(
                          child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Iconsax.location_slash,
                              size: 48,
                              color: AppColors.primary,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Bạn chưa lưu địa chỉ nào',
                            style: TextStyle(
                              fontSize: AppFontSize.md,
                              fontWeight: AppFontWeight.bold,
                              color: textColor,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Thêm địa chỉ giao hàng để đặt món nhanh chóng hơn',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: AppFontSize.xs,
                              color: secColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: addresses.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 12),
                  itemBuilder: (ctx, idx) {
                    final item = addresses[idx];
                    final isSelected = selectedAddress?.id == item.id;

                    return Container(
                      decoration: BoxDecoration(
                        color: altColor,
                        borderRadius: const BorderRadius.all(AppRadius.md),
                        border: Border.all(
                          color: isSelected
                              ? AppColors.primary
                              : Colors.transparent,
                          width: 1.5,
                        ),
                      ),
                      child: InkWell(
                        borderRadius: const BorderRadius.all(AppRadius.md),
                        onTap: () {
                          ref.read(selectedAddressProvider.notifier).select(item);
                          Navigator.pop(context);
                        },
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withValues(alpha: 0.1),
                                  borderRadius: const BorderRadius.all(AppRadius.sm),
                                ),
                                child: Icon(
                                  _getIconForTitle(item.title),
                                  color: AppColors.primary,
                                  size: 20,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(
                                          item.title,
                                          style: TextStyle(
                                            fontWeight: AppFontWeight.bold,
                                            fontSize: AppFontSize.base,
                                            color: textColor,
                                          ),
                                        ),
                                        if (item.isDefault) ...[
                                          const SizedBox(width: 8),
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 6,
                                              vertical: 2,
                                            ),
                                            decoration: BoxDecoration(
                                              color: AppColors.primary.withValues(alpha: 0.15),
                                              borderRadius: const BorderRadius.all(AppRadius.xs),
                                            ),
                                            child: const Text(
                                              'Mặc định',
                                              style: TextStyle(
                                                fontSize: AppFontSize.xs,
                                                fontWeight: AppFontWeight.bold,
                                                color: AppColors.primary,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    if (item.recipientName != null || item.phone != null) ...[
                                      Text(
                                        '${item.recipientName ?? ''} ${item.phone != null ? '• ${item.phone}' : ''}'
                                            .trim(),
                                        style: TextStyle(
                                          fontSize: AppFontSize.xs,
                                          fontWeight: AppFontWeight.medium,
                                          color: secColor,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                    ],
                                    Text(
                                      item.fullAddress,
                                      style: TextStyle(
                                        fontSize: AppFontSize.sm,
                                        color: secColor,
                                      ),
                                    ),
                                    if (item.deliveryNote != null &&
                                        item.deliveryNote!.isNotEmpty) ...[
                                      const SizedBox(height: 4),
                                      Text(
                                        'Ghi chú: ${item.deliveryNote}',
                                        style: const TextStyle(
                                          fontSize: AppFontSize.xs,
                                          fontStyle: FontStyle.italic,
                                          color: AppColors.textHintLight,
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                              PopupMenuButton<String>(
                                icon: const Icon(Icons.more_vert, size: 20),
                                onSelected: (action) async {
                                  if (action == 'edit') {
                                    await AddEditAddressSheet.show(
                                      context,
                                      initialAddress: item,
                                    );
                                  } else if (action == 'default') {
                                    await ref
                                        .read(addressListProvider.notifier)
                                        .setDefaultAddress(item.id);
                                  } else if (action == 'delete') {
                                    final confirmed = await showDialog<bool>(
                                      context: context,
                                      builder: (dCtx) => AlertDialog(
                                        title: const Text('Xác nhận xóa'),
                                        content: Text('Bạn có chắc muốn xóa địa chỉ "${item.title}"?'),
                                        actions: [
                                          TextButton(
                                            onPressed: () => Navigator.pop(dCtx, false),
                                            child: const Text('Hủy'),
                                          ),
                                          TextButton(
                                            onPressed: () => Navigator.pop(dCtx, true),
                                            child: const Text(
                                              'Xóa',
                                              style: TextStyle(color: AppColors.error),
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                    if (confirmed == true) {
                                      await ref
                                          .read(addressListProvider.notifier)
                                          .deleteAddress(item.id);
                                    }
                                  }
                                },
                                itemBuilder: (ctx) => [
                                  const PopupMenuItem(
                                    value: 'edit',
                                    child: Row(
                                      children: [
                                        Icon(Iconsax.edit, size: 16),
                                        SizedBox(width: 8),
                                        Text('Chỉnh sửa'),
                                      ],
                                    ),
                                  ),
                                  if (!item.isDefault)
                                    const PopupMenuItem(
                                      value: 'default',
                                      child: Row(
                                        children: [
                                          Icon(Iconsax.star, size: 16),
                                          SizedBox(width: 8),
                                          Text('Đặt làm mặc định'),
                                        ],
                                      ),
                                    ),
                                  const PopupMenuItem(
                                    value: 'delete',
                                    child: Row(
                                      children: [
                                        Icon(Iconsax.trash, size: 16, color: AppColors.error),
                                        SizedBox(width: 8),
                                        Text(
                                          'Xóa',
                                          style: TextStyle(color: AppColors.error),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),

          // Bottom Action Button (chỉ hiển thị khi đã đăng nhập)
          if (authState.isAuthenticated)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: surfaceColor,
                border: Border(top: BorderSide(color: altColor)),
              ),
              child: SizedBox(
                width: double.infinity,
                child: AppButton(
                  text: '+ Thêm Địa Chỉ Mới',
                  icon: Iconsax.add,
                  onPressed: () async {
                    await AddEditAddressSheet.show(context);
                  },
                ),
              ),
            ),
        ],
      ),
    );
  }
}
