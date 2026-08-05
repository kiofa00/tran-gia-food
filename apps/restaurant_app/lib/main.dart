import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import 'features/orders/restaurant_orders_screen.dart';

void main() {
  runApp(const RestaurantApp());
}

class RestaurantApp extends StatelessWidget {
  const RestaurantApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Tran Gia Partner',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const RestaurantOrdersScreen(),
    );
  }
}
