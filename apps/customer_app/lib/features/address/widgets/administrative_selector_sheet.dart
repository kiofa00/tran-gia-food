import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/constants/vietnam_administrative_data.dart';

class AdministrativeSelectionResult {
  final Province province;
  final District district;
  final Ward ward;

  const AdministrativeSelectionResult({
    required this.province,
    required this.district,
    required this.ward,
  });
}

class AdministrativeSelectorSheet extends StatefulWidget {
  final String? initialProvince;
  final String? initialDistrict;
  final String? initialWard;

  const AdministrativeSelectorSheet({
    super.key,
    this.initialProvince,
    this.initialDistrict,
    this.initialWard,
  });

  static Future<AdministrativeSelectionResult?> show(
    BuildContext context, {
    String? initialProvince,
    String? initialDistrict,
    String? initialWard,
  }) {
    return showModalBottomSheet<AdministrativeSelectionResult>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => AdministrativeSelectorSheet(
        initialProvince: initialProvince,
        initialDistrict: initialDistrict,
        initialWard: initialWard,
      ),
    );
  }

  @override
  State<AdministrativeSelectorSheet> createState() =>
      _AdministrativeSelectorSheetState();
}

class _AdministrativeSelectorSheetState
    extends State<AdministrativeSelectorSheet> {
  final TextEditingController _searchController = TextEditingController();

  Province? _selectedProvince;
  District? _selectedDistrict;
  Ward? _selectedWard;

  // 0: Province, 1: District, 2: Ward
  int _currentStep = 0;
  String _searchKeyword = '';

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      setState(() {
        _searchKeyword = _searchController.text.trim().toLowerCase();
      });
    });

    if (widget.initialProvince != null) {
      final p = findProvinceByName(widget.initialProvince!);
      if (p != null) {
        _selectedProvince = p;
        _currentStep = 1;
        if (widget.initialDistrict != null) {
          final d = p.districts.where((d) =>
              d.name.toLowerCase().contains(widget.initialDistrict!.toLowerCase()));
          if (d.isNotEmpty) {
            _selectedDistrict = d.first;
            _currentStep = 2;
          }
        }
      }
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSelectProvince(Province p) {
    setState(() {
      _selectedProvince = p;
      _selectedDistrict = null;
      _selectedWard = null;
      _currentStep = 1;
      _searchController.clear();
    });
  }

  void _onSelectDistrict(District d) {
    setState(() {
      _selectedDistrict = d;
      _selectedWard = null;
      _currentStep = 2;
      _searchController.clear();
    });
  }

  void _onSelectWard(Ward w) {
    setState(() {
      _selectedWard = w;
    });
    if (_selectedProvince != null && _selectedDistrict != null) {
      Navigator.pop(
        context,
        AdministrativeSelectionResult(
          province: _selectedProvince!,
          district: _selectedDistrict!,
          ward: w,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final altColor = isDark ? AppColors.surfaceAltDark : AppColors.surfaceAltLight;
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final secColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    return Material(
      color: surfaceColor,
      borderRadius: const BorderRadius.vertical(top: AppRadius.lg),
      clipBehavior: Clip.antiAlias,
      child: SizedBox(
        height: MediaQuery.of(context).size.height * 0.75,
        child: Column(
        children: [
          // Header Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back),
                  onPressed: () {
                    if (_currentStep > 0) {
                      setState(() {
                        _currentStep--;
                        _searchController.clear();
                      });
                    } else {
                      Navigator.pop(context);
                    }
                  },
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _currentStep == 0
                        ? 'Chọn Tỉnh / Thành phố'
                        : _currentStep == 1
                            ? 'Chọn Quận / Huyện'
                            : 'Chọn Phường / Xã',
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

          // Breadcrumbs
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildBreadcrumbChip(
                    label: _selectedProvince?.name ?? 'Tỉnh/Thành',
                    isActive: _currentStep == 0,
                    isDone: _selectedProvince != null,
                    onTap: () {
                      setState(() {
                        _currentStep = 0;
                        _searchController.clear();
                      });
                    },
                    isDark: isDark,
                  ),
                  const Icon(Icons.chevron_right, size: 16, color: AppColors.textHintLight),
                  _buildBreadcrumbChip(
                    label: _selectedDistrict?.name ?? 'Quận/Huyện',
                    isActive: _currentStep == 1,
                    isDone: _selectedDistrict != null,
                    onTap: _selectedProvince != null
                        ? () {
                            setState(() {
                              _currentStep = 1;
                              _searchController.clear();
                            });
                          }
                        : null,
                    isDark: isDark,
                  ),
                  const Icon(Icons.chevron_right, size: 16, color: AppColors.textHintLight),
                  _buildBreadcrumbChip(
                    label: _selectedWard?.name ?? 'Phường/Xã',
                    isActive: _currentStep == 2,
                    isDone: _selectedWard != null,
                    onTap: _selectedDistrict != null
                        ? () {
                            setState(() {
                              _currentStep = 2;
                              _searchController.clear();
                            });
                          }
                        : null,
                    isDark: isDark,
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 8),

          // Search Field
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: _currentStep == 0
                    ? 'Tìm tỉnh, thành phố...'
                    : _currentStep == 1
                        ? 'Tìm quận, huyện...'
                        : 'Tìm phường, xã...',
                prefixIcon: const Icon(Iconsax.search_normal, size: 18),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 18),
                        onPressed: () => _searchController.clear(),
                      )
                    : null,
                filled: true,
                fillColor: altColor,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                border: const OutlineInputBorder(
                  borderRadius: BorderRadius.all(AppRadius.md),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          const Divider(height: 16),

          // List Items
          Expanded(
            child: _buildListContent(textColor, secColor, altColor),
          ),
        ],
      ),
    ),
  );
}

  Widget _buildBreadcrumbChip({
    required String label,
    required bool isActive,
    required bool isDone,
    VoidCallback? onTap,
    required bool isDark,
  }) {
    final bgColor = isActive
        ? AppColors.primary.withValues(alpha: 0.15)
        : (isDone
            ? (isDark ? AppColors.surfaceAltDark : AppColors.surfaceAltLight)
            : Colors.transparent);

    final fgColor = isActive
        ? AppColors.primary
        : (isDone
            ? (isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight)
            : AppColors.textHintLight);

    return InkWell(
      onTap: onTap,
      borderRadius: const BorderRadius.all(AppRadius.full),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: const BorderRadius.all(AppRadius.full),
          border: Border.all(
            color: isActive ? AppColors.primary : Colors.transparent,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: AppFontSize.xs,
            fontWeight: isActive ? AppFontWeight.bold : AppFontWeight.medium,
            color: fgColor,
          ),
        ),
      ),
    );
  }

  Widget _buildListContent(Color textColor, Color secColor, Color altColor) {
    if (_currentStep == 0) {
      final list = vietnamProvinces.where((p) {
        if (_searchKeyword.isEmpty) return true;
        return p.name.toLowerCase().contains(_searchKeyword);
      }).toList();

      if (list.isEmpty) return _buildEmptyView();

      return ListView.separated(
        itemCount: list.length,
        separatorBuilder: (_, _) => const Divider(height: 1, indent: 16, endIndent: 16),
        itemBuilder: (ctx, idx) {
          final p = list[idx];
          final isSelected = _selectedProvince?.code == p.code;
          return ListTile(
            title: Text(
              p.name,
              style: TextStyle(
                fontWeight: isSelected ? AppFontWeight.bold : AppFontWeight.regular,
                color: isSelected ? AppColors.primary : textColor,
              ),
            ),
            trailing: isSelected
                ? const Icon(Icons.check, color: AppColors.primary)
                : const Icon(Icons.chevron_right, size: 18, color: AppColors.textHintLight),
            onTap: () => _onSelectProvince(p),
          );
        },
      );
    } else if (_currentStep == 1) {
      final districts = _selectedProvince?.districts ?? [];
      final list = districts.where((d) {
        if (_searchKeyword.isEmpty) return true;
        return d.name.toLowerCase().contains(_searchKeyword);
      }).toList();

      if (list.isEmpty) return _buildEmptyView();

      return ListView.separated(
        itemCount: list.length,
        separatorBuilder: (_, _) => const Divider(height: 1, indent: 16, endIndent: 16),
        itemBuilder: (ctx, idx) {
          final d = list[idx];
          final isSelected = _selectedDistrict?.code == d.code;
          return ListTile(
            title: Text(
              d.name,
              style: TextStyle(
                fontWeight: isSelected ? AppFontWeight.bold : AppFontWeight.regular,
                color: isSelected ? AppColors.primary : textColor,
              ),
            ),
            trailing: isSelected
                ? const Icon(Icons.check, color: AppColors.primary)
                : const Icon(Icons.chevron_right, size: 18, color: AppColors.textHintLight),
            onTap: () => _onSelectDistrict(d),
          );
        },
      );
    } else {
      final wards = _selectedDistrict?.wards ?? [];
      final list = wards.where((w) {
        if (_searchKeyword.isEmpty) return true;
        return w.name.toLowerCase().contains(_searchKeyword);
      }).toList();

      if (list.isEmpty) return _buildEmptyView();

      return ListView.separated(
        itemCount: list.length,
        separatorBuilder: (_, _) => const Divider(height: 1, indent: 16, endIndent: 16),
        itemBuilder: (ctx, idx) {
          final w = list[idx];
          final isSelected = _selectedWard?.code == w.code;
          return ListTile(
            title: Text(
              w.name,
              style: TextStyle(
                fontWeight: isSelected ? AppFontWeight.bold : AppFontWeight.regular,
                color: isSelected ? AppColors.primary : textColor,
              ),
            ),
            trailing: isSelected
                ? const Icon(Icons.check, color: AppColors.primary)
                : null,
            onTap: () => _onSelectWard(w),
          );
        },
      );
    }
  }

  Widget _buildEmptyView() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Iconsax.search_status, size: 40, color: AppColors.textHintLight),
          SizedBox(height: 8),
          Text(
            'Không tìm thấy kết quả phù hợp',
            style: TextStyle(
              fontSize: AppFontSize.sm,
              color: AppColors.textSecondaryLight,
            ),
          ),
        ],
      ),
    );
  }
}
