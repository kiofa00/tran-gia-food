import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';
  String _selectedCategory = 'Tất cả';
  String _selectedDistance = 'Tất cả';
  String _selectedRating = 'Tất cả';
  String _selectedPrice = 'Tất cả';

  final List<String> _recentSearches = [
    'Phở bò tái nạm',
    'Trà sữa trân châu',
    'Cơm tấm sườn bì',
    'Bánh mì chả cá',
  ];

  final List<String> _categories = [
    'Tất cả',
    '🍜 Cơm & Phở',
    '🧋 Trà Sữa',
    '🍕 Pizza & Fastfood',
    '🥗 Healthy',
    '🥖 Bánh Mì',
  ];

  final List<Map<String, dynamic>> _mockRestaurants = [
    {
      'id': '1',
      'name': 'Phở Bắc Hà — Nguyễn Trãi',
      'address': '123 Nguyễn Trãi, Q5, TP.HCM',
      'rating': 4.9,
      'totalReviews': 320,
      'distanceKm': 0.8,
      'category': '🍜 Cơm & Phở',
      'priceTier': '< 50k',
      'imageUrl': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600',
    },
    {
      'id': '2',
      'name': 'Trà Sữa KOI Thé — Trần Hưng Đạo',
      'address': '45 Trần Hưng Đạo, Q1, TP.HCM',
      'rating': 4.8,
      'totalReviews': 512,
      'distanceKm': 1.4,
      'category': '🧋 Trà Sữa',
      'priceTier': '50k - 100k',
      'imageUrl': 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=600',
    },
    {
      'id': '3',
      'name': 'Cơm Tấm Sài Gòn — Cống Quỳnh',
      'address': '88 Cống Quỳnh, Q1, TP.HCM',
      'rating': 4.7,
      'totalReviews': 198,
      'distanceKm': 2.1,
      'category': '🍜 Cơm & Phở',
      'priceTier': '< 50k',
      'imageUrl': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
    },
    {
      'id': '4',
      'name': 'Pizza 4P’s — Lê Thánh Tôn',
      'address': '8/15 Lê Thánh Tôn, Bến Nghé, Q1',
      'rating': 4.9,
      'totalReviews': 890,
      'distanceKm': 3.5,
      'category': '🍕 Pizza & Fastfood',
      'priceTier': '> 100k',
      'imageUrl': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600',
    },
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> get _filteredResults {
    return _mockRestaurants.where((r) {
      final matchesQuery = _searchQuery.isEmpty ||
          (r['name'] as String).toLowerCase().contains(_searchQuery.toLowerCase()) ||
          (r['address'] as String).toLowerCase().contains(_searchQuery.toLowerCase());

      final matchesCategory = _selectedCategory == 'Tất cả' ||
          (r['category'] as String) == _selectedCategory;

      final matchesDistance = _selectedDistance == 'Tất cả' ||
          (_selectedDistance == '< 2km' && (r['distanceKm'] as num) < 2.0) ||
          (_selectedDistance == '< 5km' && (r['distanceKm'] as num) < 5.0);

      final matchesRating = _selectedRating == 'Tất cả' ||
          (_selectedRating == '4.5+ ⭐' && (r['rating'] as num) >= 4.5) ||
          (_selectedRating == '4.0+ ⭐' && (r['rating'] as num) >= 4.0);

      final matchesPrice = _selectedPrice == 'Tất cả' ||
          (r['priceTier'] as String) == _selectedPrice;

      return matchesQuery && matchesCategory && matchesDistance && matchesRating && matchesPrice;
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
          child: Container(
            height: 44,
            decoration: const BoxDecoration(
              color: AppColors.surfaceAltLight,
              borderRadius: BorderRadius.all(AppRadius.full),
            ),
            child: TextField(
              controller: _searchController,
              autofocus: true,
              textInputAction: TextInputAction.search,
              decoration: InputDecoration(
                hintText: 'Tìm quán ăn, món ngon, trà sữa...',
                hintStyle: const TextStyle(fontSize: AppFontSize.sm, color: AppColors.textHintLight),
                prefixIcon: const Icon(Iconsax.search_normal_1, color: AppColors.primary, size: 20),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 18, color: AppColors.textSecondaryLight),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
              ),
              onChanged: (val) => setState(() => _searchQuery = val.trim()),
            ),
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
                _buildFilterButton('Khoảng cách', _selectedDistance, ['Tất cả', '< 2km', '< 5km'], (v) => setState(() => _selectedDistance = v)),
                const SizedBox(width: 8),
                _buildFilterButton('Đánh giá', _selectedRating, ['Tất cả', '4.5+ ⭐', '4.0+ ⭐'], (v) => setState(() => _selectedRating = v)),
                const SizedBox(width: 8),
                _buildFilterButton('Giá', _selectedPrice, ['Tất cả', '< 50k', '50k - 100k', '> 100k'], (v) => setState(() => _selectedPrice = v)),
              ],
            ),
          ),

          // Categories carousel
          Container(
            height: 38,
            padding: const EdgeInsets.symmetric(vertical: 2),
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _categories.length,
              separatorBuilder: (_, _) => const SizedBox(width: 8),
              itemBuilder: (_, i) {
                final cat = _categories[i];
                final isSelected = _selectedCategory == cat;
                return ChoiceChip(
                  label: Text(cat),
                  selected: isSelected,
                  selectedColor: AppColors.primary,
                  backgroundColor: AppColors.surfaceAltLight,
                  labelStyle: TextStyle(
                    fontSize: AppFontSize.xs,
                    fontWeight: isSelected ? AppFontWeight.bold : AppFontWeight.medium,
                    color: isSelected ? Colors.white : AppColors.textPrimaryLight,
                  ),
                  side: BorderSide.none,
                  onSelected: (_) => setState(() => _selectedCategory = cat),
                );
              },
            ),
          ),
          const Divider(height: 16),

          // Search Content
          Expanded(
            child: _searchQuery.isEmpty && _selectedCategory == 'Tất cả' && _selectedDistance == 'Tất cả'
                ? _buildRecentSearches()
                : _buildSearchResults(results),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterButton(String label, String currentValue, List<String> options, ValueChanged<String> onSelected) {
    final isActive = currentValue != 'Tất cả';
    return PopupMenuButton<String>(
      initialValue: currentValue,
      onSelected: onSelected,
      itemBuilder: (ctx) => options.map((opt) => PopupMenuItem(value: opt, child: Text(opt))).toList(),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primary.withValues(alpha: 0.12) : AppColors.surfaceAltLight,
          borderRadius: const BorderRadius.all(AppRadius.full),
          border: Border.all(color: isActive ? AppColors.primary : AppColors.dividerLight),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              isActive ? '$label: $currentValue' : label,
              style: TextStyle(
                fontSize: AppFontSize.xs,
                fontWeight: isActive ? AppFontWeight.bold : AppFontWeight.medium,
                color: isActive ? AppColors.primary : AppColors.textPrimaryLight,
              ),
            ),
            const SizedBox(width: 4),
            Icon(Icons.keyboard_arrow_down, size: 16, color: isActive ? AppColors.primary : AppColors.textSecondaryLight),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentSearches() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Tìm kiếm gần đây',
              style: TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.md),
            ),
            TextButton(
              onPressed: () => setState(() => _recentSearches.clear()),
              child: const Text('Xóa tất cả', style: TextStyle(fontSize: AppFontSize.xs, color: AppColors.textSecondaryLight)),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _recentSearches.map((term) {
            return ActionChip(
              avatar: const Icon(Iconsax.clock, size: 14, color: AppColors.textSecondaryLight),
              label: Text(term),
              backgroundColor: AppColors.surfaceLight,
              side: const BorderSide(color: AppColors.dividerLight),
              labelStyle: const TextStyle(fontSize: AppFontSize.xs),
              onPressed: () {
                _searchController.text = term;
                setState(() => _searchQuery = term);
              },
            );
          }).toList(),
        ),
        const SizedBox(height: 24),
        const Text(
          'Gợi ý hôm nay 🔥',
          style: TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.md),
        ),
        const SizedBox(height: 12),
        ..._mockRestaurants.map((r) => _buildRestaurantResultTile(r)),
      ],
    );
  }

  Widget _buildSearchResults(List<Map<String, dynamic>> results) {
    if (results.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Iconsax.search_status, size: 56, color: AppColors.textHintLight),
            const SizedBox(height: 12),
            const Text(
              'Không tìm thấy quán hoặc món phù hợp',
              style: TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.md),
            ),
            const SizedBox(height: 6),
            const Text(
              'Thử tìm với từ khóa khác hoặc điều chỉnh bộ lọc',
              style: TextStyle(color: AppColors.textSecondaryLight, fontSize: AppFontSize.sm),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: results.length,
      itemBuilder: (_, i) => _buildRestaurantResultTile(results[i]),
    );
  }

  Widget _buildRestaurantResultTile(Map<String, dynamic> r) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: RestaurantCard(
        id: r['id'] as String,
        name: r['name'] as String,
        address: r['address'] as String,
        rating: (r['rating'] as num).toDouble(),
        totalReviews: r['totalReviews'] as int,
        distanceKm: (r['distanceKm'] as num).toDouble(),
        coverImageUrl: r['imageUrl'] as String,
      ),
    );
  }
}
