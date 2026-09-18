import 'package:flutter_test/flutter_test.dart';
import 'package:customer_app/core/services/auth_service.dart';
import 'package:api_client/api_client.dart';

class MockApiClient extends Fake implements ApiClient {
  String? lastPath;
  dynamic lastBody;
  Map<String, dynamic> mockResponse = {};

  @override
  Future<Map<String, dynamic>> post(
    String path,
    dynamic body, {
    bool auth = true,
  }) async {
    lastPath = path;
    lastBody = body;
    return mockResponse;
  }
}

void main() {
  group('AuthService Tests', () {
    late MockApiClient mockApi;
    late AuthService authService;

    setUp(() {
      mockApi = MockApiClient();
      authService = AuthService(mockApi);
    });

    test('sendOtp sends phone number to /auth/send-otp', () async {
      mockApi.mockResponse = {'message': 'OTP sent', 'devOtp': '123456'};

      final result = await authService.sendOtp('0901234567');

      expect(mockApi.lastPath, equals('/auth/send-otp'));
      expect(mockApi.lastBody, equals({'phone': '0901234567'}));
      expect(result['devOtp'], equals('123456'));
    });

    test('verifyOtp sends phone and otp to /auth/verify-otp', () async {
      mockApi.mockResponse = {
        'accessToken': 'mock-access-token',
        'refreshToken': 'mock-refresh-token',
        'isNewUser': false,
      };

      final result = await authService.verifyOtp(
        phone: '0901234567',
        otp: '123456',
      );

      expect(mockApi.lastPath, equals('/auth/verify-otp'));
      expect(mockApi.lastBody, equals({'phone': '0901234567', 'otp': '123456'}));
      expect(result['accessToken'], equals('mock-access-token'));
      expect(result['isNewUser'], isFalse);
    });

    test('GoogleAuthResult constructs correctly', () {
      const authResult = GoogleAuthResult(
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        user: {'id': 'user-1', 'email': 'test@gmail.com', 'name': 'Tester'},
        isNewUser: true,
      );

      expect(authResult.accessToken, equals('access-123'));
      expect(authResult.refreshToken, equals('refresh-456'));
      expect(authResult.user['email'], equals('test@gmail.com'));
      expect(authResult.isNewUser, isTrue);
    });
  });
}
