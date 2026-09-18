import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Cho phép kéo vuốt (drag-to-scroll / swipe) trên mọi thiết bị: Chuột (Web/Desktop), Cảm ứng, Trackpad, Bút Stylus
class AppScrollBehavior extends MaterialScrollBehavior {
  const AppScrollBehavior();

  @override
  Set<PointerDeviceKind> get dragDevices => {
    PointerDeviceKind.touch,
    PointerDeviceKind.mouse,
    PointerDeviceKind.trackpad,
    PointerDeviceKind.stylus,
  };
}

/// Color tokens for Tran Gia Food Design System
class AppColors {
  AppColors._();

  // Primary
  static const primary = Color(0xFFFF6635);
  static const primaryLight = Color(0xFFFF8C69);
  static const primaryDark = Color(0xFFE04A1E);

  // Secondary
  static const secondary = Color(0xFFFFD93D);

  // Light Theme
  static const backgroundLight = Color(0xFFFFF8F2);
  static const surfaceLight = Color(0xFFFFFFFF);
  static const surfaceAltLight = Color(0xFFF5EDE3);
  static const textPrimaryLight = Color(0xFF2D1B00);
  static const textSecondaryLight = Color(0xFF7C6E5C);
  static const textHintLight = Color(0xFFB5A898);
  static const dividerLight = Color(0xFFEDE4D8);

  // Dark Theme
  static const backgroundDark = Color(0xFF1A1209);
  static const surfaceDark = Color(0xFF2A1F12);
  static const surfaceAltDark = Color(0xFF352817);
  static const textPrimaryDark = Color(0xFFFFF0E0);
  static const textSecondaryDark = Color(0xFFC4A882);
  static const dividerDark = Color(0xFF3D2E1E);

  // Status Colors
  static const success = Color(0xFF2E7D32);
  static const warning = Color(0xFFED6C02);
  static const error = Color(0xFFD32F2F);
  static const info = Color(0xFF0288D1);
}

/// Typography tokens for Tran Gia Food Design System
class AppFontSize {
  AppFontSize._();
  static const double xs = 11.0;
  static const double sm = 12.0;
  static const double body = 13.0;
  static const double md = 14.0;
  static const double base = 15.0;
  static const double title = 16.0;
  static const double lg = 18.0;
  static const double xl = 22.0;
  static const double h3 = 20.0;
  static const double h1 = 24.0;
  static const double h2 = 28.0;
}

class AppFontWeight {
  AppFontWeight._();
  static const regular = FontWeight.w400;
  static const medium = FontWeight.w500;
  static const semiBold = FontWeight.w600;
  static const bold = FontWeight.w700;
  static const extraBold = FontWeight.w800;
}

/// Border radius constants
class AppRadius {
  AppRadius._();
  static const xs = Radius.circular(6);
  static const sm = Radius.circular(10);
  static const md = Radius.circular(16);
  static const lg = Radius.circular(20);
  static const xl = Radius.circular(28);
  static const full = Radius.circular(999);
}

/// Warm shadow constants
class AppShadows {
  AppShadows._();

  static const sm = [
    BoxShadow(color: Color(0x14FF6635), blurRadius: 8, offset: Offset(0, 2)),
  ];

  static const md = [
    BoxShadow(color: Color(0x1FFF6635), blurRadius: 16, offset: Offset(0, 4)),
  ];

  static const lg = [
    BoxShadow(color: Color(0x29FF6635), blurRadius: 32, offset: Offset(0, 8)),
  ];
}

class AppGradients {
  AppGradients._();

  static const orangeGradient = LinearGradient(
    colors: [AppColors.primary, AppColors.primaryLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const primaryGradient = LinearGradient(
    colors: [AppColors.primary, AppColors.primaryLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

/// App Theme (Light + Dark)
class AppTheme {
  AppTheme._();

  static ThemeData get lightTheme => light;
  static ThemeData get darkTheme => dark;

  static final ThemeData light = _buildTheme(
        brightness: Brightness.light,
        colorScheme: const ColorScheme.light(
          primary: AppColors.primary,
          onPrimary: Colors.white,
          secondary: AppColors.secondary,
          surface: AppColors.backgroundLight,
          onSurface: AppColors.textPrimaryLight,
          error: AppColors.error,
        ),
        scaffoldBg: AppColors.backgroundLight,
        cardColor: AppColors.surfaceLight,
        dividerColor: AppColors.dividerLight,
        surfaceAlt: AppColors.surfaceAltLight,
        textColor: AppColors.textPrimaryLight,
        hintColor: AppColors.textHintLight,
      );

  static final ThemeData dark = _buildTheme(
        brightness: Brightness.dark,
        colorScheme: const ColorScheme.dark(
          primary: AppColors.primary,
          onPrimary: Colors.white,
          secondary: AppColors.secondary,
          surface: AppColors.backgroundDark,
          onSurface: AppColors.textPrimaryDark,
          error: AppColors.error,
        ),
        scaffoldBg: AppColors.backgroundDark,
        cardColor: AppColors.surfaceDark,
        dividerColor: AppColors.dividerDark,
        surfaceAlt: AppColors.surfaceAltDark,
        textColor: AppColors.textPrimaryDark,
        hintColor: AppColors.textSecondaryDark,
      );

  static ThemeData _buildTheme({
    required Brightness brightness,
    required ColorScheme colorScheme,
    required Color scaffoldBg,
    required Color cardColor,
    required Color dividerColor,
    required Color surfaceAlt,
    required Color textColor,
    required Color hintColor,
  }) {
    final baseTextTheme = brightness == Brightness.light
        ? ThemeData.light(useMaterial3: true).textTheme
        : ThemeData.dark(useMaterial3: true).textTheme;

    final nunitoTheme = GoogleFonts.nunitoTextTheme(baseTextTheme);

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: scaffoldBg,
      cardColor: cardColor,
      dividerColor: dividerColor,
      textTheme: nunitoTheme.apply(
        bodyColor: textColor,
        displayColor: textColor,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: scaffoldBg,
        foregroundColor: textColor,
        elevation: 0,
        centerTitle: true,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(AppRadius.sm),
          ),
          minimumSize: const Size(64, 48),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceAlt,
        border: const OutlineInputBorder(
          borderRadius: BorderRadius.all(AppRadius.sm),
          borderSide: BorderSide.none,
        ),
        hintStyle: TextStyle(
          color: hintColor,
          fontSize: 14,
        ),
      ),
    );
  }
}
