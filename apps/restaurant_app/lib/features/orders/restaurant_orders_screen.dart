import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import 'package:iconsax/iconsax.dart';

class RestaurantOrdersScreen extends StatefulWidget {
  const RestaurantOrdersScreen({super.key});

  @override
  State<RestaurantOrdersScreen> createState() => _RestaurantOrdersScreenState();
}

class _RestaurantOrdersScreenState extends State<RestaurantOrdersScreen> {
  bool _isOpen = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Quản Lý Đơn Hàng 🔔', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          Row(
            children: [
              Text(_isOpen ? 'Mở cửa' : 'Đóng cửa', style: TextStyle(fontWeight: FontWeight.bold, color: _isOpen ? AppColors.success : AppColors.error)),
              Switch(
                value: _isOpen,
                activeColor: AppColors.success,
                onChanged: (val) => setState(() => _isOpen = val),
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
            const Text('Đơn Hàng Mới Cần Nhận (1)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.primary)),
            const SizedBox(height: 12),
            _buildOrderCard(
              orderId: '#12345',
              customerName: 'Nguyễn Văn A',
              phone: '090 123 4567',
              items: '2x Phở Bò Tái Nạm, 1x Quẩy Giòn',
              total: 145000,
              status: 'CHỜ XÁC NHẬN',
              statusColor: AppColors.warning,
              showActions: true,
            ),
            const SizedBox(height: 24),

            const Text('Đơn Đang Chế Biến (1)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _buildOrderCard(
              orderId: '#12344',
              customerName: 'Trần Thị B',
              phone: '098 765 4321',
              items: '1x Phở Đặc Biệt',
              total: 85000,
              status: 'ĐANG CHẾ BIẾN',
              statusColor: AppColors.info,
              showActions: false,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderCard({
    required String orderId,
    required String customerName,
    required String phone,
    required String items,
    required int total,
    required String status,
    required Color statusColor,
    required bool showActions,
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
            mainAxisAlignment: MainAlignment.between,
            children: [
              Text(orderId, style: const TextStyle(fontWeight: FontWeight.extrabold, fontSize: 16)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: statusColor.withOpacity(0.15), borderRadius: const BorderRadius.all(AppRadius.full)),
                child: Text(status, style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 12)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text('$customerName — $phone', style: const TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          Text(items, style: const TextStyle(color: AppColors.textSecondaryLight)),
          const SizedBox(height: 12),
          Text('Tổng tiền: ${total.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary, fontSize: 15)),
          if (showActions) ...[
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {},
                    style: OutlinedButton.styleFrom(foregroundColor: AppColors.error),
                    child: const Text('Từ Chối'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                    child: const Text('Nhận Đơn', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
