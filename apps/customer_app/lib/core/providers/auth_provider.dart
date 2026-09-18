import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';
import 'api_client_provider.dart';

class AuthState {
  final bool isAuthenticated;
  final String? token;

  const AuthState({
    required this.isAuthenticated,
    this.token,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AuthState &&
          runtimeType == other.runtimeType &&
          isAuthenticated == other.isAuthenticated &&
          token == other.token;

  @override
  int get hashCode => Object.hash(isAuthenticated, token);
}

class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() {
    _init();
    return const AuthState(isAuthenticated: false);
  }

  Future<void> _init() async {
    final api = ref.read(apiClientProvider);
    final token = await api.getToken();
    state = AuthState(
      isAuthenticated: token != null && token.isNotEmpty,
      token: token,
    );
  }

  Future<void> setLoggedIn(String token) async {
    final api = ref.read(apiClientProvider);
    await api.saveToken(token);
    state = AuthState(isAuthenticated: true, token: token);
  }

  Future<GoogleAuthResult?> loginWithGoogle() async {
    final authService = ref.read(authServiceProvider);
    final result = await authService.signInWithGoogle();
    if (result != null && result.accessToken.isNotEmpty) {
      await setLoggedIn(result.accessToken);
    }
    return result;
  }

  Future<void> logout() async {
    final api = ref.read(apiClientProvider);
    await api.clearToken();
    state = const AuthState(isAuthenticated: false);
  }
}

final authStateProvider =
    NotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);
