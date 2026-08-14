import 'package:go_router/go_router.dart';
import '../../features/main/shipper_shell.dart';
import '../../features/chat/shipper_chat_screen.dart';
import '../../features/profile/shipper_ekyc_screen.dart';
import '../../features/profile/penalty_history_screen.dart';

final shipperRouter = GoRouter(
  initialLocation: '/orders',
  routes: [
    ShellRoute(
      builder: (context, state, child) => ShipperShell(child: child),
      routes: [
        GoRoute(path: '/orders', builder: (c, s) => const OrdersTabPage()),
        GoRoute(path: '/wallet', builder: (c, s) => const WalletTabPage()),
        GoRoute(path: '/earnings', builder: (c, s) => const EarningsTabPage()),
        GoRoute(path: '/profile', builder: (c, s) => const ProfileTabPage()),
      ],
    ),
    GoRoute(
      path: '/navigate/:orderId',
      builder: (c, s) {
        final orderId = s.pathParameters['orderId']!;
        return DeliveryNavigationPage(orderId: orderId);
      },
    ),
    GoRoute(
      path: '/kyc',
      builder: (c, s) => const ShipperEkycScreen(),
    ),
    GoRoute(
      path: '/penalties',
      builder: (c, s) => const PenaltyHistoryScreen(),
    ),
    GoRoute(
      path: '/chat/:orderId',
      builder: (c, s) {
        final orderId = s.pathParameters['orderId']!;
        final name = s.uri.queryParameters['name'] ?? 'Khách hàng';
        final type = s.uri.queryParameters['type'] ?? 'customer';
        return ShipperChatScreen(
          orderId: orderId,
          recipientName: name,
          recipientType: type,
        );
      },
    ),
  ],
);
