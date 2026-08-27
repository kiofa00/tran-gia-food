import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/api_client_provider.dart';
import '../../features/main/restaurant_shell.dart';
import '../../features/voucher/restaurant_voucher_screen.dart';
import '../../features/settings/opening_hours_screen.dart';
import '../../features/auth/restaurant_login_screen.dart';
import '../../features/auth/restaurant_register_screen.dart';
import '../../features/auth/restaurant_ekyc_screen.dart';

final restaurantRouterProvider = Provider<GoRouter>((ref) {
  final api = ref.watch(apiClientProvider);

  return GoRouter(
    initialLocation: '/orders',
    redirect: (context, state) async {
      final isLoggedIn = await api.hasToken();
      final loc = state.matchedLocation;
      final isAuthRoute = loc == '/login' || loc == '/register' || loc == '/kyc';

      if (!isLoggedIn && !isAuthRoute) {
        return '/login';
      }
      if (isLoggedIn && (loc == '/login' || loc == '/register')) {
        return '/orders';
      }
      return null;
    },
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
});
