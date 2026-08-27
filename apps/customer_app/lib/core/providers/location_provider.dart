import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import '../services/location_service.dart';

/// Provider for current GPS location of the user with 5-minute cache
final userLocationProvider = FutureProvider.autoDispose<Position?>((ref) async {
  final link = ref.keepAlive();
  final timer = Timer(const Duration(minutes: 5), () {
    link.close();
  });
  ref.onDispose(() => timer.cancel());

  return await LocationService.getCurrentPosition();
});
