import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../models/address_model.dart';

const _kAddressStorageKey = 'tran_gia_saved_addresses';

/// Provider for user's saved address list
final addressListProvider =
    AsyncNotifierProvider<AddressListNotifier, List<AddressItem>>(
  AddressListNotifier.new,
);

class AddressListNotifier extends AsyncNotifier<List<AddressItem>> {
  @override
  Future<List<AddressItem>> build() async {
    return _fetchAddresses();
  }

  Future<List<AddressItem>> _fetchAddresses() async {
    final authState = ref.watch(authStateProvider);
    final prefs = await SharedPreferences.getInstance();

    if (authState.isAuthenticated) {
      final api = ref.read(apiClientProvider);
      try {
        final res = await api.get('/users/me/addresses');
        final dynamic raw = res['data'] ?? res;
        final rawList = raw is List ? raw : <dynamic>[];
        final list = rawList
            .map((e) => AddressItem.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList();

        // Cache to SharedPreferences
        final encoded = jsonEncode(list.map((e) => e.toJson()).toList());
        await prefs.setString(_kAddressStorageKey, encoded);

        // Auto sync default address to selected address
        _updateSelectedIfEmpty(list);
        return list;
      } catch (_) {
        // Fallback to cached addresses on network error
        final cached = prefs.getString(_kAddressStorageKey);
        if (cached != null) {
          final decoded = jsonDecode(cached) as List<dynamic>;
          final list = decoded
              .map((e) => AddressItem.fromJson(e as Map<String, dynamic>))
              .toList();
          _updateSelectedIfEmpty(list);
          return list;
        }
        return [];
      }
    } else {
      // Guest mode: read from SharedPreferences
      final local = prefs.getString(_kAddressStorageKey);
      if (local != null) {
        try {
          final decoded = jsonDecode(local) as List<dynamic>;
          final list = decoded
              .map((e) => AddressItem.fromJson(e as Map<String, dynamic>))
              .toList();
          _updateSelectedIfEmpty(list);
          return list;
        } catch (_) {}
      }
      return [];
    }
  }

  void _updateSelectedIfEmpty(List<AddressItem> list) {
    if (list.isEmpty) return;
    final currentSelected = ref.read(selectedAddressProvider);
    if (currentSelected == null) {
      final defaultItem = list.firstWhere(
        (a) => a.isDefault,
        orElse: () => list.first,
      );
      ref.read(selectedAddressProvider.notifier).select(defaultItem);
    }
  }

  /// Thêm địa chỉ mới
  Future<AddressItem?> addAddress(AddressItem address) async {
    final authState = ref.read(authStateProvider);
    final prefs = await SharedPreferences.getInstance();

    AddressItem createdItem = address;

    if (authState.isAuthenticated) {
      final api = ref.read(apiClientProvider);
      try {
        final payload = {
          'title': address.title,
          if (address.recipientName != null) 'recipientName': address.recipientName,
          if (address.phone != null) 'phone': address.phone,
          'street': address.street,
          'ward': address.ward,
          'district': address.district,
          'city': address.city,
          'fullAddress': address.fullAddress,
          'lat': address.lat,
          'lng': address.lng,
          'isDefault': address.isDefault,
          if (address.deliveryNote != null) 'deliveryNote': address.deliveryNote,
        };
        final res = await api.post('/users/me/addresses', payload);
        final itemData = res['data'] is Map ? res['data'] as Map : res;
        createdItem = AddressItem.fromJson(Map<String, dynamic>.from(itemData));
      } catch (e) {
        rethrow;
      }
    } else {
      // Guest mode
      createdItem = address.copyWith(
        id: 'guest_${DateTime.now().millisecondsSinceEpoch}',
      );
    }

    // Cập nhật state cục bộ
    final currentList = state.value ?? [];
    List<AddressItem> updatedList;
    if (createdItem.isDefault || currentList.isEmpty) {
      updatedList = [
        createdItem.copyWith(isDefault: true),
        ...currentList.map((a) => a.copyWith(isDefault: false)),
      ];
      ref.read(selectedAddressProvider.notifier).select(createdItem);
    } else {
      updatedList = [createdItem, ...currentList];
    }

    state = AsyncValue.data(updatedList);
    final encoded = jsonEncode(updatedList.map((e) => e.toJson()).toList());
    await prefs.setString(_kAddressStorageKey, encoded);

    return createdItem;
  }

  /// Cập nhật địa chỉ
  Future<void> updateAddress(AddressItem address) async {
    final authState = ref.read(authStateProvider);
    final prefs = await SharedPreferences.getInstance();

    if (authState.isAuthenticated) {
      final api = ref.read(apiClientProvider);
      final payload = {
        'title': address.title,
        if (address.recipientName != null) 'recipientName': address.recipientName,
        if (address.phone != null) 'phone': address.phone,
        'street': address.street,
        'ward': address.ward,
        'district': address.district,
        'city': address.city,
        'fullAddress': address.fullAddress,
        'lat': address.lat,
        'lng': address.lng,
        'isDefault': address.isDefault,
        if (address.deliveryNote != null) 'deliveryNote': address.deliveryNote,
      };
      await api.patch('/users/me/addresses/${address.id}', payload);
    }

    final currentList = state.value ?? [];
    final updatedList = currentList.map((a) {
      if (a.id == address.id) {
        return address;
      }
      if (address.isDefault) {
        return a.copyWith(isDefault: false);
      }
      return a;
    }).toList();

    state = AsyncValue.data(updatedList);
    final encoded = jsonEncode(updatedList.map((e) => e.toJson()).toList());
    await prefs.setString(_kAddressStorageKey, encoded);

    final selected = ref.read(selectedAddressProvider);
    if (selected?.id == address.id || address.isDefault) {
      ref.read(selectedAddressProvider.notifier).select(address);
    }
  }

  /// Xóa địa chỉ
  Future<void> deleteAddress(String id) async {
    final authState = ref.read(authStateProvider);
    final prefs = await SharedPreferences.getInstance();

    if (authState.isAuthenticated) {
      final api = ref.read(apiClientProvider);
      await api.delete('/users/me/addresses/$id');
    }

    final currentList = state.value ?? [];
    final updatedList = currentList.where((a) => a.id != id).toList();

    // Nếu xóa đúng địa chỉ mặc định, đặt phần tử đầu tiên làm mặc định
    if (updatedList.isNotEmpty && !updatedList.any((a) => a.isDefault)) {
      final newDefault = updatedList.first.copyWith(isDefault: true);
      updatedList[0] = newDefault;
      ref.read(selectedAddressProvider.notifier).select(newDefault);
    }

    state = AsyncValue.data(updatedList);
    final encoded = jsonEncode(updatedList.map((e) => e.toJson()).toList());
    await prefs.setString(_kAddressStorageKey, encoded);

    final selected = ref.read(selectedAddressProvider);
    if (selected?.id == id) {
      ref.read(selectedAddressProvider.notifier).select(
            updatedList.isNotEmpty ? updatedList.first : null,
          );
    }
  }

  /// Đặt làm mặc định
  Future<void> setDefaultAddress(String id) async {
    final authState = ref.read(authStateProvider);
    final prefs = await SharedPreferences.getInstance();

    if (authState.isAuthenticated) {
      final api = ref.read(apiClientProvider);
      await api.patch('/users/me/addresses/$id/default', {});
    }

    final currentList = state.value ?? [];
    AddressItem? newDefault;
    final updatedList = currentList.map((a) {
      if (a.id == id) {
        newDefault = a.copyWith(isDefault: true);
        return newDefault!;
      }
      return a.copyWith(isDefault: false);
    }).toList();

    state = AsyncValue.data(updatedList);
    final encoded = jsonEncode(updatedList.map((e) => e.toJson()).toList());
    await prefs.setString(_kAddressStorageKey, encoded);

    if (newDefault != null) {
      ref.read(selectedAddressProvider.notifier).select(newDefault);
    }
  }

  /// Refresh dữ liệu từ máy chủ
  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchAddresses());
  }
}

/// Provider cho địa chỉ đang được chọn làm nơi nhận hàng
final selectedAddressProvider =
    NotifierProvider<SelectedAddressNotifier, AddressItem?>(
  SelectedAddressNotifier.new,
);

class SelectedAddressNotifier extends Notifier<AddressItem?> {
  @override
  AddressItem? build() => null;

  void select(AddressItem? address) {
    state = address;
  }
}

/// Dịch vụ Geocoding API từ Backend proxy
class GeocodingService {
  final ApiClient _api;
  GeocodingService(this._api);

  /// Dịch ngược toạ độ (Reverse Geocode)
  Future<Map<String, dynamic>?> reverse(double lat, double lng) async {
    try {
      final res =
          await _api.get('/geocoding/reverse?lat=$lat&lng=$lng', auth: false);
      if (res['data'] is Map) {
        return Map<String, dynamic>.from(res['data'] as Map);
      }
      return res;
    } catch (_) {
      return null;
    }
  }

  /// Tìm kiếm địa điểm / tên đường (Autocomplete Search)
  Future<List<Map<String, dynamic>>> search(String query) async {
    if (query.trim().isEmpty) return [];
    try {
      final res = await _api.get(
        '/geocoding/search?q=${Uri.encodeComponent(query)}',
        auth: false,
      );
      final dynamic raw = res['data'] ?? res;
      if (raw is List) {
        return raw.map((e) => Map<String, dynamic>.from(e as Map)).toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }
}

final geocodingServiceProvider = Provider<GeocodingService>((ref) {
  final api = ref.watch(apiClientProvider);
  return GeocodingService(api);
});
