import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/services/location_service.dart';
import '../../profile/profile_provider.dart';
import '../models/address_model.dart';
import '../providers/address_provider.dart';
import 'address_map_picker_sheet.dart';
import 'administrative_selector_sheet.dart';

class AddEditAddressSheet extends ConsumerStatefulWidget {
  final AddressItem? initialAddress;

  const AddEditAddressSheet({
    super.key,
    this.initialAddress,
  });

  static Future<AddressItem?> show(
    BuildContext context, {
    AddressItem? initialAddress,
  }) {
    return showModalBottomSheet<AddressItem>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => AddEditAddressSheet(initialAddress: initialAddress),
    );
  }

  @override
  ConsumerState<AddEditAddressSheet> createState() =>
      _AddEditAddressSheetState();
}

class _AddEditAddressSheetState extends ConsumerState<AddEditAddressSheet> {
  final _formKey = GlobalKey<FormState>();

  late final TextEditingController _nameController;
  late final TextEditingController _phoneController;
  late final TextEditingController _streetController;
  late final TextEditingController _noteController;

  String _title = 'Nhà riêng';
  String _province = 'Thành phố Hồ Chí Minh';
  String _district = 'Quận 1';
  String _ward = 'Phường Bến Nghé';
  double _lat = 10.7769;
  double _lng = 106.7009;
  bool _isDefault = false;
  bool _isSaving = false;
  bool _isFetchingGps = false;

  final List<String> _quickTags = ['Nhà riêng', 'Công ty', 'Khác'];

  @override
  void initState() {
    super.initState();
    final addr = widget.initialAddress;

    _nameController = TextEditingController(text: addr?.recipientName ?? '');
    _phoneController = TextEditingController(text: addr?.phone ?? '');
    _streetController = TextEditingController(text: addr?.street ?? '');
    _noteController = TextEditingController(text: addr?.deliveryNote ?? '');

    if (addr != null) {
      _title = addr.title;
      _province = addr.city;
      _district = addr.district;
      _ward = addr.ward;
      _lat = addr.lat;
      _lng = addr.lng;
      _isDefault = addr.isDefault;
    } else {
      // Prefill user profile name and phone if available
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final profileAsync = ref.read(myProfileProvider);
        profileAsync.whenData((profile) {
          if (profile != null && mounted) {
            if (_nameController.text.isEmpty) {
              _nameController.text = profile['name'] as String? ?? '';
            }
            if (_phoneController.text.isEmpty) {
              _phoneController.text = profile['phone'] as String? ?? '';
            }
          }
        });
      });
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _streetController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  String _computeFullAddress() {
    final street = _streetController.text.trim();
    final parts = [
      if (street.isNotEmpty) street,
      if (_ward.isNotEmpty) _ward,
      if (_district.isNotEmpty) _district,
      if (_province.isNotEmpty) _province,
    ];
    return parts.join(', ');
  }

  Future<void> _openMapPicker() async {
    final res = await AddressMapPickerSheet.show(
      context,
      initialLat: _lat,
      initialLng: _lng,
    );
    if (res != null && mounted) {
      setState(() {
        _lat = res.lat;
        _lng = res.lng;
        if (res.street.isNotEmpty) _streetController.text = res.street;
        if (res.ward.isNotEmpty) _ward = res.ward;
        if (res.district.isNotEmpty) _district = res.district;
        if (res.city.isNotEmpty) _province = res.city;
      });
    }
  }

  Future<void> _pickCurrentGps() async {
    if (_isFetchingGps) return;
    setState(() => _isFetchingGps = true);

    final pos = await LocationService.getCurrentPosition();
    if (!mounted) return;

    if (pos == null) {
      setState(() => _isFetchingGps = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Không thể lấy vị trí GPS hiện tại. Vui lòng cấp quyền.'),
          backgroundColor: AppColors.warning,
        ),
      );
      return;
    }

    try {
      final geo = ref.read(geocodingServiceProvider);
      final res = await geo.reverse(pos.latitude, pos.longitude);
      if (mounted) {
        setState(() {
          _isFetchingGps = false;
          _lat = pos.latitude;
          _lng = pos.longitude;
          if (res != null) {
            final street = res['street'] as String? ?? res['road'] as String?;
            if (street != null && street.isNotEmpty) {
              _streetController.text = street;
            }
            if ((res['ward'] as String?)?.isNotEmpty ?? false) {
              _ward = res['ward'] as String;
            }
            if ((res['district'] as String?)?.isNotEmpty ?? false) {
              _district = res['district'] as String;
            }
            if ((res['city'] as String?)?.isNotEmpty ?? false) {
              _province = res['city'] as String;
            }
          }
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đã cập nhật vị trí từ GPS thành công!'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isFetchingGps = false);
      }
    }
  }

  Future<void> _openAdministrativeSelector() async {
    final res = await AdministrativeSelectorSheet.show(
      context,
      initialProvince: _province,
      initialDistrict: _district,
      initialWard: _ward,
    );
    if (res != null && mounted) {
      setState(() {
        _province = res.province.name;
        _district = res.district.name;
        _ward = res.ward.name;
      });
    }
  }

  Future<void> _onSave() async {
    if (!_formKey.currentState!.validate()) return;

    final fullAddress = _computeFullAddress();
    if (fullAddress.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng nhập địa chỉ đầy đủ'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() => _isSaving = true);

    final item = AddressItem(
      id: widget.initialAddress?.id ?? '',
      title: _title,
      recipientName: _nameController.text.trim().isNotEmpty
          ? _nameController.text.trim()
          : null,
      phone: _phoneController.text.trim().isNotEmpty
          ? _phoneController.text.trim()
          : null,
      street: _streetController.text.trim(),
      ward: _ward,
      district: _district,
      city: _province,
      fullAddress: fullAddress,
      lat: _lat,
      lng: _lng,
      isDefault: _isDefault,
      deliveryNote: _noteController.text.trim().isNotEmpty
          ? _noteController.text.trim()
          : null,
    );

    try {
      if (widget.initialAddress != null) {
        await ref.read(addressListProvider.notifier).updateAddress(item);
      } else {
        await ref.read(addressListProvider.notifier).addAddress(item);
      }

      if (mounted) {
        Navigator.pop(context, item);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              widget.initialAddress != null
                  ? 'Đã cập nhật địa chỉ thành công!'
                  : 'Đã thêm địa chỉ mới thành công!',
            ),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSaving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi khi lưu địa chỉ: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final altColor = isDark ? AppColors.surfaceAltDark : AppColors.surfaceAltLight;
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final secColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    return Container(
      height: MediaQuery.of(context).size.height * 0.88,
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: const BorderRadius.vertical(top: AppRadius.lg),
      ),
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                Icon(
                  widget.initialAddress != null ? Iconsax.edit : Iconsax.location_add,
                  color: AppColors.primary,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    widget.initialAddress != null
                        ? 'Chỉnh Sửa Địa Chỉ'
                        : 'Thêm Địa Chỉ Mới',
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

          // Body Form
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Quick Action Picker Row
                    Text(
                      'Cách chọn vị trí nhanh',
                      style: TextStyle(
                        fontSize: AppFontSize.xs,
                        fontWeight: AppFontWeight.bold,
                        color: secColor,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: _buildQuickActionButton(
                            icon: Iconsax.map_1,
                            label: 'Bản Đồ',
                            color: AppColors.primary,
                            onTap: _openMapPicker,
                            altColor: altColor,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _buildQuickActionButton(
                            icon: Iconsax.gps,
                            label: _isFetchingGps ? 'Đang lấy GPS...' : 'GPS Hiện Tại',
                            color: AppColors.success,
                            onTap: _pickCurrentGps,
                            altColor: altColor,
                            isLoading: _isFetchingGps,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _buildQuickActionButton(
                            icon: Iconsax.buildings_2,
                            label: 'Quận/Phường',
                            color: AppColors.info,
                            onTap: _openAdministrativeSelector,
                            altColor: altColor,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Nhãn địa chỉ (Tags)
                    Text(
                      'Nhãn địa chỉ',
                      style: TextStyle(
                        fontSize: AppFontSize.xs,
                        fontWeight: AppFontWeight.bold,
                        color: secColor,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 8,
                      children: _quickTags.map((tag) {
                        final isSelected = _title == tag;
                        return ChoiceChip(
                          label: Text(tag),
                          selected: isSelected,
                          selectedColor: AppColors.primary.withValues(alpha: 0.15),
                          labelStyle: TextStyle(
                            color: isSelected ? AppColors.primary : textColor,
                            fontWeight: isSelected ? AppFontWeight.bold : AppFontWeight.regular,
                            fontSize: AppFontSize.xs,
                          ),
                          onSelected: (val) {
                            if (val) setState(() => _title = tag);
                          },
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),

                    // Khu vực hành chính (Tappable Selector Tile)
                    Text(
                      'Khu vực hành chính',
                      style: TextStyle(
                        fontSize: AppFontSize.xs,
                        fontWeight: AppFontWeight.bold,
                        color: secColor,
                      ),
                    ),
                    const SizedBox(height: 6),
                    InkWell(
                      onTap: _openAdministrativeSelector,
                      borderRadius: const BorderRadius.all(AppRadius.md),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        decoration: BoxDecoration(
                          color: altColor,
                          borderRadius: const BorderRadius.all(AppRadius.md),
                          border: Border.all(
                            color: AppColors.primary.withValues(alpha: 0.2),
                          ),
                        ),
                        child: Row(
                          children: [
                            const Icon(Iconsax.buildings, size: 20, color: AppColors.primary),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '$_ward, $_district',
                                    style: TextStyle(
                                      fontSize: AppFontSize.sm,
                                      fontWeight: AppFontWeight.bold,
                                      color: textColor,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    _province,
                                    style: TextStyle(
                                      fontSize: AppFontSize.xs,
                                      color: secColor,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.textHintLight),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Số nhà, tên đường
                    Text(
                      'Số nhà, tên đường',
                      style: TextStyle(
                        fontSize: AppFontSize.xs,
                        fontWeight: AppFontWeight.bold,
                        color: secColor,
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _streetController,
                      decoration: InputDecoration(
                        hintText: 'Ví dụ: 123 Lê Lợi, Hẻm 45...',
                        prefixIcon: const Icon(Iconsax.signpost, size: 18),
                        filled: true,
                        fillColor: altColor,
                        border: const OutlineInputBorder(
                          borderRadius: BorderRadius.all(AppRadius.md),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      onChanged: (_) => setState(() {}),
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) {
                          return 'Vui lòng nhập số nhà hoặc tên đường';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 12),

                    // Live Preview Full Address
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.06),
                        borderRadius: const BorderRadius.all(AppRadius.md),
                        border: Border.all(
                          color: AppColors.primary.withValues(alpha: 0.2),
                        ),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Iconsax.location, size: 18, color: AppColors.primary),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Địa chỉ giao hàng hoàn chỉnh:',
                                  style: TextStyle(
                                    fontSize: AppFontSize.xs,
                                    color: AppColors.primary,
                                    fontWeight: AppFontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  _computeFullAddress(),
                                  style: TextStyle(
                                    fontSize: AppFontSize.xs,
                                    color: textColor,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Người nhận & Số điện thoại
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Tên người nhận',
                                style: TextStyle(
                                  fontSize: AppFontSize.xs,
                                  fontWeight: AppFontWeight.bold,
                                  color: secColor,
                                ),
                              ),
                              const SizedBox(height: 6),
                              TextFormField(
                                controller: _nameController,
                                decoration: InputDecoration(
                                  hintText: 'Họ và tên',
                                  prefixIcon: const Icon(Iconsax.user, size: 18),
                                  filled: true,
                                  fillColor: altColor,
                                  border: const OutlineInputBorder(
                                    borderRadius: BorderRadius.all(AppRadius.md),
                                    borderSide: BorderSide.none,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Số điện thoại',
                                style: TextStyle(
                                  fontSize: AppFontSize.xs,
                                  fontWeight: AppFontWeight.bold,
                                  color: secColor,
                                ),
                              ),
                              const SizedBox(height: 6),
                              TextFormField(
                                controller: _phoneController,
                                keyboardType: TextInputType.phone,
                                decoration: InputDecoration(
                                  hintText: '0901234567',
                                  prefixIcon: const Icon(Iconsax.call, size: 18),
                                  filled: true,
                                  fillColor: altColor,
                                  border: const OutlineInputBorder(
                                    borderRadius: BorderRadius.all(AppRadius.md),
                                    borderSide: BorderSide.none,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Ghi chú giao hàng
                    Text(
                      'Ghi chú cho tài xế (tùy chọn)',
                      style: TextStyle(
                        fontSize: AppFontSize.xs,
                        fontWeight: AppFontWeight.bold,
                        color: secColor,
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _noteController,
                      decoration: InputDecoration(
                        hintText: 'Ví dụ: Gọi điện trước khi đến, gửi bảo vệ...',
                        prefixIcon: const Icon(Iconsax.note_2, size: 18),
                        filled: true,
                        fillColor: altColor,
                        border: const OutlineInputBorder(
                          borderRadius: BorderRadius.all(AppRadius.md),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Default switch
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text(
                        'Đặt làm địa chỉ mặc định',
                        style: TextStyle(
                          fontSize: AppFontSize.sm,
                          fontWeight: AppFontWeight.medium,
                        ),
                      ),
                      subtitle: const Text(
                        'Địa chỉ này sẽ được ưu tiên khi bạn đặt hàng',
                        style: TextStyle(
                          fontSize: AppFontSize.xs,
                          color: AppColors.textSecondaryLight,
                        ),
                      ),
                      activeThumbColor: AppColors.primary,
                      value: _isDefault,
                      onChanged: (val) => setState(() => _isDefault = val),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Bottom Button
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: surfaceColor,
              border: Border(top: BorderSide(color: altColor)),
            ),
            child: SizedBox(
              width: double.infinity,
              child: AppButton(
                text: widget.initialAddress != null ? 'Cập Nhật Địa Chỉ' : 'Lưu Địa Chỉ',
                icon: Iconsax.tick_circle,
                isLoading: _isSaving,
                onPressed: _isSaving ? null : _onSave,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
    required Color altColor,
    bool isLoading = false,
  }) {
    return InkWell(
      onTap: isLoading ? null : onTap,
      borderRadius: const BorderRadius.all(AppRadius.md),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          color: altColor,
          borderRadius: const BorderRadius.all(AppRadius.md),
          border: Border.all(
            color: color.withValues(alpha: 0.25),
          ),
        ),
        child: Column(
          children: [
            if (isLoading)
              SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(strokeWidth: 2, color: color),
              )
            else
              Icon(icon, size: 20, color: color),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: AppFontSize.xs,
                fontWeight: AppFontWeight.bold,
                color: color,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
