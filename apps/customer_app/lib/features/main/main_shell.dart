import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

import '../cart/cart_screen.dart';
import '../home/home_screen.dart';
import '../orders/order_history_screen.dart';
import '../profile/profile_screen.dart';

class _MainTabNotifier extends Notifier<int> {
  @override
  int build() => 0;

  void setTab(int index) => state = index;
}

final mainTabProvider = NotifierProvider<_MainTabNotifier, int>(
  _MainTabNotifier.new,
);

class MainShell extends ConsumerWidget {
  const MainShell({super.key});

  static const List<Widget> _pages = [
    RepaintBoundary(child: HomeScreen()),
    RepaintBoundary(child: OrderHistoryScreen()),
    RepaintBoundary(child: CartScreen()),
    RepaintBoundary(child: ProfileScreen()),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentIndex = ref.watch(mainTabProvider);

    return Scaffold(
      body: IndexedStack(index: currentIndex, children: _pages),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: (index) => ref.read(mainTabProvider.notifier).setTab(index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textSecondaryLight,
        selectedLabelStyle: const TextStyle(
          fontWeight: AppFontWeight.bold,
          fontSize: AppFontSize.sm,
        ),
        unselectedLabelStyle: const TextStyle(
          fontWeight: AppFontWeight.medium,
          fontSize: AppFontSize.sm,
        ),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Iconsax.home_1),
            activeIcon: Icon(Iconsax.home5),
            label: 'Trang Chủ',
          ),
          BottomNavigationBarItem(
            icon: Icon(Iconsax.receipt_item),
            activeIcon: Icon(Iconsax.receipt_25),
            label: 'Đơn Hàng',
          ),
          BottomNavigationBarItem(
            icon: Icon(Iconsax.shopping_cart),
            activeIcon: Icon(Iconsax.shopping_cart5),
            label: 'Giỏ Hàng',
          ),
          BottomNavigationBarItem(
            icon: Icon(Iconsax.profile_circle),
            activeIcon: Icon(Iconsax.profile_circle5),
            label: 'Tài Khoản',
          ),
        ],
      ),
    );
  }
}
