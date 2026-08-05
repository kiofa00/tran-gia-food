import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../home/home_screen.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  final List<Widget> _pages = const [
    HomeScreen(),
    Center(child: Text('Đơn Hàng Của Tôi 📦', style: TextStyle(fontSize: AppFontSize.lg, fontWeight: AppFontWeight.bold))),
    Center(child: Text('Giỏ Hàng 🛒', style: TextStyle(fontSize: AppFontSize.lg, fontWeight: AppFontWeight.bold))),
    Center(child: Text('Tài Khoản & Profile 👤', style: TextStyle(fontSize: AppFontSize.lg, fontWeight: AppFontWeight.bold))),
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
