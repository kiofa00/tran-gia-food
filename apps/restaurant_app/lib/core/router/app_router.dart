import 'package:go_router/go_router.dart';
import '../../features/main/restaurant_shell.dart';
import '../../features/voucher/restaurant_voucher_screen.dart';
import '../../features/settings/opening_hours_screen.dart';
import '../../features/auth/restaurant_login_screen.dart';
import '../../features/auth/restaurant_register_screen.dart';
import '../../features/auth/restaurant_ekyc_screen.dart';

final restaurantRouter = GoRouter(
  initialLocation: '/orders',
  routes: [
    GoRoute(
      path: '/login',
      builder: (c, s) => const RestaurantLoginScreen(),
    ),
    GoRoute(
      path: '/register',
      builder: (c, s) => const RestaurantRegisterScreen(),
    ),
    GoRoute(
      path: '/kyc',
      builder: (c, s) => const RestaurantEkycScreen(),
    ),
    ShellRoute(
      builder: (context, state, child) => RestaurantShell(child: child),
      routes: [
        GoRoute(path: '/orders', builder: (c, s) => const OrdersShellPage()),
        GoRoute(path: '/menu', builder: (c, s) => const MenuShellPage()),
        GoRoute(path: '/revenue', builder: (c, s) => const RevenueShellPage()),
        GoRoute(path: '/settings', builder: (c, s) => const SettingsShellPage()),
      ],
    ),
    GoRoute(
      path: '/vouchers',
      builder: (c, s) => const RestaurantVoucherScreen(),
    ),
    GoRoute(
      path: '/settings/opening-hours',
      builder: (c, s) => const OpeningHoursScreen(),
    ),
  ],
);
