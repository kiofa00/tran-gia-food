import 'package:go_router/go_router.dart';

import '../../features/auth/login_screen.dart';
import '../../features/cart/cart_screen.dart';
import '../../features/chat/chat_screen.dart';
import '../../features/checkout/checkout_screen.dart';
import '../../features/main/main_shell.dart';
import '../../features/notifications/notification_screen.dart';
import '../../features/restaurant/restaurant_detail_screen.dart';
import '../../features/review/review_screen.dart';
import '../../features/tracking/order_tracking_screen.dart';
import '../../features/voucher/voucher_screen.dart';
import '../../features/wallet/customer_wallet_screen.dart';
import '../../features/wallet/ekyc_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/main',
  routes: [
    GoRoute(
      path: '/auth',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/main',
      builder: (context, state) => const MainShell(),
    ),
    GoRoute(
      path: '/restaurant/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return RestaurantDetailScreen(restaurantId: id);
      },
    ),
    GoRoute(
      path: '/cart',
      builder: (context, state) => const CartScreen(),
    ),
    GoRoute(
      path: '/checkout',
      builder: (context, state) => const CheckoutScreen(),
    ),
    GoRoute(
      path: '/tracking/:orderId',
      builder: (context, state) {
        final orderId = state.pathParameters['orderId']!;
        return OrderTrackingScreen(orderId: orderId);
      },
    ),
    GoRoute(
      path: '/notifications',
      builder: (context, state) => const NotificationScreen(),
    ),
    GoRoute(
      path: '/review/:orderId',
      builder: (context, state) {
        final orderId = state.pathParameters['orderId']!;
        return ReviewScreen(orderId: orderId);
      },
    ),
    GoRoute(
      path: '/vouchers',
      builder: (context, state) {
        final fromCart = state.uri.queryParameters['fromCart'] == 'true';
        return VoucherScreen(fromCart: fromCart);
      },
    ),
    GoRoute(
      path: '/wallet',
      builder: (context, state) => const CustomerWalletScreen(),
    ),
    GoRoute(
      path: '/wallet/kyc',
      builder: (context, state) => const EkycScreen(),
    ),
    GoRoute(
      path: '/chat/:orderId',
      builder: (context, state) {
        final orderId = state.pathParameters['orderId']!;
        final recipientName =
            state.uri.queryParameters['name'] ?? 'Shipper';
        final recipientType =
            state.uri.queryParameters['type'] ?? 'shipper';
        return ChatScreen(
          orderId: orderId,
          recipientName: recipientName,
          recipientType: recipientType,
        );
      },
    ),
  ],
);
