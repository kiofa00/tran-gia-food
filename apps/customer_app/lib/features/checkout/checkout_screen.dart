import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

import '../../../core/providers/api_client_provider.dart';
import '../address/providers/address_provider.dart';
import '../cart/cart_provider.dart';
import '../profile/widgets/saved_addresses_bottom_sheet.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  String _paymentMethod = 'cash';
  bool _isPlacingOrder = false;
  final _noteController = TextEditingController();

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  static String _formatMoney(int value) {
    return '${value.toString().replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
        )}đ';
  }

  void _placeOrder() async {
    final cart = ref.read(cartProvider);
    if (cart.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Giỏ hàng của bạn đang trống'),
            backgroundColor: AppColors.warning,
          ),
        );
      }
      return;
    }

    final api = ref.read(apiClientProvider);
    final hasToken = await api.hasToken();
    if (!hasToken) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Vui lòng đăng nhập để tiến hành đặt hàng'),
            backgroundColor: AppColors.warning,
          ),
        );
        context.push('/auth');
      }
      return;
    }

    setState(() => _isPlacingOrder = true);
    try {
      final selectedAddr = ref.read(selectedAddressProvider);
      final deliveryAddress = selectedAddr?.fullAddress ?? '123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM';
      final deliveryLat = selectedAddr?.lat ?? 10.7580;
      final deliveryLng = selectedAddr?.lng ?? 106.6810;

      final payload = <String, dynamic>{
        'restaurantId': cart.restaurantId,
        'items': cart.items.values
            .map((item) => {
                  'itemId': item.id,
                  'quantity': item.quantity,
                })
            .toList(),
        if (cart.appliedVoucher != null) 'voucherCode': cart.appliedVoucher!.code,
        'orderType': 'delivery',
        'paymentMethod': _paymentMethod == 'vnpay' ? 'bank' : _paymentMethod,
        'deliveryAddress': deliveryAddress,
        'deliveryLat': deliveryLat,
        'deliveryLng': deliveryLng,
        'note': _noteController.text.trim().isNotEmpty ? _noteController.text.trim() : null,
      };

      final res = await api.post('/orders', payload);
      final orderId = res['id'] as String? ?? res['data']?['id'] as String? ?? 'new';

      ref.read(cartProvider.notifier).clearCart();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🎉 Đặt đơn hàng thành công! Quán đang nhận đơn.'),
            backgroundColor: AppColors.success,
          ),
        );
        context.go('/tracking/$orderId');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi đặt hàng: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isPlacingOrder = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Xác Nhận Đơn Hàng 📝', style: TextStyle(fontWeight: AppFontWeight.bold)),
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
            // Restaurant info summary
            if (cart.restaurantName != null) ...[
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.surfaceDark : Colors.white,
                  borderRadius: const BorderRadius.all(AppRadius.md),
                  boxShadow: AppShadows.sm,
                ),
                child: Row(
                  children: [
                    const Icon(Iconsax.shop, color: AppColors.primary),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        cart.restaurantName!,
                        style: const TextStyle(
                          fontWeight: AppFontWeight.bold,
                          fontSize: AppFontSize.title,
                        ),
                      ),
                    ),
                    Text(
                      '${cart.totalItemCount} món',
                      style: const TextStyle(
                        fontSize: AppFontSize.sm,
                        color: AppColors.textSecondaryLight,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Delivery Address Card
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Địa Chỉ Giao Hàng', style: TextStyle(fontSize: AppFontSize.title, fontWeight: AppFontWeight.bold)),
                TextButton(
                  onPressed: () => SavedAddressesBottomSheet.show(context),
                  child: const Text('Thay đổi', style: TextStyle(color: AppColors.primary, fontWeight: AppFontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 6),
            InkWell(
              borderRadius: const BorderRadius.all(AppRadius.md),
              onTap: () => SavedAddressesBottomSheet.show(context),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.surfaceDark : Colors.white,
                  borderRadius: const BorderRadius.all(AppRadius.md),
                  boxShadow: AppShadows.sm,
                  border: Border.all(
                    color: AppColors.primary.withValues(alpha: 0.2),
                  ),
                ),
                child: Builder(
                  builder: (ctx) {
                    final selectedAddr = ref.watch(selectedAddressProvider);
                    return Row(
                      children: [
                        const Icon(Iconsax.location5, color: AppColors.primary, size: 28),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                selectedAddr != null
                                    ? selectedAddr.title
                                    : 'Địa chỉ giao nhận',
                                style: const TextStyle(
                                  fontWeight: AppFontWeight.bold,
                                  fontSize: AppFontSize.md,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                selectedAddr != null
                                    ? selectedAddr.fullAddress
                                    : 'Bấm vào đây để chọn hoặc thêm địa chỉ giao hàng',
                                style: const TextStyle(
                                  fontSize: AppFontSize.body,
                                  color: AppColors.textSecondaryLight,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios, size: 16, color: AppColors.textHintLight),
                      ],
                    );
                  },
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Payment Method Selector
            const Text('Phương Thức Thanh Toán', style: TextStyle(fontSize: AppFontSize.title, fontWeight: AppFontWeight.bold)),
            const SizedBox(height: 10),
            _buildPaymentOption('cash', 'Tiền mặt khi nhận hàng (COD)', Iconsax.money_change),
            _buildPaymentOption('momo', 'Ví Điện Tử MoMo', Iconsax.wallet_3),
            _buildPaymentOption('vnpay', 'Cổng Thanh Toán VNPay', Iconsax.card),
            const SizedBox(height: 24),

            // Driver Note Input
            AppTextField(
              controller: _noteController,
              labelText: 'Ghi chú cho tài xế / nhà hàng',
              hintText: 'VD: Đồ ăn cho nhiều ớt, gõ cửa khi đến...',
              prefixIcon: Iconsax.edit_2,
            ),
            const SizedBox(height: 24),

            // Payment Summary
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? AppColors.surfaceDark : Colors.white,
                borderRadius: const BorderRadius.all(AppRadius.md),
                boxShadow: AppShadows.sm,
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Tiền món ăn', style: TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight)),
                      Text(_formatMoney(cart.subtotal), style: const TextStyle(fontSize: AppFontSize.sm, fontWeight: AppFontWeight.semiBold)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Phí giao hàng', style: TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight)),
                      Text(_formatMoney(cart.shippingFee), style: const TextStyle(fontSize: AppFontSize.sm, fontWeight: AppFontWeight.semiBold)),
                    ],
                  ),
                  if (cart.discountAmount > 0) ...[
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Giảm giá (${cart.appliedVoucher?.code})', style: const TextStyle(fontSize: AppFontSize.sm, color: AppColors.success)),
                        Text('-${_formatMoney(cart.discountAmount)}', style: const TextStyle(fontSize: AppFontSize.sm, fontWeight: AppFontWeight.bold, color: AppColors.success)),
                      ],
                    ),
                  ],
                  const Divider(height: 20, color: AppColors.dividerLight),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Tổng thanh toán', style: TextStyle(fontSize: AppFontSize.title, fontWeight: AppFontWeight.bold)),
                      Text(_formatMoney(cart.total), style: const TextStyle(fontSize: AppFontSize.xl, fontWeight: AppFontWeight.extraBold, color: AppColors.primary)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Submit Order Button
            AppButton(
              text: 'Xác Nhận Đặt Đơn (${_formatMoney(cart.total)})',
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
          color: isSelected ? AppColors.primaryLight.withValues(alpha: 0.15) : AppColors.surfaceAltLight,
          borderRadius: const BorderRadius.all(AppRadius.md),
          border: Border.all(color: isSelected ? AppColors.primary : Colors.transparent, width: 1.5),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? AppColors.primary : AppColors.textSecondaryLight),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontWeight: isSelected ? AppFontWeight.bold : AppFontWeight.medium,
                  fontSize: AppFontSize.base,
                  color: isSelected ? AppColors.primary : AppColors.textPrimaryLight,
                ),
              ),
            ),
            if (isSelected) const Icon(Icons.check_circle_rounded, color: AppColors.primary),
          ],
        ),
      ),
    );
  }
}
