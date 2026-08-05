import 'dart:async';
import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import 'package:iconsax/iconsax.dart';

/// 60-second Countdown Order Accept Dialog for Shipper App
class OrderAcceptDialog extends StatefulWidget {
  final String orderId;
  final String restaurantName;
  final String pickupAddress;
  final String deliveryAddress;
  final int shipFee;
  final VoidCallback onAccept;
  final VoidCallback onReject;

  const OrderAcceptDialog({
    super.key,
    required this.orderId,
    required this.restaurantName,
    required this.pickupAddress,
    required this.deliveryAddress,
    required this.shipFee,
    required this.onAccept,
    required this.onReject,
  });

  @override
  State<OrderAcceptDialog> createState() => _OrderAcceptDialogState();
}

class _OrderAcceptDialogState extends State<OrderAcceptDialog> {
  int _secondsLeft = 60;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_secondsLeft <= 1) {
        t.cancel();
        widget.onReject();
      } else {
        setState(() => _secondsLeft--);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Dialog(
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(AppRadius.lg)),
      backgroundColor: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Circular Countdown Timer
            Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  width: 72,
                  height: 72,
                  child: CircularProgressIndicator(
                    value: _secondsLeft / 60,
                    strokeWidth: 6,
                    backgroundColor: AppColors.surfaceAltLight,
                    color: _secondsLeft > 15 ? AppColors.primary : AppColors.error,
                  ),
                ),
                Text(
                  '${_secondsLeft}s',
                  style: TextStyle(
                    fontSize: AppFontSize.xl,
                    fontWeight: AppFontWeight.extraBold,
                    color: _secondsLeft > 15 ? AppColors.primary : AppColors.error,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            const Text('🎉 Có Đơn Giao Mới!', style: TextStyle(fontSize: AppFontSize.lg, fontWeight: AppFontWeight.extraBold)),
            const SizedBox(height: 8),

            Text(
              'Thu nhập ship: +${widget.shipFee.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ',
              style: const TextStyle(fontSize: AppFontSize.title, fontWeight: AppFontWeight.extraBold, color: AppColors.primary),
            ),
            const SizedBox(height: 16),

            // Pickup / Delivery summary
            Container(
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                color: AppColors.surfaceAltLight,
                borderRadius: BorderRadius.all(AppRadius.md),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      const Icon(Iconsax.shop, color: AppColors.primary, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(widget.restaurantName, style: const TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.md)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Iconsax.location5, color: AppColors.success, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(widget.deliveryAddress, style: const TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: widget.onReject,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.error,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(AppRadius.sm)),
                    ),
                    child: const Text('Từ Chối', style: TextStyle(fontWeight: AppFontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: widget.onAccept,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(AppRadius.sm)),
                    ),
                    child: const Text('Nhận Đơn', style: TextStyle(color: Colors.white, fontWeight: AppFontWeight.bold)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
