import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/api_client_provider.dart';

enum VoucherFilter {
  all,
  platform,
  restaurant,
  freeShip,
}

class VoucherQueryArgs {
  final String search;
  final VoucherFilter filter;

  const VoucherQueryArgs({this.search = '', this.filter = VoucherFilter.all});

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is VoucherQueryArgs &&
          runtimeType == other.runtimeType &&
          search == other.search &&
          filter == other.filter;

  @override
  int get hashCode => Object.hash(search, filter);
}

/// Provider danh sách voucher công khai trong Kho Voucher (kèm cache 5 phút)
final vouchersProvider = FutureProvider.autoDispose
    .family<List<Map<String, dynamic>>, VoucherQueryArgs>((ref, args) async {
  final link = ref.keepAlive();
  final timer = Timer(const Duration(minutes: 5), () {
    link.close();
  });
  ref.onDispose(() => timer.cancel());

  final api = ref.read(apiClientProvider);
  final search = args.search.trim();
  final filter = args.filter;

  final queryParams = <String, String>{};
  if (search.isNotEmpty) {
    queryParams['search'] = search;
  }
  if (filter == VoucherFilter.platform) {
    queryParams['type'] = 'platform';
  } else if (filter == VoucherFilter.restaurant) {
    queryParams['type'] = 'restaurant';
  } else if (filter == VoucherFilter.freeShip) {
    queryParams['type'] = 'ship';
  }

  try {
    final result = await api.get(
      '/vouchers/active',
      query: queryParams.isNotEmpty ? queryParams : null,
      auth: false,
    );
    final raw = result['data'] ?? result;
    if (raw is List) {
      return raw.cast<Map<String, dynamic>>();
    }
    return [];
  } catch (_) {
    return [];
  }
});

/// Provider danh sách voucher trong Ví cá nhân của người dùng (kèm cache 5 phút)
final myWalletVouchersProvider =
    FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final link = ref.keepAlive();
  final timer = Timer(const Duration(minutes: 5), () {
    link.close();
  });
  ref.onDispose(() => timer.cancel());

  final api = ref.read(apiClientProvider);
  final hasToken = await api.hasToken();
  if (!hasToken) {
    return [];
  }

  try {
    final result = await api.get('/vouchers/my-wallet', auth: true);
    final raw = result['data'] ?? result;
    if (raw is List) {
      return raw.cast<Map<String, dynamic>>();
    }
    return [];
  } catch (_) {
    return [];
  }
});
