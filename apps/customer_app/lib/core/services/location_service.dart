import 'dart:async';
import 'package:geolocator/geolocator.dart';

/// Service to interact with device GPS and Geolocator
class LocationService {
  LocationService._();

  /// Determine the current position of the device.
  /// Returns null if location service is disabled, permission is denied, or request times out.
  static Future<Position?> getCurrentPosition() async {
    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled()
          .timeout(const Duration(seconds: 2), onTimeout: () => false);
      if (!serviceEnabled) {
        return null;
      }

      var permission = await Geolocator.checkPermission()
          .timeout(const Duration(seconds: 2), onTimeout: () => LocationPermission.denied);

      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission()
            .timeout(const Duration(seconds: 20), onTimeout: () => LocationPermission.denied);
        if (permission == LocationPermission.denied ||
            permission == LocationPermission.deniedForever) {
          return null;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return null;
      }

      // 1. Check last known position first for instantaneous response
      try {
        final lastKnown = await Geolocator.getLastKnownPosition()
            .timeout(const Duration(seconds: 2), onTimeout: () => null);
        if (lastKnown != null) {
          return lastKnown;
        }
      } catch (_) {}

      // 2. Fetch fresh position with strict 5s timeout so it never hangs in browsers
      return await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.medium,
        ),
      ).timeout(const Duration(seconds: 5));
    } catch (_) {
      return null;
    }
  }
}
