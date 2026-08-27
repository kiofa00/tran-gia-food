import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import '../theme/app_theme.dart';

/// Restaurant card widget displaying cover, name, rating, distance and ETA
class RestaurantCard extends StatelessWidget {
  final String id;
  final String name;
  final String? coverImageUrl;
  final double rating;
  final int totalReviews;
  final double? distanceKm;
  final String address;
  final bool isOpen;
  final VoidCallback? onTap;

  const RestaurantCard({
    super.key,
    required this.id,
    required this.name,
    this.coverImageUrl,
    required this.rating,
    required this.totalReviews,
    this.distanceKm,
    required this.address,
    this.isOpen = true,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final int? estimatedMin = distanceKm != null
        ? (distanceKm! * 5 + 10).round()
        : null;

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
                  child: coverImageUrl != null && coverImageUrl!.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: coverImageUrl!,
                          height: 140,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          placeholder: (context, url) => Container(
                            height: 140,
                            color: isDark
                                ? AppColors.surfaceAltDark
                                : AppColors.surfaceAltLight,
                          ),
                          errorWidget: (context, url, error) => Container(
                            height: 140,
                            color: AppColors.primaryLight.withValues(
                              alpha: 0.2,
                            ),
                            child: const Icon(
                              Iconsax.shop,
                              size: 40,
                              color: AppColors.primary,
                            ),
                          ),
                        )
                      : Container(
                          height: 140,
                          width: double.infinity,
                          color: isDark
                              ? AppColors.surfaceAltDark
                              : AppColors.surfaceAltLight,
                          child: const Icon(
                            Iconsax.shop,
                            size: 40,
                            color: AppColors.textSecondaryLight,
                          ),
                        ),
                ),
                // Status badge
                Positioned(
                  top: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: isOpen ? AppColors.success : AppColors.error,
                      borderRadius: const BorderRadius.all(AppRadius.full),
                    ),
                    child: Text(
                      isOpen ? 'Đang mở' : 'Đã đóng',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: AppFontSize.xs,
                        fontWeight: AppFontWeight.bold,
                      ),
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
                      fontSize: AppFontSize.title,
                      fontWeight: AppFontWeight.bold,
                      color: isDark
                          ? AppColors.textPrimaryDark
                          : AppColors.textPrimaryLight,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),

                  // Rating, distance, ETA
                  Row(
                    children: [
                      const Icon(
                        Icons.star_rounded,
                        size: 18,
                        color: AppColors.warning,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        rating > 0 ? rating.toStringAsFixed(1) : 'Mới',
                        style: const TextStyle(
                          fontSize: AppFontSize.body,
                          fontWeight: AppFontWeight.bold,
                        ),
                      ),
                      if (totalReviews > 0)
                        Text(
                          ' ($totalReviews)',
                          style: TextStyle(
                            fontSize: AppFontSize.sm,
                            color: isDark
                                ? AppColors.textSecondaryDark
                                : AppColors.textSecondaryLight,
                          ),
                        ),
                      if (distanceKm != null) ...[
                        const SizedBox(width: 12),
                        const Icon(
                          Iconsax.location5,
                          size: 15,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            '${distanceKm!.toStringAsFixed(1)} km',
                            style: TextStyle(
                              fontSize: AppFontSize.body,
                              color: isDark
                                  ? AppColors.textSecondaryDark
                                  : AppColors.textSecondaryLight,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ] else ...[
                        const Spacer(),
                      ],
                      if (estimatedMin != null) ...[
                        const SizedBox(width: 8),
                        const Icon(
                          Iconsax.clock5,
                          size: 15,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '$estimatedMin phút',
                          style: TextStyle(
                            fontSize: AppFontSize.body,
                            color: isDark
                                ? AppColors.textSecondaryDark
                                : AppColors.textSecondaryLight,
                          ),
                        ),
                      ],
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
