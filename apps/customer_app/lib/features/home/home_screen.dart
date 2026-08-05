import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import 'package:iconsax/iconsax.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(18.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Location Bar
              Row(
                children: [
                  const Icon(Iconsax.location5, color: AppColors.primary, size: 22),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Giao đến địa chỉ', style: TextStyle(fontSize: AppFontSize.xs, color: AppColors.textSecondaryLight)),
                        Text('123 Nguyễn Trãi, Q5, TP.HCM', style: TextStyle(fontSize: AppFontSize.md, fontWeight: AppFontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Iconsax.notification5, color: AppColors.textPrimaryLight),
                    onPressed: () {},
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Search Bar
              const AppTextField(
                hintText: 'Tìm món ăn, trà sữa, phở bò...',
                prefixIcon: Iconsax.search_normal_1,
              ),
              const SizedBox(height: 24),

              // Banner Voucher Promotion Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: AppGradients.orangeGradient,
                  borderRadius: const BorderRadius.all(AppRadius.md),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.all(AppRadius.full),
                      ),
                      child: const Text('MÃ KHUYẾN MÃI', style: TextStyle(fontSize: AppFontSize.xs, fontWeight: AppFontWeight.extraBold, color: AppColors.primary)),
                    ),
                    const SizedBox(height: 12),
                    const Text('Giảm 20k Cho Đơn Đầu Tiên 🍲', style: TextStyle(fontSize: AppFontSize.lg, fontWeight: AppFontWeight.extraBold, color: Colors.white)),
                    const SizedBox(height: 4),
                    const Text('Nhập mã "SUMMER20" áp dụng ngay', style: TextStyle(fontSize: AppFontSize.body, color: Colors.white70)),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // Categories Header
              const Text('Danh Mục Món Ăn', style: TextStyle(fontSize: AppFontSize.lg, fontWeight: AppFontWeight.extraBold)),
              const SizedBox(height: 14),

              // Category chips list
              SizedBox(
                height: 40,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    _buildCategoryChip('🔥 Tất cả', true),
                    _buildCategoryChip('🍜 Cơm & Phở', false),
                    _buildCategoryChip('🧋 Trà Sữa', false),
                    _buildCategoryChip('🍕 Pizza & Burger', false),
                    _buildCategoryChip('🥗 Lành Mạnh', false),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // Restaurant List Header
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Quán Ăn Gần Bạn', style: TextStyle(fontSize: AppFontSize.lg, fontWeight: AppFontWeight.extraBold)),
                  Text('Xem tất cả', style: TextStyle(fontSize: AppFontSize.body, color: AppColors.primary, fontWeight: AppFontWeight.bold)),
                ],
              ),
              const SizedBox(height: 16),

              // Restaurant Cards List
              const RestaurantCard(
                id: '1',
                name: 'Phở Bắc Hà — Nguyễn Trãi',
                address: '123 Nguyễn Trãi, Q5, HCM',
                rating: 4.9,
                totalReviews: 320,
                distanceKm: 0.8,
                coverImageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600',
              ),
              const RestaurantCard(
                id: '2',
                name: 'Trà Sữa KOI Thé — Trần Hưng Đạo',
                address: '45 Trần Hưng Đạo, Q1, HCM',
                rating: 4.8,
                totalReviews: 512,
                distanceKm: 1.4,
                coverImageUrl: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=600',
              ),
              const RestaurantCard(
                id: '3',
                name: 'Cơm Tấm Sài Gòn — Cống Quỳnh',
                address: '88 Cống Quỳnh, Q1, HCM',
                rating: 4.7,
                totalReviews: 198,
                distanceKm: 2.1,
                coverImageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryChip(String label, bool isSelected) {
    return Container(
      margin: const EdgeInsets.only(right: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: isSelected ? AppColors.primary : AppColors.surfaceAltLight,
        borderRadius: const BorderRadius.all(AppRadius.full),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: AppFontSize.body,
          fontWeight: isSelected ? AppFontWeight.bold : AppFontWeight.medium,
          color: isSelected ? Colors.white : AppColors.textPrimaryLight,
        ),
      ),
    );
  }
}
