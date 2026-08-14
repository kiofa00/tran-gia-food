import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../home/home_screen.dart';
import '../orders/order_history_screen.dart';
import '../profile/profile_screen.dart';

class MainShell extends ConsumerStatefulWidget {
  const MainShell({super.key});

  @override
  ConsumerState<MainShell> createState() => _MainShellState();
}

class _MainShellState extends ConsumerState<MainShell> {
  int _currentIndex = 0;

  final List<Widget> _pages = const [
    HomeScreen(),
    OrderHistoryScreen(),
    CartPlaceholder(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textSecondaryLight,
        selectedLabelStyle: const TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.sm),
        unselectedLabelStyle: const TextStyle(fontWeight: AppFontWeight.medium, fontSize: AppFontSize.sm),
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
            icon: Icon(Iconsax.user),
            activeIcon: Icon(Iconsax.user_octagon5),
            label: 'Tài Khoản',
          ),
        ],
      ),
    );
  }
}

/// Placeholder giỏ hàng — navigate tới /cart route có sẵn
class CartPlaceholder extends StatelessWidget {
  const CartPlaceholder({super.key});

  @override
  Widget build(BuildContext context) {
    // Redirect to full cart screen
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (context.mounted) context.go('/cart');
    });
    return const SizedBox.shrink();
  }
}
