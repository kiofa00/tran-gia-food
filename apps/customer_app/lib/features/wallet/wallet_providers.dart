import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/api_client_provider.dart';

final walletProvider =
    FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  final hasToken = await api.hasToken();
  if (!hasToken) return {'balance': 0, 'pending_refund': 0};
  try {
    return await api.get('/users/me/wallet');
  } catch (_) {
    return {'balance': 0, 'pending_refund': 0};
  }
});

final linkedBanksProvider =
    FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  final hasToken = await api.hasToken();
  if (!hasToken) return [];
  try {
    final result = await api.get('/users/me/banks');
    final list = result['data'] as List? ?? [];
    return list.cast<Map<String, dynamic>>();
  } catch (_) {
    return [];
  }
});

final transactionHistoryProvider =
    FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  final hasToken = await api.hasToken();
  if (!hasToken) return [];
  try {
    final result =
        await api.get('/users/me/transactions', query: {'limit': '20'});
    final list = result['data'] as List? ?? [];
    return list.cast<Map<String, dynamic>>();
  } catch (_) {
    return [];
  }
});
