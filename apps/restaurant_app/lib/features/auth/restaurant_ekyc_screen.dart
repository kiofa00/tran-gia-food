import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

/// Màn hình xác thực danh tính & giấy phép đối tác nhà hàng (eKYC)
class RestaurantEkycScreen extends StatefulWidget {
  const RestaurantEkycScreen({super.key});

  @override
  State<RestaurantEkycScreen> createState() => _RestaurantEkycScreenState();
}

class _RestaurantEkycScreenState extends State<RestaurantEkycScreen> {
  bool _hasFrontCccd = false;
  bool _hasBackCccd = false;
  bool _hasBusinessLicense = false;
  bool _hasFoodSafetyCert = false;

  final _taxCodeController = TextEditingController();
  final _bankAccountController = TextEditingController();
  final _bankNameController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _taxCodeController.dispose();
    _bankAccountController.dispose();
    _bankNameController.dispose();
    super.dispose();
  }

  void _handleSubmit() async {
    if (!_hasFrontCccd || !_hasBackCccd || !_hasBusinessLicense) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng tải lên đủ ảnh CCCD và Giấy phép ĐKKD'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      setState(() => _isSubmitting = false);
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(AppRadius.md)),
          title: const Row(
            children: [
              Icon(Iconsax.verify5, color: AppColors.success, size: 28),
              SizedBox(width: 10),
              Text('Gửi Hồ Sơ Thành Công'),
            ],
          ),
          content: const Text(
            'Hồ sơ của bạn đã được gửi tới Ban Quản Trị Tran Gia Food. Chúng tôi sẽ phê duyệt trong vòng 24 giờ làm việc.',
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                context.go('/orders');
              },
              child: const Text('Đi Đến Bàn Quản Trị'),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Xác Thực Hồ Sơ Đối Tác', style: TextStyle(fontWeight: AppFontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Iconsax.arrow_left),
          onPressed: () => context.canPop() ? context.pop() : context.go('/orders'),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Banner info
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: AppGradients.orangeGradient,
              borderRadius: const BorderRadius.all(AppRadius.md),
            ),
            child: const Row(
              children: [
                Icon(Iconsax.shield_tick5, color: Colors.white, size: 36),
                SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Xác Minh Danh Tính (eKYC)',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: AppFontSize.title,
                          fontWeight: AppFontWeight.bold,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Cung cấp giấy tờ để kích hoạt tính năng nhận đơn và nhận tiền doanh thu.',
                        style: TextStyle(color: Colors.white70, fontSize: AppFontSize.sm),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // 1. CCCD
          const Text(
            '1. CCCD Người Đại Diện Pháp Luật',
            style: TextStyle(fontSize: AppFontSize.lg, fontWeight: AppFontWeight.bold),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _DocUploadBox(
                  title: 'Mặt trước CCCD',
                  isUploaded: _hasFrontCccd,
                  onTap: () => setState(() => _hasFrontCccd = !_hasFrontCccd),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _DocUploadBox(
                  title: 'Mặt sau CCCD',
                  isUploaded: _hasBackCccd,
                  onTap: () => setState(() => _hasBackCccd = !_hasBackCccd),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // 2. Business Documents
          const Text(
            '2. Giấy Phép Kinh Doanh & ATTP',
            style: TextStyle(fontSize: AppFontSize.lg, fontWeight: AppFontWeight.bold),
          ),
          const SizedBox(height: 12),
          _DocUploadBox(
            title: 'Giấy phép Đăng Ký Kinh Doanh (ĐKKD / Hộ kinh doanh)',
            isUploaded: _hasBusinessLicense,
            onTap: () => setState(() => _hasBusinessLicense = !_hasBusinessLicense),
          ),
          const SizedBox(height: 12),
          _DocUploadBox(
            title: 'Giấy chứng nhận Vệ Sinh An Toàn Thực Phẩm (ATTP)',
            isUploaded: _hasFoodSafetyCert,
            onTap: () => setState(() => _hasFoodSafetyCert = !_hasFoodSafetyCert),
          ),
          const SizedBox(height: 24),

          // 3. Tax & Bank Info
          const Text(
            '3. Tài Khoản Nhận Doanh Thu & Thuế',
            style: TextStyle(fontSize: AppFontSize.lg, fontWeight: AppFontWeight.bold),
          ),
          const SizedBox(height: 14),

          AppTextField(
            labelText: 'Mã số thuế quán (nếu có)',
            hintText: '0312345678',
            controller: _taxCodeController,
            keyboardType: TextInputType.number,
            prefixIcon: Iconsax.receipt_item,
          ),
          const SizedBox(height: 14),

          AppTextField(
            labelText: 'Tên Ngân Hàng',
            hintText: 'Vietcombank / Techcombank / MB Bank',
            controller: _bankNameController,
            prefixIcon: Iconsax.bank,
          ),
          const SizedBox(height: 14),

          AppTextField(
            labelText: 'Số Tài Khoản Ngân Hàng',
            hintText: '1029384756',
            controller: _bankAccountController,
            keyboardType: TextInputType.number,
            prefixIcon: Iconsax.card,
          ),
          const SizedBox(height: 32),

          AppButton(
            text: 'Gửi Hồ Sơ Xác Thực',
            isLoading: _isSubmitting,
            onPressed: _handleSubmit,
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

class _DocUploadBox extends StatelessWidget {
  final String title;
  final bool isUploaded;
  final VoidCallback onTap;

  const _DocUploadBox({
    required this.title,
    required this.isUploaded,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 110,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isUploaded
              ? AppColors.success.withValues(alpha: 0.08)
              : AppColors.surfaceAltLight,
          borderRadius: const BorderRadius.all(AppRadius.md),
          border: Border.all(
            color: isUploaded ? AppColors.success : AppColors.dividerLight,
            width: isUploaded ? 1.5 : 1.0,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isUploaded ? Iconsax.tick_circle5 : Iconsax.camera,
              color: isUploaded ? AppColors.success : AppColors.primary,
              size: 26,
            ),
            const SizedBox(height: 6),
            Text(
              title,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: AppFontSize.xs,
                fontWeight: isUploaded ? AppFontWeight.bold : AppFontWeight.medium,
                color: isUploaded ? AppColors.success : AppColors.textPrimaryLight,
              ),
            ),
            if (isUploaded)
              const Text(
                'Đã tải lên ✓',
                style: TextStyle(fontSize: 10, color: AppColors.success, fontWeight: FontWeight.bold),
              ),
          ],
        ),
      ),
    );
  }
}
