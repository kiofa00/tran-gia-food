import 'package:intl/intl.dart';

/// Centralized formatting utilities for currency, dates, numbers, and strings
class AppFormatters {
  AppFormatters._();

  static final NumberFormat _currencyFormat = NumberFormat('#,###', 'vi_VN');
  static final DateFormat _dateFormat = DateFormat('dd/MM/yyyy');
  static final DateFormat _dateTimeFormat = DateFormat('dd/MM/yyyy HH:mm');
  static final DateFormat _timeFormat = DateFormat('HH:mm');

  /// Format money to Vietnamese Dong (e.g. 50000 -> 50.000đ)
  static String currency(num? amount) {
    if (amount == null) return '0đ';
    return '${_currencyFormat.format(amount)}đ';
  }

  /// Format date from DateTime or ISO 8601 String
  static String date(dynamic raw, {bool includeTime = false}) {
    if (raw == null) return '';
    try {
      final dt = raw is DateTime ? raw : DateTime.parse(raw.toString()).toLocal();
      return includeTime ? _dateTimeFormat.format(dt) : _dateFormat.format(dt);
    } catch (_) {
      return raw.toString();
    }
  }

  /// Format time only (HH:mm)
  static String time(dynamic raw) {
    if (raw == null) return '';
    try {
      final dt = raw is DateTime ? raw : DateTime.parse(raw.toString()).toLocal();
      return _timeFormat.format(dt);
    } catch (_) {
      return raw.toString();
    }
  }

  /// Format relative time (e.g. "5 phút trước", "2 giờ trước", "Hôm qua")
  static String relativeTime(dynamic raw) {
    if (raw == null) return '';
    try {
      final dt = raw is DateTime ? raw : DateTime.parse(raw.toString()).toLocal();
      final now = DateTime.now();
      final diff = now.difference(dt);

      if (diff.isNegative) return 'Vừa xong';
      if (diff.inMinutes < 1) return 'Vừa xong';
      if (diff.inMinutes < 60) return '${diff.inMinutes} phút trước';
      if (diff.inHours < 24) return '${diff.inHours} giờ trước';
      if (diff.inDays < 7) return '${diff.inDays} ngày trước';
      return _dateFormat.format(dt);
    } catch (_) {
      return '';
    }
  }

  /// Format distance (e.g. 1.2 km or 500 m)
  static String distance(num? distanceKm) {
    if (distanceKm == null) return '';
    if (distanceKm < 1) {
      final meters = (distanceKm * 1000).round();
      return '$meters m';
    }
    return '${distanceKm.toStringAsFixed(1)} km';
  }
}
