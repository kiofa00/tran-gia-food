import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

import '../../../core/providers/api_client_provider.dart';
import '../cart/cart_provider.dart';
import 'restaurant_providers.dart';
import 'widgets/cart_bottom_floating_bar.dart';
import 'widgets/menu_item_tile.dart';

class RestaurantDetailScreen extends ConsumerStatefulWidget {
  final String restaurantId;
  final String restaurantName;

  const RestaurantDetailScreen({
    super.key,
    required this.restaurantId,
    this.restaurantName = '',
  });

  @override
  ConsumerState<RestaurantDetailScreen> createState() =>
      _RestaurantDetailScreenState();
}

class _RestaurantDetailScreenState
    extends ConsumerState<RestaurantDetailScreen> {
  int _selectedCategoryIndex = 0;

  Future<void> _handleAddItem(Map<String, dynamic> item, String resName) async {
    final api = ref.read(apiClientProvider);
    if (!await api.hasToken()) {
      if (!mounted) return;
      AppDialogs.showLoginPrompt(
        context,
        actionText: 'thêm món vào giỏ hàng',
        onLogin: () => context.push('/auth'),
      );
      return;
    }

    final id = item['id'] as String? ?? '';
    final name = item['name'] as String? ?? 'Món ngon';
    final price = (item['price'] as num?)?.toInt() ?? 0;
    final imageUrl = item['imageUrl'] as String?;

    ref.read(cartProvider.notifier).addItem(
          id: id,
          name: name,
          price: price,
          restaurantId: widget.restaurantId,
          restaurantName: resName,
          imageUrl: imageUrl,
        );

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Expanded(child: Text('Đã thêm "$name" vào giỏ hàng! 🛒')),
          ],
        ),
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final detailAsync = ref.watch(
      restaurantDetailProvider(widget.restaurantId),
    );
    final cart = ref.watch(cartProvider);

    return Scaffold(
      body: detailAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Scaffold(
          appBar: AppBar(
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new),
              onPressed: () => context.pop(),
            ),
          ),
          body: AppEmptyState(
            icon: Iconsax.warning_2,
            iconColor: AppColors.error,
            title: 'Không thể tải thông tin quán',
            description: 'Đã có lỗi xảy ra hoặc quán ăn hiện không khả dụng.',
            actionText: 'Quay lại',
            actionIcon: Icons.arrow_back_ios_new,
            onAction: () => context.pop(),
          ),
        ),
        data: (restaurant) {
          final name = restaurant['name'] as String? ?? widget.restaurantName;
          final address =
              restaurant['address'] as String? ?? 'Địa chỉ đang cập nhật';
          final rating = (restaurant['rating'] as num?)?.toDouble() ?? 5.0;
          final totalReviews =
              (restaurant['totalReviews'] as num?)?.toInt() ?? 0;
          final coverImageUrl = restaurant['coverImageUrl'] as String? ??
              'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800';
          final categories = List<Map<String, dynamic>>.from(
            restaurant['categories'] ?? [],
          );

          final currentItems = categories.isNotEmpty &&
                  _selectedCategoryIndex < categories.length
              ? List<Map<String, dynamic>>.from(
                  categories[_selectedCategoryIndex]['items'] ?? [])
              : <Map<String, dynamic>>[];

          return Stack(
            children: [
              CustomScrollView(
                slivers: [
                  // Sliver Header
                  SliverAppBar(
                    expandedHeight: 200,
                    pinned: true,
                    leading: IconButton(
                      icon: const CircleAvatar(
                        backgroundColor: Colors.black45,
                        child: Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 18),
                      ),
                      onPressed: () => context.pop(),
                    ),
                    flexibleSpace: FlexibleSpaceBar(
                      background: AppNetworkImage(
                        imageUrl: coverImageUrl,
                        borderRadius: BorderRadius.zero,
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),

                  // Restaurant Info Body
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            name,
                            style: const TextStyle(
                              fontSize: AppFontSize.h2,
                              fontWeight: AppFontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              AppRatingStars(rating: rating, size: 16, showScoreText: true),
                              const SizedBox(width: 6),
                              Text(
                                '($totalReviews đánh giá)',
                                style: const TextStyle(
                                  fontSize: AppFontSize.xs,
                                  color: AppColors.textSecondaryLight,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              const Icon(Iconsax.location, size: 14, color: AppColors.textSecondaryLight),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  address,
                                  style: const TextStyle(
                                    fontSize: AppFontSize.xs,
                                    color: AppColors.textSecondaryLight,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          const Divider(height: 1, color: AppColors.dividerLight),
                          const SizedBox(height: 12),

                          // Category Chips
                          if (categories.isNotEmpty) ...[
                            SingleChildScrollView(
                              scrollDirection: Axis.horizontal,
                              child: Row(
                                children: List.generate(categories.length, (index) {
                                  final cat = categories[index];
                                  final catName = cat['name'] as String? ?? 'Menu';
                                  return AppFilterChip(
                                    label: catName,
                                    isSelected: _selectedCategoryIndex == index,
                                    onTap: () => setState(() => _selectedCategoryIndex = index),
                                  );
                                }),
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],
                        ],
                      ),
                    ),
                  ),

                  // Menu Items Sliver
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 90),
                    sliver: currentItems.isEmpty
                        ? const SliverToBoxAdapter(
                            child: AppEmptyState(
                              icon: Iconsax.cake,
                              title: 'Danh mục chưa có món',
                              description: 'Quán ăn đang chuẩn bị thực đơn cho danh mục này.',
                            ),
                          )
                        : SliverList(
                            delegate: SliverChildBuilderDelegate(
                              (context, index) {
                                final item = currentItems[index];
                                return MenuItemTile(
                                  item: item,
                                  onAdd: () => _handleAddItem(item, name),
                                );
                              },
                              childCount: currentItems.length,
                            ),
                          ),
                  ),
                ],
              ),

              // Bottom Cart Floating Bar
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: CartBottomFloatingBar(
                  totalCount: cart.totalCount,
                  totalMoney: cart.total,
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
