import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import 'package:iconsax/iconsax.dart';

class AvailableOrdersScreen extends StatefulWidget {
  const AvailableOrdersScreen({super.key});

  @override
  State<AvailableOrdersScreen> createState() => _AvailableOrdersScreenState();
}

class _AvailableOrdersScreenState extends State<AvailableOrdersScreen> {
  bool _isOnline = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Shipper Driver 🚴', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          Row(
            children: [
              Text(_isOnline ? 'Sẵn sàng' : 'Tắt nhận đơn', style: TextStyle(fontWeight: FontWeight.bold, color: _isOnline ? AppColors.success : AppColors.error)),
              Switch(
                value: _isOnline,
                activeTrackColor: AppColors.success,
                onChanged: (val) => setState(() => _isOnline = val),
              ),
            ],
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Header Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: AppGradients.orangeGradient,
                borderRadius: const BorderRadius.all(AppRadius.md),
              ),
              child: const Row(
                children: [
                  Icon(Iconsax.wallet_25, color: Colors.white, size: 32),
                  SizedBox(width: 14),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Thu Nhập Hôm Nay', style: TextStyle(color: Colors.white70, fontSize: AppFontSize.sm)),
                      Text('385.000đ', style: TextStyle(color: Colors.white, fontSize: AppFontSize.xl, fontWeight: AppFontWeight.extraBold)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text('Đơn Hàng Đang Chờ Nhận (1)', style: TextStyle(fontSize: AppFontSize.title, fontWeight: AppFontWeight.bold)),
            const SizedBox(height: 12),

            // Available Order Card
            _buildDeliveryCard(
              restaurantName: 'Phở Bắc Hà — Nguyễn Trãi',
              pickupAddress: '123 Nguyễn Trãi, Q5',
              deliveryAddress: '456 Trần Hưng Đạo, Q1',
              distanceKm: 2.3,
              shipFee: 21000,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDeliveryCard({
    required String restaurantName,
    required String pickupAddress,
    required String deliveryAddress,
    required double distanceKm,
    required int shipFee,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: AppColors.surfaceAltLight,
        borderRadius: BorderRadius.all(AppRadius.md),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Thu nhập ship: +${shipFee.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ', style: const TextStyle(fontWeight: AppFontWeight.extraBold, color: AppColors.primary, fontSize: AppFontSize.title)),
              Text('$distanceKm km', style: const TextStyle(fontWeight: AppFontWeight.bold, color: AppColors.textSecondaryLight, fontSize: AppFontSize.body)),
            ],
          ),
          const SizedBox(height: 12),

          // Pickup Location
          Row(
            children: [
              const Icon(Iconsax.shop, color: AppColors.primary, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(restaurantName, style: const TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.md)),
                    Text(pickupAddress, style: const TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight)),
                  ],
                ),
              ),
            ],
          ),
          const Padding(
            padding: EdgeInsets.only(left: 10),
            child: SizedBox(height: 16, child: VerticalDivider(thickness: 1.5)),
          ),

          // Delivery Location
          Row(
            children: [
              const Icon(Iconsax.location5, color: AppColors.success, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Khách hàng: Nguyễn Văn A', style: TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.md)),
                    Text(deliveryAddress, style: const TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Accept button
          AppButton(
            text: 'Nhận Đơn Ngay',
            icon: Iconsax.routing,
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Chấp nhận đơn hàng thành công! Đang di chuyển tới quán.')),
              );
            },
          ),
        ],
      ),
    );
  }
}
