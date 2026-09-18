import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/providers/auth_provider.dart';

final myProfileProvider =
    FutureProvider.autoDispose<Map<String, dynamic>?>((ref) async {
  final authState = ref.watch(authStateProvider);
  if (!authState.isAuthenticated) return null;

  final api = ref.read(apiClientProvider);
  try {
    return await api.get('/users/me');
  } catch (e) {
    if (e is ApiException && e.isUnauthorized) {
      await ref.read(authStateProvider.notifier).logout();
      return null;
    }
    rethrow;
  }
});
