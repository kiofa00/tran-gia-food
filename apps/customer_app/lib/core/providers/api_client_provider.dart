import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:api_client/api_client.dart';

/// Global singleton ApiClient provider — used by all feature providers.
final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());
