import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:api_client/api_client.dart';

/// Global singleton ApiClient provider — used by all feature providers.
/// The [ApiClient] is constructed once per app lifecycle and handles:
/// - JWT Bearer token injection from SharedPreferences
/// - Platform-aware base URL resolution (Android emulator vs iOS vs Web)
/// - Timeout (15s) and typed [ApiException] on HTTP ≥ 400
final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

