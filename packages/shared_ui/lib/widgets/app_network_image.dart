import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shimmer/shimmer.dart';
import '../theme/app_theme.dart';

/// Reusable network image with Shimmer loading effect and error fallback
class AppNetworkImage extends StatelessWidget {
  final String? imageUrl;
  final double? width;
  final double? height;
  final BorderRadius borderRadius;
  final BoxFit fit;
  final IconData errorIcon;
  final Color? placeholderColor;

  const AppNetworkImage({
    super.key,
    required this.imageUrl,
    this.width,
    this.height,
    this.borderRadius = const BorderRadius.all(AppRadius.md),
    this.fit = BoxFit.cover,
    this.errorIcon = Iconsax.image,
    this.placeholderColor,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (imageUrl == null || imageUrl!.trim().isEmpty) {
      return _buildFallback(isDark);
    }

    return ClipRRect(
      borderRadius: borderRadius,
      child: CachedNetworkImage(
        imageUrl: imageUrl!,
        width: width,
        height: height,
        fit: fit,
        placeholder: (context, url) => Shimmer.fromColors(
          baseColor: isDark ? AppColors.surfaceAltDark : Colors.grey.shade300,
          highlightColor: isDark ? AppColors.surfaceDark : Colors.grey.shade100,
          child: Container(
            width: width,
            height: height,
            color: placeholderColor ??
                (isDark ? AppColors.surfaceAltDark : AppColors.surfaceAltLight),
          ),
        ),
        errorWidget: (context, url, error) => _buildFallback(isDark),
      ),
    );
  }

  Widget _buildFallback(bool isDark) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: placeholderColor ??
            (isDark ? AppColors.surfaceAltDark : AppColors.surfaceAltLight),
        borderRadius: borderRadius,
      ),
      child: Center(
        child: Icon(
          errorIcon,
          color: AppColors.textHintLight,
          size: (height != null && height! < 40) ? 16 : 24,
        ),
      ),
    );
  }
}
