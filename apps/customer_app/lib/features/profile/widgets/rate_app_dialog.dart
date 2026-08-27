import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

import '../../../../core/providers/api_client_provider.dart';

import '../../../../core/providers/app_info_provider.dart';

class RateAppDialog extends ConsumerStatefulWidget {
  const RateAppDialog({super.key});

  static Future<void> show(BuildContext context) {
    return showDialog(
      context: context,
      builder: (ctx) => const RateAppDialog(),
    );
  }

  @override
  ConsumerState<RateAppDialog> createState() => _RateAppDialogState();
}

class _RateAppDialogState extends ConsumerState<RateAppDialog> {
  int _rating = 5;
  final _commentController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  String _detectPlatform() {
    if (kIsWeb) return 'web';
    try {
      if (Platform.isAndroid) return 'android';
      if (Platform.isIOS) return 'ios';
    } catch (_) {}
    return 'web';
  }

  Future<void> _submitFeedback() async {
    if (_isSubmitting) return;
    setState(() => _isSubmitting = true);

    final api = ref.read(apiClientProvider);
    final rating = _rating;
    final comment = _commentController.text.trim();

    try {
      String? appVersion;
      try {
        final info = await ref.read(appInfoProvider.future);
        appVersion = '${info.version}+${info.buildNumber}';
      } catch (_) {}

      await api.post('/feedback', {
        'rating': rating,
        if (comment.isNotEmpty) 'comment': comment,
        'platform': _detectPlatform(),
        if (appVersion != null) 'appVersion': appVersion,
      }, auth: false);

      if (!mounted) return;
      Navigator.pop(context);

      final String message = rating >= 4
          ? '⭐ Cảm ơn bạn đã đánh giá $rating sao cho Tran Gia Food!'
          : '💬 Cảm ơn bạn đã đóng góp ý kiến! Đội ngũ Tran Gia Food đã tiếp nhận để cải thiện dịch vụ.';

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: rating >= 4 ? AppColors.success : AppColors.primary,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Không thể gửi đánh giá lúc này. Vui lòng thử lại sau.',
          ),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.all(AppRadius.lg),
      ),
      title: const Row(
        children: [
          Icon(Iconsax.star, color: AppColors.warning),
          SizedBox(width: 8),
          Text('Đánh Giá Ứng Dụng'),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text(
            'Ý kiến đóng góp của bạn sẽ giúp Tran Gia Food ngày càng hoàn thiện hơn!',
            style: TextStyle(
              fontSize: AppFontSize.sm,
              color: AppColors.textSecondaryLight,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          AppRatingStars(
            rating: _rating.toDouble(),
            size: 36,
            onRatingChanged: (newRating) {
              setState(() => _rating = newRating);
            },
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _commentController,
            maxLines: 3,
            decoration: const InputDecoration(
              hintText: 'Nhập cảm nhận của bạn về ứng dụng...',
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: _isSubmitting ? null : () => Navigator.pop(context),
          child: const Text(
            'Để sau',
            style: TextStyle(color: AppColors.textSecondaryLight),
          ),
        ),
        ElevatedButton(
          onPressed: _isSubmitting ? null : _submitFeedback,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.all(AppRadius.sm),
            ),
          ),
          child: _isSubmitting
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                )
              : const Text(
                  'Gửi đánh giá',
                  style: TextStyle(color: Colors.white),
                ),
        ),
      ],
    );
  }
}
