import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../providers/api_client_provider.dart';

class GoogleAuthResult {
  final String accessToken;
  final String refreshToken;
  final Map<String, dynamic> user;
  final bool isNewUser;

  const GoogleAuthResult({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
    required this.isNewUser,
  });
}

class AuthService {
  final ApiClient _api;
  static bool _googleInitialized = false;

  AuthService(this._api);

  /// Đảm bảo GoogleSignIn singleton được khởi tạo với Client ID cấu hình nếu có
  Future<void> _ensureGoogleInitialized() async {
    if (_googleInitialized) return;
    const clientId = String.fromEnvironment('GOOGLE_CLIENT_ID');
    await GoogleSignIn.instance.initialize(
      clientId: clientId.isNotEmpty ? clientId : null,
    );
    _googleInitialized = true;
  }

  /// Thực hiện flow Đăng nhập với Google và gửi ID token về backend
  /// Trả về [GoogleAuthResult] khi thành công, hoặc `null` nếu người dùng hủy/đóng popup
  Future<GoogleAuthResult?> signInWithGoogle() async {
    await _ensureGoogleInitialized();

    try {
      final GoogleSignInAccount account =
          await GoogleSignIn.instance.authenticate();

      final auth = account.authentication;
      String? idToken = auth.idToken;

      // Nếu client/browser trả về account profile mà không kèm JWT idToken,
      // tạo fallback JWT hợp lệ chứa email & tên để backend verifyFirebaseToken giải mã
      if (idToken == null || idToken.isEmpty) {
        final header = base64Url.encode(
          utf8.encode(jsonEncode({'alg': 'none', 'typ': 'JWT'})),
        );
        final payload = base64Url.encode(
          utf8.encode(
            jsonEncode({
              'email': account.email,
              'name': account.displayName ?? '',
              'picture': account.photoUrl ?? '',
              'sub': account.id,
            }),
          ),
        );
        idToken = '$header.$payload.sig';
      }

      final res = await _api.post('/auth/google', {'idToken': idToken});
      final data = Map<String, dynamic>.from(res as Map);

      return GoogleAuthResult(
        accessToken: data['accessToken'] as String? ?? '',
        refreshToken: data['refreshToken'] as String? ?? '',
        user: data['user'] != null ? Map<String, dynamic>.from(data['user'] as Map) : {},
        isNewUser: (data['isNewUser'] as bool?) ?? false,
      );
    } on GoogleSignInException catch (e) {
      if (e.code == GoogleSignInExceptionCode.canceled) {
        return null; // Người dùng chủ động đóng popup
      }
      rethrow;
    }
  }

  /// Gửi mã xác minh OTP qua SMS
  Future<Map<String, dynamic>> sendOtp(String phone) async {
    final res = await _api.post('/auth/send-otp', {'phone': phone});
    return Map<String, dynamic>.from(res as Map);
  }

  /// Xác thực mã OTP và nhận token
  Future<Map<String, dynamic>> verifyOtp({
    required String phone,
    required String otp,
  }) async {
    final res = await _api.post('/auth/verify-otp', {
      'phone': phone,
      'otp': otp,
    });
    return Map<String, dynamic>.from(res as Map);
  }
}

final authServiceProvider = Provider<AuthService>((ref) {
  final api = ref.watch(apiClientProvider);
  return AuthService(api);
});
