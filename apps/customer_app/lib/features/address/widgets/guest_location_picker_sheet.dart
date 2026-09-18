import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

import '../../../core/providers/location_provider.dart';
import '../../../core/services/location_service.dart';
import '../models/address_model.dart';
import '../providers/address_provider.dart';
import 'address_map_picker_sheet.dart';
import 'administrative_selector_sheet.dart';

/// BottomSheet chọn vị trí nhanh cho người dùng Khách (chưa đăng nhập).
/// Cho phép chọn vị trí tạm thời để xem các quán ăn & món ngon xung quanh
/// mà không gọi protected API hay lưu trữ dữ liệu vào database.
class GuestLocationPickerSheet extends ConsumerStatefulWidget {
  const GuestLocationPickerSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const GuestLocationPickerSheet(),
    );
  }

  @override
  ConsumerState<GuestLocationPickerSheet> createState() =>
      _GuestLocationPickerSheetState();
}

class _GuestLocationPickerSheetState
    extends ConsumerState<GuestLocationPickerSheet> {
  bool _isLocatingGps = false;

  Future<void> _handleUseCurrentGps() async {
    setState(() => _isLocatingGps = true);
    try {
      final pos = await LocationService.getCurrentPosition()
          .timeout(const Duration(seconds: 8), onTimeout: () => null);

      if (!mounted) return;

      if (pos == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Không thể xác định vị trí GPS. Vui lòng cấp quyền vị trí hoặc chọn trên bản đồ.',
            ),
            backgroundColor: AppColors.error,
          ),
        );
        return;
      }

      // Reverse geocode qua backend proxy (public, không cần auth)
      final geoClient = ref.read(geocodingServiceProvider);
      final geoInfo = await geoClient.reverse(pos.latitude, pos.longitude);

      if (!mounted) return;

      final street = (geoInfo?['street'] ?? geoInfo?['road'] ?? '') as String;
      final ward = (geoInfo?['ward'] ?? '') as String;
      final district = (geoInfo?['district'] ?? '') as String;
      final city = (geoInfo?['city'] ?? '') as String;

      final fullAddr = (geoInfo?['fullAddress'] ??
              geoInfo?['displayName'] ??
              [street, ward, district, city].where((s) => s.isNotEmpty).join(', '))
          as String;

      final resolvedFull =
          fullAddr.isNotEmpty ? fullAddr : 'Vị trí hiện tại của bạn';

      final resolvedTitle = street.isNotEmpty
          ? street
          : (ward.isNotEmpty && district.isNotEmpty)
              ? '$ward, $district'
              : (ward.isNotEmpty ? ward : 'Vị trí hiện tại');

      final tempItem = AddressItem(
        id: 'guest_gps_${DateTime.now().millisecondsSinceEpoch}',
        title: resolvedTitle,
        street: street,
        ward: ward,
        district: district,
        city: city,
        fullAddress: resolvedFull,
        lat: pos.latitude,
        lng: pos.longitude,
        isDefault: false,
      );

      // Cập nhật state in-memory để Homepage tải quán ăn xung quanh
      ref.read(selectedAddressProvider.notifier).select(tempItem);

      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Đã chọn: ${tempItem.fullAddress}'),
          backgroundColor: AppColors.success,
          duration: const Duration(seconds: 2),
        ),
      );
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Có lỗi khi lấy vị trí GPS. Vui lòng thử lại.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLocatingGps = false);
      }
    }
  }

  Future<void> _handlePickFromMap() async {
    final currentSelected = ref.read(selectedAddressProvider);
    final result = await AddressMapPickerSheet.show(
      context,
      initialLat: currentSelected?.lat,
      initialLng: currentSelected?.lng,
    );

    if (!mounted || result == null) return;

    final resolvedTitle = result.street.isNotEmpty
        ? result.street
        : (result.ward.isNotEmpty && result.district.isNotEmpty)
            ? '${result.ward}, ${result.district}'
            : (result.ward.isNotEmpty ? result.ward : 'Vị trí trên bản đồ');

    final tempItem = AddressItem(
      id: 'guest_map_${DateTime.now().millisecondsSinceEpoch}',
      title: resolvedTitle,
      street: result.street,
      ward: result.ward,
      district: result.district,
      city: result.city,
      fullAddress: result.fullAddress,
      lat: result.lat,
      lng: result.lng,
      isDefault: false,
    );

    ref.read(selectedAddressProvider.notifier).select(tempItem);
    Navigator.of(context).pop();

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Đã cập nhật vị trí xem quán ăn xung quanh'),
        backgroundColor: AppColors.success,
        duration: Duration(seconds: 2),
      ),
    );
  }

  Future<void> _handlePickAdministrative() async {
    final currentSelected = ref.read(selectedAddressProvider);
    final result = await AdministrativeSelectorSheet.show(
      context,
      initialProvince: currentSelected?.city,
      initialDistrict: currentSelected?.district,
      initialWard: currentSelected?.ward,
    );

    if (!mounted || result == null) return;

    final query =
        '${result.ward.name}, ${result.district.name}, ${result.province.name}';
    double? lat;
    double? lng;

    try {
      final geo = ref.read(geocodingServiceProvider);
      final searchResults = await geo.search(query);
      if (searchResults.isNotEmpty) {
        final first = searchResults.first;
        lat = double.tryParse(first['lat']?.toString() ?? '');
        lng = double.tryParse(
          first['lon']?.toString() ?? first['lng']?.toString() ?? '',
        );
      }
    } catch (_) {}

    final devicePos = ref.read(userLocationProvider).asData?.value;
    final double resolvedLat =
        lat ?? currentSelected?.lat ?? devicePos?.latitude ?? 10.7769;
    final double resolvedLng =
        lng ?? currentSelected?.lng ?? devicePos?.longitude ?? 106.7009;

    if (!mounted) return;

    final tempItem = AddressItem(
      id: 'guest_admin_${DateTime.now().millisecondsSinceEpoch}',
      title: '${result.ward.name}, ${result.district.name}',
      street: '',
      ward: result.ward.name,
      district: result.district.name,
      city: result.province.name,
      fullAddress: query,
      lat: resolvedLat,
      lng: resolvedLng,
      isDefault: false,
    );

    ref.read(selectedAddressProvider.notifier).select(tempItem);
    Navigator.of(context).pop();

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Đã cập nhật khu vực xem quán ăn'),
        backgroundColor: AppColors.success,
        duration: Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor =
        isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final altColor =
        isDark ? AppColors.surfaceAltDark : AppColors.surfaceAltLight;
    final textColor =
        isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final secColor =
        isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final selectedAddress = ref.watch(selectedAddressProvider);

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: const BorderRadius.vertical(top: AppRadius.lg),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag Handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: secColor.withValues(alpha: 0.3),
                borderRadius: const BorderRadius.all(AppRadius.full),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
            child: Row(
              children: [
                const Icon(Iconsax.location5, color: AppColors.primary, size: 22),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Chọn Khu Vực Giao Hàng',
                        style: TextStyle(
                          fontSize: AppFontSize.lg,
                          fontWeight: AppFontWeight.bold,
                          color: textColor,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Xem các quán ăn và món ngon ở gần bạn',
                        style: TextStyle(
                          fontSize: AppFontSize.xs,
                          color: secColor,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  tooltip: 'Đóng',
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Body Content
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Currently selected badge if any
                  if (selectedAddress != null) ...[
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.08),
                        borderRadius: const BorderRadius.all(AppRadius.md),
                        border: Border.all(
                          color: AppColors.primary.withValues(alpha: 0.3),
                        ),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Iconsax.tick_circle5,
                            color: AppColors.primary,
                            size: 20,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Vị trí đang chọn xem món:',
                                  style: TextStyle(
                                    fontSize: AppFontSize.xs,
                                    fontWeight: AppFontWeight.medium,
                                    color: AppColors.primary,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  selectedAddress.fullAddress,
                                  style: TextStyle(
                                    fontSize: AppFontSize.sm,
                                    fontWeight: AppFontWeight.bold,
                                    color: textColor,
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),
                  ],

                  Text(
                    'CÁCH CHỌN VỊ TRÍ',
                    style: TextStyle(
                      fontSize: AppFontSize.xs,
                      fontWeight: AppFontWeight.bold,
                      letterSpacing: 0.5,
                      color: secColor,
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Option 1: Current GPS
                  _OptionTile(
                    icon: Iconsax.gps5,
                    iconBgColor: AppColors.success.withValues(alpha: 0.12),
                    iconColor: AppColors.success,
                    title: 'Vị trí hiện tại của tôi',
                    subtitle: 'Tự động định vị nhanh qua GPS thiết bị',
                    isLoading: _isLocatingGps,
                    onTap: _isLocatingGps ? null : _handleUseCurrentGps,
                  ),
                  const SizedBox(height: 12),

                  // Option 2: Interactive Map
                  _OptionTile(
                    icon: Iconsax.map_1,
                    iconBgColor: AppColors.primary.withValues(alpha: 0.12),
                    iconColor: AppColors.primary,
                    title: 'Chọn điểm trên Bản Đồ',
                    subtitle: 'Ghim vị trí trực quan trên bản đồ OpenStreetMap',
                    onTap: _handlePickFromMap,
                  ),
                  const SizedBox(height: 12),

                  // Option 3: Administrative District / Ward
                  _OptionTile(
                    icon: Iconsax.building_3,
                    iconBgColor: AppColors.info.withValues(alpha: 0.12),
                    iconColor: AppColors.info,
                    title: 'Chọn theo Quận / Phường',
                    subtitle: 'Tìm kiếm theo Tỉnh/Thành, Quận/Huyện, Phường/Xã',
                    onTap: _handlePickAdministrative,
                  ),

                  const SizedBox(height: 24),

                  // Login CTA Card for Guest
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: altColor,
                      borderRadius: const BorderRadius.all(AppRadius.md),
                      border: Border.all(
                        color: secColor.withValues(alpha: 0.15),
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: surfaceColor,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Iconsax.user_tag,
                            color: AppColors.primary,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Lưu danh bạ địa chỉ',
                                style: TextStyle(
                                  fontSize: AppFontSize.sm,
                                  fontWeight: AppFontWeight.bold,
                                  color: textColor,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'Đăng nhập để lưu địa chỉ cố định và đặt món nhanh hơn',
                                style: TextStyle(
                                  fontSize: AppFontSize.xs,
                                  color: secColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          onPressed: () {
                            Navigator.of(context).pop();
                            context.push('/auth');
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 8,
                            ),
                            textStyle: const TextStyle(
                              fontSize: AppFontSize.xs,
                              fontWeight: AppFontWeight.bold,
                            ),
                            shape: const RoundedRectangleBorder(
                              borderRadius:
                                  BorderRadius.all(AppRadius.md),
                            ),
                          ),
                          child: const Text('Đăng nhập'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OptionTile extends StatelessWidget {
  final IconData icon;
  final Color iconBgColor;
  final Color iconColor;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;
  final bool isLoading;

  const _OptionTile({
    required this.icon,
    required this.iconBgColor,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    this.onTap,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceAlt =
        isDark ? AppColors.surfaceAltDark : AppColors.surfaceAltLight;
    final textColor =
        isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final secColor =
        isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    return Material(
      color: surfaceAlt,
      borderRadius: const BorderRadius.all(AppRadius.md),
      child: InkWell(
        onTap: onTap,
        borderRadius: const BorderRadius.all(AppRadius.md),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: iconBgColor,
                  borderRadius: const BorderRadius.all(AppRadius.md),
                ),
                child: isLoading
                    ? const Center(
                        child: SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor:
                                AlwaysStoppedAnimation(AppColors.primary),
                          ),
                        ),
                      )
                    : Icon(icon, color: iconColor, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: AppFontSize.md,
                        fontWeight: AppFontWeight.semiBold,
                        color: textColor,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: AppFontSize.xs,
                        color: secColor,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.arrow_forward_ios,
                size: 14,
                color: AppColors.textHintLight,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
