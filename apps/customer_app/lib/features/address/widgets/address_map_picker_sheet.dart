import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_map_cancellable_tile_provider/flutter_map_cancellable_tile_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:iconsax/iconsax.dart';
import 'package:latlong2/latlong.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/services/location_service.dart';
import '../providers/address_provider.dart';

class MapPickerResult {
  final double lat;
  final double lng;
  final String fullAddress;
  final String street;
  final String ward;
  final String district;
  final String city;

  const MapPickerResult({
    required this.lat,
    required this.lng,
    required this.fullAddress,
    required this.street,
    required this.ward,
    required this.district,
    required this.city,
  });
}

class AddressMapPickerSheet extends ConsumerStatefulWidget {
  final double? initialLat;
  final double? initialLng;

  const AddressMapPickerSheet({
    super.key,
    this.initialLat,
    this.initialLng,
  });

  static Future<MapPickerResult?> show(
    BuildContext context, {
    double? initialLat,
    double? initialLng,
  }) {
    return showModalBottomSheet<MapPickerResult>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => AddressMapPickerSheet(
        initialLat: initialLat,
        initialLng: initialLng,
      ),
    );
  }

  @override
  ConsumerState<AddressMapPickerSheet> createState() =>
      _AddressMapPickerSheetState();
}

class _AddressMapPickerSheetState extends ConsumerState<AddressMapPickerSheet>
    with SingleTickerProviderStateMixin {
  late final MapController _mapController;
  final TextEditingController _searchController = TextEditingController();

  late LatLng _currentCenter;
  bool _isDragging = false;
  bool _isLoadingAddress = false;
  bool _isLocatingGps = false;

  String _displayAddress = 'Đang tải vị trí...';
  String _street = '';
  String _ward = '';
  String _district = '';
  String _city = '';

  Timer? _debounceTimer;
  Timer? _searchDebounce;
  List<Map<String, dynamic>> _searchResults = [];
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
    _currentCenter = LatLng(
      widget.initialLat ?? 10.7769,
      widget.initialLng ?? 106.7009,
    );

    // Initial reverse geocode
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _reverseGeocodeCurrentLocation();
    });
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchDebounce?.cancel();
    _searchController.dispose();
    _mapController.dispose();
    super.dispose();
  }

  void _onPositionChanged(MapCamera camera, bool hasGesture) {
    _currentCenter = camera.center;
    if (hasGesture) {
      if (!_isDragging) {
        setState(() => _isDragging = true);
      }
      _debounceTimer?.cancel();
      _debounceTimer = Timer(const Duration(milliseconds: 600), () {
        if (mounted) {
          setState(() => _isDragging = false);
          _reverseGeocodeCurrentLocation();
        }
      });
    }
  }

  Future<void> _reverseGeocodeCurrentLocation() async {
    if (!mounted) return;
    setState(() => _isLoadingAddress = true);

    try {
      final geo = ref.read(geocodingServiceProvider);
      final res = await geo.reverse(_currentCenter.latitude, _currentCenter.longitude);

      if (mounted && res != null) {
        final fullAddr = res['fullAddress'] as String? ??
            res['displayName'] as String? ??
            '';
        final road = res['street'] as String? ?? res['road'] as String? ?? '';
        final ward = res['ward'] as String? ?? '';
        final district = res['district'] as String? ?? '';
        final city = res['city'] as String? ?? '';

        final fallbackAddr = [road, ward, district, city]
            .where((s) => s.trim().isNotEmpty)
            .join(', ');

        setState(() {
          _displayAddress = fullAddr.isNotEmpty
              ? fullAddr
              : (fallbackAddr.isNotEmpty ? fallbackAddr : 'Vị trí đã ghim trên bản đồ');
          _street = road;
          _ward = ward;
          _district = district;
          _city = city;
          _isLoadingAddress = false;
        });
        return;
      }
    } catch (_) {}

    if (mounted) {
      setState(() {
        _displayAddress = 'Vị trí đã ghim trên bản đồ';
        _isLoadingAddress = false;
      });
    }
  }

  Future<void> _moveToCurrentGps() async {
    if (_isLocatingGps) return;
    setState(() => _isLocatingGps = true);

    final pos = await LocationService.getCurrentPosition();
    if (mounted) {
      setState(() => _isLocatingGps = false);
      if (pos != null) {
        final target = LatLng(pos.latitude, pos.longitude);
        _currentCenter = target;
        _mapController.move(target, 16.5);
        _reverseGeocodeCurrentLocation();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Không thể lấy vị trí GPS hiện tại. Vui lòng cấp quyền.'),
            backgroundColor: AppColors.warning,
          ),
        );
      }
    }
  }

  void _onSearchChanged(String query) {
    _searchDebounce?.cancel();
    if (query.trim().isEmpty) {
      setState(() {
        _searchResults = [];
        _isSearching = false;
      });
      return;
    }

    _searchDebounce = Timer(const Duration(milliseconds: 500), () async {
      if (!mounted) return;
      setState(() => _isSearching = true);
      final geo = ref.read(geocodingServiceProvider);
      final list = await geo.search(query);
      if (mounted) {
        setState(() {
          _searchResults = list;
          _isSearching = false;
        });
      }
    });
  }

  void _selectSearchResult(Map<String, dynamic> item) {
    final lat = (item['lat'] as num).toDouble();
    final lng = (item['lng'] as num).toDouble();
    final target = LatLng(lat, lng);

    setState(() {
      _currentCenter = target;
      _searchResults = [];
      _searchController.clear();
    });

    _mapController.move(target, 16.5);
    _reverseGeocodeCurrentLocation();
  }

  void _confirmLocation() {
    final finalFullAddress = _displayAddress.isNotEmpty && !_displayAddress.startsWith('Tọa độ')
        ? _displayAddress
        : [_street, _ward, _district, _city].where((s) => s.isNotEmpty).join(', ');

    Navigator.pop(
      context,
      MapPickerResult(
        lat: _currentCenter.latitude,
        lng: _currentCenter.longitude,
        fullAddress: finalFullAddress.isNotEmpty ? finalFullAddress : 'Vị trí trên bản đồ',
        street: _street,
        ward: _ward,
        district: _district,
        city: _city,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final altColor = isDark ? AppColors.surfaceAltDark : AppColors.surfaceAltLight;
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;

    return Container(
      height: MediaQuery.of(context).size.height * 0.88,
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: const BorderRadius.vertical(top: AppRadius.lg),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          // 1. FlutterMap (OpenStreetMap tiles with CancellableNetworkTileProvider)
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _currentCenter,
              initialZoom: 16.0,
              minZoom: 4.0,
              maxZoom: 19.0,
              onPositionChanged: _onPositionChanged,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.trangiafood.customer_app',
                tileProvider: CancellableNetworkTileProvider(),
                maxZoom: 19,
              ),
            ],
          ),

          // 2. Center Pin with drop shadow and drag animation
          Center(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 36),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    transform: Matrix4.translationValues(
                      0,
                      _isDragging ? -14 : 0,
                      0,
                    ),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.4),
                            blurRadius: 12,
                            spreadRadius: 3,
                          ),
                        ],
                      ),
                      child: const Icon(
                        Iconsax.location5,
                        color: Colors.white,
                        size: 26,
                      ),
                    ),
                  ),
                  const SizedBox(height: 2),
                  // Pin shadow dot
                  Container(
                    width: 8,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // 3. Top Floating Search Bar & Back Button
          Positioned(
            top: 12,
            left: 12,
            right: 12,
            child: Column(
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: surfaceColor,
                    borderRadius: const BorderRadius.all(AppRadius.md),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.1),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(context),
                      ),
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          onChanged: _onSearchChanged,
                          decoration: InputDecoration(
                            hintText: 'Tìm địa chỉ, toà nhà, đường phố...',
                            border: InputBorder.none,
                            hintStyle: TextStyle(
                              fontSize: AppFontSize.sm,
                              color: isDark
                                  ? AppColors.textSecondaryDark
                                  : AppColors.textSecondaryLight,
                            ),
                          ),
                        ),
                      ),
                      if (_isSearching)
                        const Padding(
                          padding: EdgeInsets.all(12),
                          child: SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        )
                      else if (_searchController.text.isNotEmpty)
                        IconButton(
                          icon: const Icon(Icons.clear, size: 18),
                          onPressed: () {
                            _searchController.clear();
                            setState(() => _searchResults = []);
                          },
                        ),
                    ],
                  ),
                ),

                // Search autocomplete suggestions dropdown
                if (_searchResults.isNotEmpty)
                  Container(
                    margin: const EdgeInsets.only(top: 6),
                    constraints: const BoxConstraints(maxHeight: 220),
                    decoration: BoxDecoration(
                      color: surfaceColor,
                      borderRadius: const BorderRadius.all(AppRadius.md),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.12),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ListView.separated(
                      shrinkWrap: true,
                      padding: EdgeInsets.zero,
                      itemCount: _searchResults.length,
                      separatorBuilder: (_, _) => const Divider(height: 1),
                      itemBuilder: (ctx, idx) {
                        final item = _searchResults[idx];
                        final display = item['displayName'] as String? ?? '';
                        return ListTile(
                          dense: true,
                          leading: const Icon(Iconsax.location, size: 18, color: AppColors.primary),
                          title: Text(
                            display,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: AppFontSize.xs,
                              color: textColor,
                            ),
                          ),
                          onTap: () => _selectSearchResult(item),
                        );
                      },
                    ),
                  ),
              ],
            ),
          ),

          // 4. GPS "Vị trí của tôi" FAB
          Positioned(
            right: 16,
            bottom: 180,
            child: FloatingActionButton.small(
              heroTag: 'gps_fab',
              backgroundColor: surfaceColor,
              foregroundColor: AppColors.primary,
              elevation: 4,
              onPressed: _moveToCurrentGps,
              child: _isLocatingGps
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.my_location),
            ),
          ),

          // 5. Bottom Address Information Card & Confirm Action
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
              decoration: BoxDecoration(
                color: surfaceColor,
                borderRadius: const BorderRadius.vertical(top: AppRadius.lg),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.12),
                    blurRadius: 15,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Iconsax.map_1, color: AppColors.primary, size: 20),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Vị trí giao hàng đã chọn',
                              style: TextStyle(
                                fontSize: AppFontSize.xs,
                                color: AppColors.textSecondaryLight,
                                fontWeight: AppFontWeight.medium,
                              ),
                            ),
                            const SizedBox(height: 2),
                            if (_isLoadingAddress)
                              Row(
                                children: [
                                  const SizedBox(
                                    width: 12,
                                    height: 12,
                                    child: CircularProgressIndicator(strokeWidth: 1.8),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Đang xác định địa chỉ...',
                                    style: TextStyle(
                                      fontSize: AppFontSize.sm,
                                      color: textColor,
                                    ),
                                  ),
                                ],
                              )
                            else
                              Text(
                                _displayAddress,
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
                  const SizedBox(height: 12),
                  // Area summary / Instruction Badge (Never raw coordinates)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: altColor,
                      borderRadius: const BorderRadius.all(AppRadius.sm),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Iconsax.location,
                          size: 14,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: 6),
                        Flexible(
                          child: Text(
                            [_ward, _district, _city].where((s) => s.isNotEmpty).isNotEmpty
                                ? 'Khu vực: ${[_ward, _district, _city].where((s) => s.isNotEmpty).join(', ')}'
                                : 'Di chuyển bản đồ để ghim đúng địa chỉ nhận hàng',
                            style: const TextStyle(
                              fontSize: AppFontSize.xs,
                              fontWeight: AppFontWeight.medium,
                              color: AppColors.textSecondaryLight,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    child: AppButton(
                      text: 'Xác Nhận Vị Trí Này',
                      icon: Icons.check_circle_outline,
                      isLoading: _isLoadingAddress,
                      onPressed: _isLoadingAddress ? null : _confirmLocation,
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
