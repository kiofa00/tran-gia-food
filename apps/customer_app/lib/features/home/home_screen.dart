import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

import '../../../core/providers/api_client_provider.dart';
import '../../../core/providers/location_provider.dart';
import 'widgets/home_location_header.dart';
import 'widgets/home_promo_banner.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

class _CategoryNotifier extends Notifier<String> {
  @override
  String build() => 'Tất cả';
  void set(String category) => state = category;
}

final selectedCategoryProvider = NotifierProvider<_CategoryNotifier, String>(
  _CategoryNotifier.new,
);

final nearbyRestaurantsProvider = FutureProvider.autoDispose
    .family<List<Map<String, dynamic>>, String>((ref, category) async {
      final link = ref.keepAlive();
      final timer = Timer(const Duration(minutes: 5), () {
        link.close();
      });
      ref.onDispose(() => timer.cancel());

      final api = ref.read(apiClientProvider);
      final position = await ref.watch(userLocationProvider.future);

      try {
        final queryParams = <String, String>{};
        if (category != 'Tất cả') {
          queryParams['category'] = category;
        }

        final String endpoint;
        if (position != null) {
          endpoint = '/restaurants/nearby';
          queryParams['lat'] = position.latitude.toString();
          queryParams['lng'] = position.longitude.toString();
        } else {
          endpoint = '/restaurants';
        }

        final result = await api.get(
          endpoint,
          query: queryParams.isNotEmpty ? queryParams : null,
          auth: false,
        );
        final raw = result['data'] ?? result;
        if (raw is List) {
          return raw.cast<Map<String, dynamic>>();
        }
        return [];
      } catch (_) {
        return [];
      }
    });

final homeVouchersProvider =
    FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
      final link = ref.keepAlive();
      final timer = Timer(const Duration(minutes: 5), () {
        link.close();
      });
      ref.onDispose(() => timer.cancel());

      final api = ref.read(apiClientProvider);
      try {
        final result = await api.get('/vouchers/active', auth: false);
        final raw = result['data'] ?? result;
        if (raw is List) {
          return raw.cast<Map<String, dynamic>>();
        }
        return [];
      } catch (_) {
        return [];
      }
    });

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  static const categories = [
    'Tất cả',
    'Cơm & Phở',
    'Trà Sữa & Cafe',
    'Bánh Mì',
    'Đồ Ăn Vặt',
    'Pizza & Burger',
    'Lành Mạnh',
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedCategory = ref.watch(selectedCategoryProvider);
    final restaurantsAsync = ref.watch(
      nearbyRestaurantsProvider(selectedCategory),
    );
    final vouchersAsync = ref.watch(homeVouchersProvider);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async {
            ref.invalidate(nearbyRestaurantsProvider(selectedCategory));
            ref.invalidate(homeVouchersProvider);
          },
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(18.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Location Bar
                const HomeLocationHeader(),
                const SizedBox(height: 18),

                // Search Bar trigger
                AppSearchBar(
                  readOnly: true,
                  hintText: 'Tìm món ăn, trà sữa, phở bò...',
                  onTap: () => context.push('/search'),
                ),
                const SizedBox(height: 20),

                // Banner Voucher Promotion Card
                vouchersAsync.when(
                  loading: () => const SizedBox.shrink(),
                  error: (_, _) => const SizedBox.shrink(),
                  data: (vouchers) => HomePromoBanner(
                    voucher: vouchers.isNotEmpty ? vouchers.first : null,
                  ),
                ),
                const SizedBox(height: 24),

                // Category List Section
                AppSectionHeader(
                  title: 'Khám Phá Danh Mục',
                  padding: EdgeInsets.zero,
                ),
                const SizedBox(height: 10),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: categories.map((cat) {
                      return AppFilterChip(
                        label: cat,
                        isSelected: selectedCategory == cat,
                        onTap: () => ref
                            .read(selectedCategoryProvider.notifier)
                            .set(cat),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 24),

                // Nearby Restaurants Section
                AppSectionHeader(
                  title: 'Quán Ăn Gần Bạn',
                  actionText: 'Xem tất cả',
                  padding: EdgeInsets.zero,
                  onAction: () => context.push('/search'),
                ),
                const SizedBox(height: 12),

                restaurantsAsync.when(
                  loading: () => const Center(
                    child: Padding(
                      padding: EdgeInsets.all(32),
                      child: CircularProgressIndicator(),
                    ),
                  ),
                  error: (_, _) => const AppEmptyState(
                    icon: Iconsax.shop,
                    title: 'Không có quán ăn nào',
                    description:
                        'Hiện chưa tìm thấy quán ăn nào trong khu vực này.',
                  ),
                  data: (restaurants) {
                    if (restaurants.isEmpty) {
                      return const AppEmptyState(
                        icon: Iconsax.shop,
                        title: 'Không có quán ăn nào',
                        description:
                            'Hiện chưa tìm thấy quán ăn nào trong danh mục này.',
                      );
                    }
                    return ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: restaurants.length,
                      itemBuilder: (context, index) {
                        final r = restaurants[index];
                        return RestaurantCard(
                          id: r['id'] as String? ?? '',
                          name: r['name'] as String? ?? 'Quán Ăn',
                          address:
                              r['address'] as String? ??
                              'Địa chỉ đang cập nhật',
                          rating:
                              (r['avgRating'] as num?)?.toDouble() ??
                              (r['rating'] as num?)?.toDouble() ??
                              0.0,
                          totalReviews:
                              (r['totalReviews'] as num?)?.toInt() ?? 0,
                          distanceKm:
                              (r['distance_km'] as num?)?.toDouble() ??
                              (r['distanceKm'] as num?)?.toDouble(),
                          isOpen: r['isOpen'] as bool? ?? true,
                          coverImageUrl: r['coverImageUrl'] as String?,
                          onTap: () => context.push(
                            '/restaurant/${r['id']}?name=${Uri.encodeComponent(r['name'] as String? ?? '')}',
                          ),
                        );
                      },
                    );
                  },
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
