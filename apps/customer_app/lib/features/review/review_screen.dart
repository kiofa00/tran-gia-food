import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class ReviewScreen extends ConsumerStatefulWidget {
  final String orderId;

  const ReviewScreen({super.key, required this.orderId});

  @override
  ConsumerState<ReviewScreen> createState() => _ReviewScreenState();
}

class _ReviewScreenState extends ConsumerState<ReviewScreen> {
  int _restaurantRating = 0;
  int _shipperRating = 0;
  final _commentController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_restaurantRating == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn số sao cho nhà hàng')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final api = ref.read(apiClientProvider);
      await api.post('/reviews', {
        'orderId': widget.orderId,
        'restaurantRating': _restaurantRating,
        'shipperRating': _shipperRating > 0 ? _shipperRating : null,
        'comment': _commentController.text.trim().isEmpty
            ? null
            : _commentController.text.trim(),
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cảm ơn bạn đã đánh giá! ⭐'),
            backgroundColor: AppColors.success,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Đánh Giá Đơn Hàng ⭐', style: TextStyle(fontWeight: AppFontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Restaurant rating
            _RatingSection(
              icon: Iconsax.shop,
              title: 'Nhà Hàng',
              subtitle: 'Chất lượng đồ ăn & dịch vụ',
              rating: _restaurantRating,
              onChanged: (v) => setState(() => _restaurantRating = v),
            ),
            const SizedBox(height: 24),

            // Shipper rating
            _RatingSection(
              icon: Iconsax.truck_fast,
              title: 'Tài Xế Giao Hàng',
              subtitle: 'Tốc độ & thái độ phục vụ (không bắt buộc)',
              rating: _shipperRating,
              onChanged: (v) => setState(() => _shipperRating = v),
            ),
            const SizedBox(height: 24),

            // Comment
            const Text(
              'Nhận Xét Chi Tiết',
              style: TextStyle(fontSize: AppFontSize.title, fontWeight: AppFontWeight.bold),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _commentController,
              maxLines: 4,
              maxLength: 300,
              decoration: InputDecoration(
                hintText: 'Chia sẻ trải nghiệm của bạn... (không bắt buộc)',
                hintStyle: const TextStyle(color: AppColors.textSecondaryLight),
                filled: true,
                fillColor: AppColors.surfaceAltLight,
                border: OutlineInputBorder(
                  borderRadius: const BorderRadius.all(AppRadius.md),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: const BorderRadius.all(AppRadius.md),
                  borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                ),
              ),
            ),

            const SizedBox(height: 32),

            AppButton(
              text: 'Gửi Đánh Giá',
              isLoading: _isSubmitting,
              onPressed: _submit,
            ),
          ],
        ),
      ),
    );
  }
}

class _RatingSection extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final int rating;
  final ValueChanged<int> onChanged;

  const _RatingSection({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.rating,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: AppColors.surfaceLight,
        borderRadius: BorderRadius.all(AppRadius.md),
        boxShadow: AppShadows.sm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: AppColors.primary),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.md)),
                  Text(subtitle, style: const TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(5, (i) {
              final starIndex = i + 1;
              return GestureDetector(
                onTap: () => onChanged(starIndex),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: Icon(
                    starIndex <= rating ? Iconsax.star5 : Iconsax.star,
                    color: starIndex <= rating ? AppColors.warning : AppColors.textSecondaryLight,
                    size: 36,
                  ),
                ),
              );
            }),
          ),
          if (rating > 0) ...[
            const SizedBox(height: 8),
            Center(
              child: Text(
                _ratingLabel(rating),
                style: const TextStyle(
                  color: AppColors.primary,
                  fontWeight: AppFontWeight.bold,
                  fontSize: AppFontSize.body,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _ratingLabel(int r) => switch (r) {
        1 => 'Rất tệ 😞',
        2 => 'Không hài lòng 😕',
        3 => 'Bình thường 😐',
        4 => 'Hài lòng 😊',
        5 => 'Xuất sắc 🤩',
        _ => '',
      };
}
