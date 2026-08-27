import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

class HomePromoBanner extends StatelessWidget {
  final Map<String, dynamic>? voucher;

  const HomePromoBanner({super.key, this.voucher});

  @override
  Widget build(BuildContext context) {
    if (voucher == null) {
      return InkWell(
        onTap: () => context.push('/vouchers'),
        borderRadius: const BorderRadius.all(AppRadius.lg),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(18),
          decoration: const BoxDecoration(
            gradient: AppGradients.primaryGradient,
            borderRadius: BorderRadius.all(AppRadius.lg),
            boxShadow: AppShadows.md,
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.25),
                        borderRadius: const BorderRadius.all(AppRadius.full),
                      ),
                      child: const Text(
                        'ƯU ĐÃI ĐẶC BIỆT',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: AppFontSize.xs,
                          fontWeight: AppFontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Giảm Đến 50% Cho Đơn Hàng Đầu Tiên',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: AppFontSize.lg,
                        fontWeight: AppFontWeight.bold,
                        height: 1.2,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: () => context.push('/vouchers'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: AppColors.primary,
                  shape: const RoundedRectangleBorder(
                    borderRadius: BorderRadius.all(AppRadius.full),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                ),
                child: const Text('Xem Ngay', style: TextStyle(fontWeight: AppFontWeight.bold)),
              ),
            ],
          ),
        ),
      );
    }

    final code = (voucher!['code'] as String? ?? 'VOUCHER').toUpperCase();
    final discountVal = voucher!['discountValue'] != null
        ? '${voucher!['discountValue']}%'
        : 'Đặc Quyền';
    final title = voucher!['title'] as String? ?? 'Ưu Đãi Đặc Biệt Hôm Nay';

    return InkWell(
      onTap: () => context.push('/vouchers'),
      borderRadius: const BorderRadius.all(AppRadius.lg),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: const BoxDecoration(
          gradient: AppGradients.primaryGradient,
          borderRadius: BorderRadius.all(AppRadius.lg),
          boxShadow: AppShadows.md,
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.25),
                      borderRadius: const BorderRadius.all(AppRadius.full),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Iconsax.ticket_discount, color: Colors.white, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          'MÃ: $code',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: AppFontSize.xs,
                            fontWeight: AppFontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: AppFontSize.base,
                      fontWeight: AppFontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Nhập mã $code để nhận ưu đãi $discountVal',
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: AppFontSize.xs,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            ElevatedButton(
              onPressed: () => context.push('/vouchers'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: AppColors.primary,
                shape: const RoundedRectangleBorder(
                  borderRadius: BorderRadius.all(AppRadius.full),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              ),
              child: const Text('Lấy Mã', style: TextStyle(fontWeight: AppFontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
