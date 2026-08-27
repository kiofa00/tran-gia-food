import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

import '../../../core/providers/api_client_provider.dart';
import '../main/main_shell.dart';
import 'cart_provider.dart';
import 'widgets/cart_item_tile.dart';
import 'widgets/cart_order_summary.dart';
import 'widgets/cart_voucher_section.dart';

class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  final TextEditingController _voucherController = TextEditingController();
  bool _isCheckingVoucher = false;

  @override
  void dispose() {
    _voucherController.dispose();
    super.dispose();
  }

  Future<void> _applyVoucherCode(String rawCode, int subtotal) async {
    final code = rawCode.trim().toUpperCase();
    if (code.isEmpty) return;

    setState(() => _isCheckingVoucher = true);
    final api = ref.read(apiClientProvider);

    try {
      final res = await api.post('/vouchers/validate', {
        'code': code,
        'orderValue': subtotal,
      });

      final isValid = res['valid'] as bool? ?? false;
      final discount = (res['discountAmount'] as num?)?.toInt() ?? 0;
      final message = res['message'] as String? ?? 'Áp dụng mã thành công!';

      if (!isValid) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(message),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
        return;
      }

      ref.read(cartProvider.notifier).setVoucher(code, discount);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('🎉 $message (-${AppFormatters.currency(discount)})'),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Không thể kiểm tra mã: $e'),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } finally {
      if (mounted) setState(() => _isCheckingVoucher = false);
    }
  }

  Future<void> _proceedToCheckout() async {
    final api = ref.read(apiClientProvider);
    if (!await api.hasToken()) {
      if (!mounted) return;
      AppDialogs.showLoginPrompt(
        context,
        actionText: 'xác nhận đặt đơn và thanh toán',
        onLogin: () => context.push('/auth'),
      );
      return;
    }

    if (!mounted) return;
    context.push('/checkout');
  }

  Future<void> _openVoucherPicker(int subtotal) async {
    final api = ref.read(apiClientProvider);
    if (!await api.hasToken()) {
      if (!mounted) return;
      AppDialogs.showLoginPrompt(
        context,
        actionText: 'xem và áp dụng voucher trong ví',
        onLogin: () => context.push('/auth'),
      );
      return;
    }

    if (!mounted) return;
    final selectedCode = await context.push<String>('/vouchers?fromCart=true');
    if (selectedCode != null && selectedCode.trim().isNotEmpty) {
      _voucherController.text = selectedCode.trim();
      await _applyVoucherCode(selectedCode, subtotal);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (cart.isEmpty) {
      return Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          title: const Text(
            'Giỏ Hàng Của Bạn',
            style: TextStyle(fontWeight: AppFontWeight.bold),
          ),
        ),
        body: AppEmptyState(
          icon: Iconsax.shopping_cart,
          title: 'Giỏ hàng của bạn đang trống',
          description:
              'Hãy khám phá thực đơn thơm ngon từ các quán ăn và đặt món ngay nhé!',
          actionText: 'Khám Phá Món Ngon',
          actionIcon: Iconsax.discover,
          onAction: () {
            ref.read(mainTabProvider.notifier).setTab(0);
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/main');
            }
          },
        ),
      );
    }

    final itemsList = cart.items.values.toList();

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text(
          'Giỏ Hàng Của Bạn',
          style: TextStyle(fontWeight: AppFontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Iconsax.trash, color: AppColors.error),
            tooltip: 'Xóa giỏ hàng',
            onPressed: () async {
              final confirm = await AppDialogs.showConfirm(
                context,
                title: 'Xóa giỏ hàng?',
                message: 'Bạn có chắc chắn muốn xóa toàn bộ món trong giỏ không?',
                confirmText: 'Xóa toàn bộ',
                isDestructive: true,
                icon: Iconsax.trash,
              );
              if (confirm) {
                ref.read(cartProvider.notifier).clearCart();
              }
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Items List
          ...itemsList.map((item) => CartItemTile(
                item: item,
                onQuantityChanged: (q) {
                  ref.read(cartProvider.notifier).updateQuantity(item.id, q);
                },
                onRemove: () {
                  ref.read(cartProvider.notifier).removeItem(item.id);
                },
              )),
          const SizedBox(height: 12),

          // Voucher Section
          CartVoucherSection(
            controller: _voucherController,
            appliedCode: cart.voucherCode,
            discountAmount: cart.discountAmount,
            isLoading: _isCheckingVoucher,
            onApply: () => _applyVoucherCode(_voucherController.text, cart.subtotal),
            onRemove: () {
              _voucherController.clear();
              ref.read(cartProvider.notifier).removeVoucher();
            },
            onOpenPicker: () => _openVoucherPicker(cart.subtotal),
          ),
          const SizedBox(height: 16),

          // Cost Summary
          CartOrderSummary(
            subtotal: cart.subtotal,
            shippingFee: cart.shippingFee,
            discountAmount: cart.discountAmount,
            total: cart.total,
          ),
          const SizedBox(height: 32),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? AppColors.surfaceAltDark : Colors.white,
          boxShadow: AppShadows.md,
          border: Border(
            top: BorderSide(
              color: isDark ? AppColors.dividerDark : AppColors.dividerLight,
            ),
          ),
        ),
        child: SafeArea(
          child: Row(
            children: [
              Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Tổng thanh toán',
                    style: TextStyle(
                      fontSize: AppFontSize.xs,
                      color: AppColors.textSecondaryLight,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    AppFormatters.currency(cart.total),
                    style: const TextStyle(
                      fontSize: AppFontSize.xl,
                      fontWeight: AppFontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 16),
              Expanded(
                child: AppButton(
                  text: 'Tiến Hành Đặt Hàng',
                  icon: Iconsax.card_send,
                  onPressed: _proceedToCheckout,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
