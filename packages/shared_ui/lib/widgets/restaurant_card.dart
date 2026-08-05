import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:iconsax/iconsax.dart';
import '../theme/app_theme.dart';

/// Restaurant card widget displaying cover, name, rating, distance and ETA
class RestaurantCard extends StatelessWidget {
  final String id;
  final String name;
  final String? coverImageUrl;
  final double rating;
  final int totalReviews;
  final double distanceKm;
  final String address;
  final bool isOpen;
  final VoidCallback? onTap;

  const RestaurantCard({
    super.key,
    required this.id,
    required this.name,
    this.coverImageUrl,
    this.rating = 5.0,
    this.totalReviews = 0,
    this.distanceKm = 1.2,
    required this.address,
    this.isOpen = true,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final estimatedMin = (distanceKm * 5 + 10).round(); // rough ETA calculation

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
          borderRadius: const BorderRadius.all(AppRadius.md),
          boxShadow: AppShadows.sm,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image with badge
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: AppRadius.md),
                  child: CachedNetworkImage(
                    imageUrl: coverImageUrl ?? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
                    height: 140,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(
                      height: 140,
                      color: isDark ? AppColors.surfaceAltDark : AppColors.surfaceAltLight,
                    ),
                    errorWidget: (context, url, error) => Container(
                      height: 140,
                      color: AppColors.primaryLight.withOpacity(0.2),
                      child: const Icon(Iconsax.shop, size: 40, color: AppColors.primary),
                    ),
                  ),
                ),
                // Status badge
                Positioned(
                  top: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: isOpen ? AppColors.success : AppColors.error,
                      borderRadius: const BorderRadius.all(AppRadius.full),
                    ),
                    child: Text(
                      isOpen ? 'Đang mở' : 'Đã đóng',
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
              ],
            ),

            // Content
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),

                  // Rating, distance, ETA
                  Row(
                    children: [
                      const Icon(Icons.star_rounded, size: 18, color: AppColors.warning),
                      const SizedBox(width: 4),
                      Text(
                        rating.toStringAsFixed(1),
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                      ),
                      Text(
                        ' ($totalReviews)',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Icon(Iconsax.location5, size: 15, color: AppColors.primary),
                      const SizedBox(width: 4),
                      Text(
                        '${distanceKm.toStringAsFixed(1)} km',
                        style: TextStyle(
                          fontSize: 13,
                          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                        ),
                      ),
                      const Spacer(),
                      const Icon(Iconsax.clock5, size: 15, color: AppColors.primary),
                      const SizedBox(width: 4),
                      Text(
                        '$estimatedMin min',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
