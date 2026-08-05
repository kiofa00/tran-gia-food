import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import 'package:iconsax/iconsax.dart';
import 'package:go_router/go_router.dart';

/// Real-time Order Tracking Screen displaying shipper movement and order status
class OrderTrackingScreen extends StatefulWidget {
  final String orderId;

  const OrderTrackingScreen({
    super.key,
    required this.orderId,
  });

  @override
  State<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends State<OrderTrackingScreen> {
  // Simulated real-time GPS coordinates of Shipper
  double _shipperLat = 10.7580;
  double _shipperLng = 106.6810;
  String _orderStatusText = 'Shipper đang di chuyển đến quán';
  double _progressValue = 0.45;

  @override
  void initState() {
    super.initState();
    _startSimulatedTracking();
  }

  void _startSimulatedTracking() async {
    // Simulate real-time GPS movement toward destination
    await Future.delayed(const Duration(seconds: 3));
    if (!mounted) return;
    setState(() {
      _shipperLat = 10.7600;
      _shipperLng = 106.6825;
      _orderStatusText = 'Shipper đã lấy hàng, đang giao đến bạn!';
      _progressValue = 0.75;
    });

    await Future.delayed(const Duration(seconds: 4));
    if (!mounted) return;
    setState(() {
      _shipperLat = 10.7620;
      _shipperLng = 106.6840;
      _orderStatusText = 'Shipper đã đến nơi! Vui lòng nhận hàng 🍲';
      _progressValue = 1.0;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text('Theo Dõi Đơn #${widget.orderId.substring(0, widget.orderId.length > 6 ? 6 : widget.orderId.length)}', style: const TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.title)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => context.pop(),
        ),
      ),
      body: Column(
        children: [
          // Simulated Google Maps Container View
          Expanded(
            child: Container(
              width: double.infinity,
              color: isDark ? const Color(0xFF1E232A) : const Color(0xFFE8ECEF),
              child: Stack(
                children: [
                  // Map Grid Background Graphic
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Iconsax.map5, size: 64, color: AppColors.primaryLight),
                        const SizedBox(height: 12),
                        Text(
                          'Google Maps Live Stream',
                          style: TextStyle(fontSize: AppFontSize.title, fontWeight: AppFontWeight.bold, color: isDark ? Colors.white70 : AppColors.textSecondaryLight),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Tọa độ Shipper: (${_shipperLat.toStringAsFixed(4)}, ${_shipperLng.toStringAsFixed(4)})',
                          style: const TextStyle(fontSize: AppFontSize.sm, color: AppColors.primary, fontWeight: AppFontWeight.bold),
                        ),
                      ],
                    ),
                  ),

                  // Shipper Live GPS Pin Marker Badge
                  AnimatedPositioned(
                    duration: const Duration(seconds: 2),
                    curve: Curves.easeInOut,
                    left: 120 + (_progressValue * 100),
                    top: 180 - (_progressValue * 40),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                        boxShadow: AppShadows.md,
                      ),
                      child: const Icon(Iconsax.user_tag, color: Colors.white, size: 24),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Bottom Real-time Status Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
              borderRadius: const BorderRadius.vertical(top: AppRadius.lg),
              boxShadow: AppShadows.md,
            ),
            child: SafeArea(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Progress Bar
                  ClipRRect(
                    borderRadius: const BorderRadius.all(AppRadius.full),
                    child: LinearProgressIndicator(
                      value: _progressValue,
                      minHeight: 8,
                      backgroundColor: AppColors.surfaceAltLight,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Status Text
                  Row(
                    children: [
                      const Icon(Iconsax.truck_fast, color: AppColors.primary, size: 28),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _orderStatusText,
                              style: const TextStyle(fontSize: AppFontSize.base, fontWeight: AppFontWeight.bold),
                            ),
                            const SizedBox(height: 2),
                            const Text(
                              'Dự kiến giao trong 12 - 15 phút',
                              style: TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Shipper Profile Card
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: const BoxDecoration(
                      color: AppColors.surfaceAltLight,
                      borderRadius: BorderRadius.all(AppRadius.md),
                    ),
                    child: Row(
                      children: [
                        const CircleAvatar(
                          backgroundColor: AppColors.primary,
                          child: Icon(Icons.person, color: Colors.white),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Tài Xế: Nguyễn Văn Cường', style: TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.md)),
                              Text('Xe Honda Wave • 59P1-999.88', style: TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight)),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Iconsax.call5, color: AppColors.success),
                          onPressed: () {},
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
