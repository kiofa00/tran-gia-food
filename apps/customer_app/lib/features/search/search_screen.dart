import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

import '../../core/providers/api_client_provider.dart';
import '../../core/providers/location_provider.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';
  String _selectedCategory = 'Tất cả';
  String _selectedDistance = 'Tất cả';
  String _selectedRating = 'Tất cả';

  List<Map<String, dynamic>> _restaurants = [];
  bool _isLoading = false;

  final List<String> _recentSearches = [];

  final List<String> _categories = [
    'Tất cả',
    'Cơm & Phở',
    'Trà Sữa',
    'Pizza & Fastfood',
    'Lành Mạnh',
    'Bánh Mì',
  ];

  @override
  void initState() {
    super.initState();
    _loadRestaurants();
  }

  Future<void> _loadRestaurants({String? search, String? category}) async {
    setState(() => _isLoading = true);
    try {
      final queryParams = <String, String>{};
      if (search != null && search.trim().isNotEmpty) {
        queryParams['search'] = search.trim();
      }
      final cat = category ?? _selectedCategory;
      if (cat.isNotEmpty && cat != 'Tất cả') {
        queryParams['category'] = cat;
      }

      final res = await ref
          .read(apiClientProvider)
          .get(
            '/restaurants',
            query: queryParams.isNotEmpty ? queryParams : null,
            auth: false,
          );
      final data = res['data'] ?? res;
      final userPos = ref.read(userLocationProvider).asData?.value;

      if (data is List) {
        setState(() {
          _restaurants = data.map((item) {
            final m = item as Map<String, dynamic>;
            final rawDistance = m['distance_km'] ?? m['distanceKm'];
            double? distance;
            if (rawDistance != null) {
              distance = (rawDistance as num).toDouble();
            } else if (userPos != null &&
                m['lat'] != null &&
                m['lng'] != null) {
              final rLat = (m['lat'] as num).toDouble();
              final rLng = (m['lng'] as num).toDouble();
              distance =
                  Geolocator.distanceBetween(
                    userPos.latitude,
                    userPos.longitude,
                    rLat,
                    rLng,
                  ) /
                  1000;
            }

            return {
              'id': m['id']?.toString() ?? '',
              'name': m['name']?.toString() ?? '',
              'address': m['address']?.toString() ?? '',
              'rating':
                  (m['avgRating'] as num?)?.toDouble() ??
                  (m['rating'] as num?)?.toDouble() ??
                  0.0,
              'totalReviews': (m['totalReviews'] as num?)?.toInt() ?? 0,
              'distanceKm': distance,
              'isOpen': m['isOpen'] as bool? ?? true,
              'imageUrl':
                  m['coverImageUrl']?.toString() ?? m['avatarUrl']?.toString(),
            };
          }).toList();
        });
      }
    } catch (_) {
      setState(() => _restaurants = []);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _onSearchSubmitted(String query) {
    final term = query.trim();
    if (term.isNotEmpty && !_recentSearches.contains(term)) {
      setState(() {
        _recentSearches.insert(0, term);
        if (_recentSearches.length > 10) _recentSearches.removeLast();
      });
    }
    _loadRestaurants(search: term);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> get _filteredResults {
    return _restaurants.where((r) {
      final dist = r['distanceKm'] as double?;
      final matchesDistance =
          _selectedDistance == 'Tất cả' ||
          (dist != null && _selectedDistance == '< 2km' && dist < 2.0) ||
          (dist != null && _selectedDistance == '< 5km' && dist < 5.0);

      final matchesRating =
          _selectedRating == 'Tất cả' ||
          (_selectedRating == '4.5+ ⭐' && (r['rating'] as num) >= 4.5) ||
          (_selectedRating == '4.0+ ⭐' && (r['rating'] as num) >= 4.0);

      return matchesDistance && matchesRating;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final results = _filteredResults;

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        leading: IconButton(
          icon: const Icon(Iconsax.arrow_left),
          onPressed: () => context.pop(),
        ),
        title: Padding(
          padding: const EdgeInsets.only(right: 16),
          child: AppSearchBar(
            controller: _searchController,
            autofocus: true,
            hintText: 'Tìm quán ăn, món ngon, trà sữa...',
            onChanged: (val) {
              setState(() => _searchQuery = val.trim());
              _loadRestaurants(search: val.trim());
            },
            onSubmitted: _onSearchSubmitted,
            onClear: () {
              setState(() => _searchQuery = '');
              _loadRestaurants(search: '');
            },
          ),
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Filter Chips Carousel
          Container(
            height: 48,
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _buildFilterButton(
                  'Khoảng cách',
                  _selectedDistance,
                  ['Tất cả', '< 2km', '< 5km'],
                  (v) => setState(() => _selectedDistance = v),
                ),
                const SizedBox(width: 8),
                _buildFilterButton(
                  'Đánh giá',
                  _selectedRating,
                  ['Tất cả', '4.5+ ⭐', '4.0+ ⭐'],
                  (v) => setState(() => _selectedRating = v),
                ),
              ],
            ),
          ),

          // Categories carousel
          Container(
            height: 38,
            padding: const EdgeInsets.symmetric(vertical: 2),
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(
                parent: AlwaysScrollableScrollPhysics(),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _categories.length,
              separatorBuilder: (_, _) => const SizedBox(width: 8),
              itemBuilder: (_, i) {
                final cat = _categories[i];
                final isSelected = _selectedCategory == cat;
                return GestureDetector(
                  onTap: () {
                    setState(() => _selectedCategory = cat);
                    _loadRestaurants(search: _searchQuery, category: cat);
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.primary
                          : AppColors.surfaceAltLight,
                      borderRadius: const BorderRadius.all(AppRadius.full),
                      border: Border.all(
                        color: isSelected
                            ? AppColors.primary
                            : AppColors.dividerLight,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        cat,
                        style: TextStyle(
                          fontSize: AppFontSize.sm,
                          fontWeight: isSelected
                              ? AppFontWeight.bold
                              : AppFontWeight.medium,
                          color: isSelected
                              ? Colors.white
                              : AppColors.textPrimaryLight,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const Divider(height: 16),

          // Search Content
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _searchQuery.isEmpty &&
                      _selectedCategory == 'Tất cả' &&
                      _selectedDistance == 'Tất cả'
                ? _buildHomeOrRecentView()
                : _buildSearchResults(results),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterButton(
    String label,
    String currentValue,
    List<String> options,
    ValueChanged<String> onSelected,
  ) {
    final isActive = currentValue != 'Tất cả';
    return PopupMenuButton<String>(
      initialValue: currentValue,
      onSelected: onSelected,
      itemBuilder: (ctx) => options
          .map((opt) => PopupMenuItem(value: opt, child: Text(opt)))
          .toList(),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        decoration: BoxDecoration(
          color: isActive
              ? AppColors.primary.withValues(alpha: 0.12)
              : AppColors.surfaceAltLight,
          borderRadius: const BorderRadius.all(AppRadius.full),
          border: Border.all(
            color: isActive ? AppColors.primary : AppColors.dividerLight,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              isActive ? '$label: $currentValue' : label,
              style: TextStyle(
                fontSize: AppFontSize.xs,
                fontWeight: isActive
                    ? AppFontWeight.bold
                    : AppFontWeight.medium,
                color: isActive
                    ? AppColors.primary
                    : AppColors.textPrimaryLight,
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              Icons.keyboard_arrow_down,
              size: 16,
              color: isActive
                  ? AppColors.primary
                  : AppColors.textSecondaryLight,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHomeOrRecentView() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (_recentSearches.isNotEmpty) ...[
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Tìm kiếm gần đây',
                style: TextStyle(
                  fontWeight: AppFontWeight.bold,
                  fontSize: AppFontSize.md,
                ),
              ),
              TextButton(
                onPressed: () => setState(() => _recentSearches.clear()),
                child: const Text(
                  'Xóa tất cả',
                  style: TextStyle(
                    fontSize: AppFontSize.xs,
                    color: AppColors.textSecondaryLight,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _recentSearches.map((term) {
              return ActionChip(
                avatar: const Icon(
                  Iconsax.clock,
                  size: 14,
                  color: AppColors.textSecondaryLight,
                ),
                label: Text(term),
                backgroundColor: AppColors.surfaceLight,
                side: const BorderSide(color: AppColors.dividerLight),
                labelStyle: const TextStyle(fontSize: AppFontSize.xs),
                onPressed: () {
                  _searchController.text = term;
                  setState(() => _searchQuery = term);
                  _loadRestaurants(search: term);
                },
              );
            }).toList(),
          ),
          const SizedBox(height: 24),
        ],
        const Text(
          'Gợi ý hôm nay 🔥',
          style: TextStyle(
            fontWeight: AppFontWeight.bold,
            fontSize: AppFontSize.md,
          ),
        ),
        const SizedBox(height: 12),
        if (_restaurants.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12),
            child: Text(
              'Chưa có danh sách gợi ý',
              style: TextStyle(color: AppColors.textSecondaryLight),
            ),
          )
        else
          ..._restaurants.take(5).map((r) => _buildRestaurantResultTile(r)),
      ],
    );
  }

  Widget _buildSearchResults(List<Map<String, dynamic>> results) {
    if (results.isEmpty) {
      return AppEmptyState(
        icon: Iconsax.search_status,
        title: 'Không tìm thấy quán hoặc món phù hợp',
        description:
            'Thử tìm với từ khóa khác hoặc xóa bộ lọc để khám phá thêm.',
        actionText: 'Xóa bộ lọc',
        actionIcon: Icons.refresh_rounded,
        onAction: () {
          _searchController.clear();
          setState(() {
            _searchQuery = '';
            _selectedCategory = 'Tất cả';
            _selectedDistance = 'Tất cả';
            _selectedRating = 'Tất cả';
          });
          _loadRestaurants(search: '', category: 'Tất cả');
        },
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: results.length,
      itemBuilder: (_, i) => _buildRestaurantResultTile(results[i]),
    );
  }

  Widget _buildRestaurantResultTile(Map<String, dynamic> r) {
    final name = r['name'] as String? ?? '';
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: RestaurantCard(
        id: r['id'] as String? ?? '',
        name: name,
        address: r['address'] as String? ?? '',
        rating: (r['rating'] as num?)?.toDouble() ?? 0.0,
        totalReviews: (r['totalReviews'] as num?)?.toInt() ?? 0,
        distanceKm: r['distanceKm'] as double?,
        coverImageUrl: r['imageUrl'] as String?,
        isOpen: r['isOpen'] as bool? ?? true,
        onTap: () => context.push(
          '/restaurant/${r['id']}?name=${Uri.encodeComponent(name)}',
        ),
      ),
    );
  }
}
