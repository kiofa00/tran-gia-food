import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import 'package:iconsax/iconsax.dart';
import 'package:go_router/go_router.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  String _paymentMethod = 'cash';
  bool _isPlacingOrder = false;

  void _placeOrder() async {
    setState(() => _isPlacingOrder = true);
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('🎉 Đặt đơn hàng thành công! Quán đang nhận đơn.')),
      );
      context.go('/main');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Xác Nhận Đơn Hàng 📝', style: TextStyle(fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Delivery Address Card
            const Text('Địa Chỉ Giao Hàng', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: AppColors.surfaceAltLight,
                borderRadius: BorderRadius.all(AppRadius.md),
              ),
              child: const Row(
                children: [
                  Icon(Iconsax.location5, color: AppColors.primary, size: 28),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Nguyễn Văn A — 090 123 4567', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        SizedBox(height: 4),
                        Text('123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM', style: TextStyle(fontSize: 13, color: AppColors.textSecondaryLight)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Payment Method Selector
            const Text('Phương Thức Thanh Toán', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            _buildPaymentOption('cash', 'Tiền mặt khi nhận hàng (COD)', Iconsax.money_change),
            _buildPaymentOption('momo', 'Ví Điện Tử MoMo', Iconsax.wallet_3),
            _buildPaymentOption('vnpay', 'Cổng Thanh Toán VNPay', Iconsax.card),
            const SizedBox(height: 24),

            // Driver Note Input
            const AppTextField(
              labelText: 'Ghi chú cho tài xế / nhà hàng',
              hintText: 'VD: Đồ ăn cho nhiều ớt, gõ cửa khi đến...',
              prefixIcon: Iconsax.edit_2,
            ),
            const SizedBox(height: 40),

            // Submit Order Button
            AppButton(
              text: 'Xác Nhận Đặt Đơn (126.000đ)',
              isLoading: _isPlacingOrder,
              onPressed: _placeOrder,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentOption(String value, String title, IconData icon) {
    final isSelected = _paymentMethod == value;

    return GestureDetector(
      onTap: () => setState(() => _paymentMethod = value),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryLight.withOpacity(0.15) : AppColors.surfaceAltLight,
          borderRadius: const BorderRadius.all(AppRadius.md),
          border: Border.all(color: isSelected ? AppColors.primary : Colors.transparent, width: 1.5),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? AppColors.primary : AppColors.textSecondaryLight),
            const SizedBox(width: 12),
            Expanded(child: Text(title, style: TextStyle(fontWeight: isSelected ? FontWeight.bold : FontWeight.w500, fontSize: 14))),
            if (isSelected) const Icon(Icons.check_circle_rounded, color: AppColors.primary),
          ],
        ),
      ),
    );
  }
}
