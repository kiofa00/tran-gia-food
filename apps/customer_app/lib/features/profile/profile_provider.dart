import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/api_client_provider.dart';

final myProfileProvider =
    FutureProvider.autoDispose<Map<String, dynamic>?>((ref) async {
  final api = ref.read(apiClientProvider);
  final hasToken = await api.hasToken();
  if (!hasToken) return null;
  try {
    return await api.get('/users/me');
  } catch (e) {
    if (e is ApiException && e.isUnauthorized) return null;
    rethrow;
  }
});
