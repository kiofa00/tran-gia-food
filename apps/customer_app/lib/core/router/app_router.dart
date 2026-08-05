import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/login_screen.dart';
import '../../features/main/main_shell.dart';

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
  ],
);
