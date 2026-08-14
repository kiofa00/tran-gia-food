import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../delivery/available_orders_screen.dart';
import '../wallet/wallet_screen.dart';
import '../earnings/earnings_history_screen.dart';
import '../profile/shipper_profile_screen.dart';
import '../navigation/delivery_navigation_screen.dart';

// Tab page wrappers
class OrdersTabPage extends StatelessWidget {
  const OrdersTabPage({super.key});
  @override
  Widget build(BuildContext context) => const AvailableOrdersScreen();
}

class WalletTabPage extends StatelessWidget {
  const WalletTabPage({super.key});
  @override
  Widget build(BuildContext context) => const WalletScreen();
}

class EarningsTabPage extends StatelessWidget {
  const EarningsTabPage({super.key});
  @override
  Widget build(BuildContext context) => const EarningsHistoryScreen();
}

class ProfileTabPage extends StatelessWidget {
  const ProfileTabPage({super.key});
  @override
  Widget build(BuildContext context) => const ShipperProfileScreen();
}

class DeliveryNavigationPage extends StatelessWidget {
  final String orderId;
  const DeliveryNavigationPage({super.key, required this.orderId});
  @override
  Widget build(BuildContext context) => DeliveryNavigationScreen(orderId: orderId);
}

// Bottom-nav shell
class ShipperShell extends StatelessWidget {
  final Widget child;
  const ShipperShell({super.key, required this.child});

  static const _tabs = ['/orders', '/wallet', '/earnings', '/profile'];

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
            icon: Icon(Iconsax.routing),
            activeIcon: Icon(Iconsax.routing5),
            label: 'Đơn Hàng',
          ),
          BottomNavigationBarItem(
            icon: Icon(Iconsax.wallet_2),
            activeIcon: Icon(Iconsax.wallet_25),
            label: 'Ví Tiền',
          ),
          BottomNavigationBarItem(
            icon: Icon(Iconsax.receipt_text),
            activeIcon: Icon(Iconsax.receipt_text5),
            label: 'Thu Nhập',
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
