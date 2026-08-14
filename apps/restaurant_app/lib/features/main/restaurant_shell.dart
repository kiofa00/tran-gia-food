import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../orders/restaurant_orders_screen.dart';
import '../menu/menu_management_screen.dart';
import '../revenue/revenue_dashboard_screen.dart';
import '../settings/restaurant_settings_screen.dart';

// Shell pages for ShellRoute
class OrdersShellPage extends StatelessWidget {
  const OrdersShellPage({super.key});
  @override
  Widget build(BuildContext context) => const RestaurantOrdersScreen();
}

class MenuShellPage extends StatelessWidget {
  const MenuShellPage({super.key});
  @override
  Widget build(BuildContext context) => const MenuManagementScreen();
}

class RevenueShellPage extends StatelessWidget {
  const RevenueShellPage({super.key});
  @override
  Widget build(BuildContext context) => const RevenueDashboardScreen();
}

class SettingsShellPage extends StatelessWidget {
  const SettingsShellPage({super.key});
  @override
  Widget build(BuildContext context) => const RestaurantSettingsScreen();
}

// Main bottom-nav shell
class RestaurantShell extends StatelessWidget {
  final Widget child;

  const RestaurantShell({super.key, required this.child});

  static const _tabs = ['/orders', '/menu', '/revenue', '/settings'];

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    final currentIndex = _tabs.indexWhere((t) => location.startsWith(t));

    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: currentIndex < 0 ? 0 : currentIndex,
        onTap: (i) => context.go(_tabs[i]),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textSecondaryLight,
        selectedLabelStyle: const TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.sm),
        unselectedLabelStyle: const TextStyle(fontSize: AppFontSize.sm),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Iconsax.receipt_item),
            activeIcon: Icon(Iconsax.receipt_25),
            label: 'Đơn Hàng',
          ),
          BottomNavigationBarItem(
            icon: Icon(Iconsax.menu_board),
            activeIcon: Icon(Iconsax.menu_board),
            label: 'Menu',
          ),
          BottomNavigationBarItem(
            icon: Icon(Iconsax.chart_2),
            activeIcon: Icon(Iconsax.chart_21),
            label: 'Doanh Thu',
          ),
          BottomNavigationBarItem(
            icon: Icon(Iconsax.setting_2),
            activeIcon: Icon(Iconsax.setting5),
            label: 'Cài Đặt',
          ),
        ],
      ),
    );
  }
}
