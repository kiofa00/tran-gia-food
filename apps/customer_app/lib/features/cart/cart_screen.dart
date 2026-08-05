import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import 'package:iconsax/iconsax.dart';
import 'package:go_router/go_router.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final _voucherController = TextEditingController();
  int _discount = 0;

  void _applyVoucher() {
    if (_voucherController.text.toUpperCase() == 'SUMMER20') {
      setState(() => _discount = 20000);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Áp dụng mã giảm 20.000đ thành công! 🎉')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    const subtotal = 130000;
    const shipFee = 16000;
    final total = (subtotal + shipFee - _discount).clamp(0, 9999999);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Giỏ Hàng Của Bạn 🛒', style: TextStyle(fontWeight: FontWeight.bold)),
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
            // Restaurant Header Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: const BoxDecoration(
                color: AppColors.surfaceAltLight,
                borderRadius: BorderRadius.all(AppRadius.md),
              ),
              child: const Row(
                children: [
                  Icon(Iconsax.shop, color: AppColors.primary),
                  SizedBox(width: 10),
                  Text('Phở Bắc Hà — Nguyễn Trãi', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Cart Items
            _buildCartRow('Phở Bò Tái Nạm', 2, 130000),
            const Divider(height: 28),

            // Voucher Input
            Row(
              children: [
                Expanded(
                  child: AppTextField(
                    hintText: 'Nhập mã voucher (vd: SUMMER20)',
                    controller: _voucherController,
                    prefixIcon: Iconsax.ticket_discount,
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton(
                  onPressed: _applyVoucher,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(AppRadius.sm)),
                  ),
                  child: const Text('Áp Dụng', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 28),

            // Order Summary
            const Text('Chi Tiết Thanh Toán', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _buildSummaryRow('Tiền đồ ăn', '130.000đ'),
            const SizedBox(height: 8),
            _buildSummaryRow('Phí giao hàng (1.8 km)', '16.000đ'),
            if (_discount > 0) ...[
              const SizedBox(height: 8),
              _buildSummaryRow('Giảm giá Voucher', '-20.000đ', color: AppColors.success),
            ],
            const Divider(height: 24),
            _buildSummaryRow('Tổng cộng', '${total.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ', isBold: true),
            const SizedBox(height: 40),

            // Checkout Button
            AppButton(
              text: 'Đặt Đơn Hàng ngay (${total.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ)',
              onPressed: () => context.push('/checkout'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCartRow(String name, int qty, int price) {
    return Row(
      children: [
        Text('${qty}x', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary, fontSize: 16)),
        const SizedBox(width: 12),
        Expanded(child: Text(name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15))),
        Text('${price.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
      ],
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isBold = false, Color? color}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(fontSize: isBold ? 16 : 14, fontWeight: isBold ? FontWeight.bold : FontWeight.normal)),
        Text(value, style: TextStyle(fontSize: isBold ? 18 : 14, fontWeight: isBold ? FontWeight.bold : FontWeight.w600, color: color ?? (isBold ? AppColors.primary : null))),
      ],
    );
  }
}
