import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import '../../features/address/providers/address_provider.dart';
import '../services/location_service.dart';

/// Provider for current GPS location of the user with 5-minute cache
final userLocationProvider = FutureProvider.autoDispose<Position?>((ref) async {
  final link = ref.keepAlive();
  final timer = Timer(const Duration(minutes: 5), () {
    link.close();
  });
  ref.onDispose(() => timer.cancel());

  return await LocationService.getCurrentPosition()
      .timeout(const Duration(seconds: 5), onTimeout: () => null);
});

/// Provider resolving the user's GPS position into a human-readable address
final userAddressDisplayNameProvider =
    FutureProvider.autoDispose<String>((ref) async {
  final pos = await ref.watch(userLocationProvider.future);
  if (pos == null) return 'Chọn địa chỉ giao hàng';

  try {
    final geo = ref.read(geocodingServiceProvider);
    final res = await geo.reverse(pos.latitude, pos.longitude);
    if (res != null) {
      final fullAddr = res['fullAddress'] as String?;
      if (fullAddr != null && fullAddr.isNotEmpty) {
        return fullAddr;
      }
      final street = res['street'] as String? ?? res['road'] as String?;
      final ward = res['ward'] as String?;
      final district = res['district'] as String?;
      final parts = [street, ward, district]
          .where((s) => s != null && s.isNotEmpty)
          .toList();
      if (parts.isNotEmpty) return parts.join(', ');
    }
  } catch (_) {}

  return 'Vị trí hiện tại của bạn';
});
