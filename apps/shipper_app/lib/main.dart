import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import 'features/delivery/available_orders_screen.dart';

void main() {
  runApp(const ShipperApp());
}

class ShipperApp extends StatelessWidget {
  const ShipperApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Tran Gia Shipper',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const AvailableOrdersScreen(),
    );
  }
}
