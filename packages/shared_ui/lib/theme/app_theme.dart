import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Color tokens for Tran Gia Food Design System
class AppColors {
  AppColors._();

  // Primary
  static const primary      = Color(0xFFFF6635);
  static const primaryLight = Color(0xFFFF8C69);
  static const primaryDark  = Color(0xFFE04A1E);

  // Secondary
  static const secondary = Color(0xFFFFD93D);

  // Light Theme
  static const backgroundLight = Color(0xFFFFF8F2);
  static const surfaceLight     = Color(0xFFFFFFFF);
  static const surfaceAltLight  = Color(0xFFF5EDE3);
  static const textPrimaryLight = Color(0xFF2D1B00);
  static const textSecondaryLight = Color(0xFF7C6E5C);
  static const textHintLight    = Color(0xFFB5A898);
  static const dividerLight     = Color(0xFFEDE4D8);

  // Dark Theme
  static const backgroundDark = Color(0xFF1A1209);
  static const surfaceDark    = Color(0xFF2A1F12);
  static const surfaceAltDark = Color(0xFF352817);
  static const textPrimaryDark = Color(0xFFFFF0E0);
  static const textSecondaryDark = Color(0xFFC4A882);
  static const dividerDark    = Color(0xFF3D2E1E);

  // Status Colors
  static const success = Color(0xFF2E7D32);
  static const warning = Color(0xFFED6C02);
  static const error   = Color(0xFFD32F2F);
  static const info    = Color(0xFF0288D1);
}

/// Border radius constants
class AppRadius {
  AppRadius._();
  static const xs   = Radius.circular(6);
  static const sm   = Radius.circular(10);
  static const md   = Radius.circular(16);
  static const lg   = Radius.circular(20);
  static const xl   = Radius.circular(28);
  static const full = Radius.circular(999);
}

/// Warm shadow constants
class AppShadows {
  AppShadows._();

  static const sm = [
    BoxShadow(
      color: Color(0x14FF6635),
      blurRadius: 8,
      offset: Offset(0, 2),
    ),
  ];

  static const md = [
    BoxShadow(
      color: Color(0x1FFF6635),
      blurRadius: 16,
      offset: Offset(0, 4),
    ),
  ];

  static const lg = [
    BoxShadow(
      color: Color(0x29FF6635),
      blurRadius: 32,
      offset: Offset(0, 8),
    ),
  ];
}

class AppGradients {
  AppGradients._();

  static const orangeGradient = LinearGradient(
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

  static ThemeData get light => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.light(
      primary: AppColors.primary,
      onPrimary: Colors.white,
      secondary: AppColors.secondary,
      surface: AppColors.backgroundLight,
      onSurface: AppColors.textPrimaryLight,
      error: AppColors.error,
    ),
    scaffoldBackgroundColor: AppColors.backgroundLight,
    cardColor: AppColors.surfaceLight,
    dividerColor: AppColors.dividerLight,
    fontFamily: GoogleFonts.nunito().fontFamily,
    textTheme: _textTheme(AppColors.textPrimaryLight),
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.backgroundLight,
      foregroundColor: AppColors.textPrimaryLight,
      elevation: 0,
      centerTitle: true,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(AppRadius.sm),
        ),
        minimumSize: const Size(double.infinity, 52),
        textStyle: GoogleFonts.inter(
          fontSize: 15,
          fontWeight: FontWeight.w600,
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.surfaceAltLight,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.all(AppRadius.sm),
        borderSide: BorderSide.none,
      ),
      hintStyle: GoogleFonts.inter(
        color: AppColors.textHintLight,
        fontSize: 14,
      ),
    ),
  );

  static ThemeData get dark => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.dark(
      primary: AppColors.primary,
      onPrimary: Colors.white,
      secondary: AppColors.secondary,
      surface: AppColors.backgroundDark,
      onSurface: AppColors.textPrimaryDark,
      error: AppColors.error,
    ),
    scaffoldBackgroundColor: AppColors.backgroundDark,
    cardColor: AppColors.surfaceDark,
    dividerColor: AppColors.dividerDark,
    fontFamily: GoogleFonts.nunito().fontFamily,
    textTheme: _textTheme(AppColors.textPrimaryDark),
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.backgroundDark,
      foregroundColor: AppColors.textPrimaryDark,
      elevation: 0,
      centerTitle: true,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(AppRadius.sm),
        ),
        minimumSize: const Size(double.infinity, 52),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.surfaceAltDark,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.all(AppRadius.sm),
        borderSide: BorderSide.none,
      ),
      hintStyle: GoogleFonts.inter(
        color: AppColors.textSecondaryDark,
        fontSize: 14,
      ),
    ),
  );

  static TextTheme _textTheme(Color primary) => TextTheme(
    displayLarge:  GoogleFonts.nunito(fontSize: 28, fontWeight: FontWeight.w700, color: primary),
    displayMedium: GoogleFonts.nunito(fontSize: 22, fontWeight: FontWeight.w700, color: primary),
    displaySmall:  GoogleFonts.nunito(fontSize: 18, fontWeight: FontWeight.w600, color: primary),
    headlineMedium:GoogleFonts.nunito(fontSize: 16, fontWeight: FontWeight.w600, color: primary),
    bodyLarge:     GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w400, color: primary),
    bodyMedium:    GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w400, color: primary),
    bodySmall:     GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w400, color: primary),
    labelLarge:    GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500, color: primary),
  );
}
