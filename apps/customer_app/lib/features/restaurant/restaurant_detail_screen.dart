import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import 'package:iconsax/iconsax.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';

class RestaurantDetailScreen extends StatefulWidget {
  final String restaurantId;
  final String restaurantName;

  const RestaurantDetailScreen({
    super.key,
    required this.restaurantId,
    this.restaurantName = 'Phở Bắc Hà — Nguyễn Trãi',
  });

  @override
  State<RestaurantDetailScreen> createState() => _RestaurantDetailScreenState();
}

class _RestaurantDetailScreenState extends State<RestaurantDetailScreen> {
  final Map<String, int> _cart = {};

  void _addItem(String id) {
    setState(() => _cart[id] = (_cart[id] ?? 0) + 1);
  }

  void _removeItem(String id) {
    if ((_cart[id] ?? 0) > 0) {
      setState(() {
        _cart[id] = _cart[id]! - 1;
        if (_cart[id] == 0) _cart.remove(id);
      });
    }
  }

  int get _totalCartCount => _cart.values.fold(0, (sum, count) => sum + count);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Header Image Sliver
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            backgroundColor: AppColors.primary,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
              onPressed: () => context.pop(),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: CachedNetworkImage(
                imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800',
                fit: BoxFit.cover,
              ),
            ),
          ),

          // Restaurant info body
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(18.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.restaurantName,
                    style: const TextStyle(fontSize: AppFontSize.xl, fontWeight: AppFontWeight.extraBold),
                  ),
                  const SizedBox(height: 6),
                  const Row(
                    children: [
                      Icon(Icons.star_rounded, color: AppColors.warning, size: 20),
                      SizedBox(width: 4),
                      Text('4.9 (320 đánh giá)', style: TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.body)),
                      SizedBox(width: 12),
                      Icon(Iconsax.location5, color: AppColors.primary, size: 16),
                      SizedBox(width: 4),
                      Text('0.8 km — 123 Nguyễn Trãi, Q5', style: TextStyle(fontSize: AppFontSize.body)),
                    ],
                  ),
                  const SizedBox(height: 24),
                  const Text('Thực Đơn Món Ăn', style: TextStyle(fontSize: AppFontSize.lg, fontWeight: AppFontWeight.extraBold)),
                  const SizedBox(height: 12),

                  // Menu Items List
                  _buildMenuItem(
                    id: 'm1',
                    name: 'Phở Bò Tái Nạm',
                    description: 'Phở bò Hà Nội truyền thống kèm bánh phở tươi',
                    price: 65000,
                    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300',
                  ),
                  _buildMenuItem(
                    id: 'm2',
                    name: 'Phở Đặc Biệt (Tái, Nạm, Gầu, Bò Viên)',
                    description: 'Tô đặc biệt thịt đầy đặn',
                    price: 85000,
                    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300',
                  ),
                  _buildMenuItem(
                    id: 'm3',
                    name: 'Quẩy Giòn (3 Cái)',
                    description: 'Quẩy chiên giòn ăn kèm phở',
                    price: 15000,
                    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300',
                  ),
                  const SizedBox(height: 80), // Space for bottom bar
                ],
              ),
            ),
          ),
        ],
      ),

      // Bottom Cart Floating Bar
      bottomSheet: _totalCartCount > 0
          ? Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? AppColors.surfaceDark : Colors.white,
                boxShadow: AppShadows.md,
              ),
              child: SafeArea(
                child: AppButton(
                  text: 'Xem Giỏ Hàng ($_totalCartCount món)',
                  icon: Iconsax.shopping_cart,
                  onPressed: () => context.push('/cart'),
                ),
              ),
            )
          : null,
    );
  }

  Widget _buildMenuItem({
    required String id,
    required String name,
    required String description,
    required int price,
    required String imageUrl,
  }) {
    final count = _cart[id] ?? 0;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceAltDark : AppColors.surfaceAltLight,
        borderRadius: const BorderRadius.all(AppRadius.md),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.all(AppRadius.sm),
            child: CachedNetworkImage(
              imageUrl: imageUrl,
              width: 80,
              height: 80,
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.base)),
                const SizedBox(height: 4),
                Text(description, style: const TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight), maxLines: 2),
                const SizedBox(height: 8),
                Text('${price.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ', style: const TextStyle(fontWeight: AppFontWeight.extraBold, color: AppColors.primary, fontSize: AppFontSize.base)),
              ],
            ),
          ),
          const SizedBox(width: 8),

          // Quantity controls
          if (count == 0)
            IconButton(
              icon: const Icon(Iconsax.add_circle5, color: AppColors.primary, size: 32),
              onPressed: () => _addItem(id),
            )
          else
            Row(
              children: [
                IconButton(
                  icon: const Icon(Iconsax.minus_cirlce5, color: AppColors.textSecondaryLight, size: 28),
                  onPressed: () => _removeItem(id),
                ),
                Text('$count', style: const TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.title)),
                IconButton(
                  icon: const Icon(Iconsax.add_circle5, color: AppColors.primary, size: 28),
                  onPressed: () => _addItem(id),
                ),
              ],
            ),
        ],
      ),
    );
  }
}
