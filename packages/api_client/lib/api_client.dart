import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

/// Central HTTP client for all NestJS backend requests.
/// Automatically attaches JWT Bearer token from local storage.
class ApiClient {
  static const _tokenKey = 'auth_token';

  final String baseUrl;
  final http.Client _http;

  ApiClient({String? customBaseUrl, http.Client? client})
      : baseUrl = customBaseUrl ?? _resolveBaseUrl(),
        _http = client ?? http.Client();

  static String _resolveBaseUrl() {
    if (kIsWeb) return 'http://localhost:3000/api';
    try {
      if (Platform.isAndroid) return 'http://10.0.2.2:3000/api';
    } catch (_) {}
    return 'http://localhost:3000/api';
  }

  // --- Token management ---

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }

  // --- Request helpers ---

  Future<Map<String, String>> _headers({bool auth = true}) async {
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (auth) {
      final token = await _getToken();
      if (token != null) headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  Map<String, dynamic> _parse(http.Response res) {
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode >= 400) {
      throw ApiException(
        statusCode: res.statusCode,
        message: body['message']?.toString() ?? 'Loi khong xac dinh',
      );
    }
    return body;
  }

  // --- HTTP Methods ---

  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, String>? query,
    bool auth = true,
  }) async {
    final uri = Uri.parse('$baseUrl$path').replace(queryParameters: query);
    final res = await _http
        .get(uri, headers: await _headers(auth: auth))
        .timeout(const Duration(seconds: 15));
    return _parse(res);
  }

  Future<Map<String, dynamic>> post(
    String path,
    Map<String, dynamic> body, {
    bool auth = true,
  }) async {
    final uri = Uri.parse('$baseUrl$path');
    final res = await _http
        .post(uri, headers: await _headers(auth: auth), body: jsonEncode(body))
        .timeout(const Duration(seconds: 15));
    return _parse(res);
  }

  Future<Map<String, dynamic>> put(
    String path,
    Map<String, dynamic> body, {
    bool auth = true,
  }) async {
    final uri = Uri.parse('$baseUrl$path');
    final res = await _http
        .put(uri, headers: await _headers(auth: auth), body: jsonEncode(body))
        .timeout(const Duration(seconds: 15));
    return _parse(res);
  }

  Future<Map<String, dynamic>> patch(
    String path,
    Map<String, dynamic> body, {
    bool auth = true,
  }) async {
    final uri = Uri.parse('$baseUrl$path');
    final res = await _http
        .patch(uri, headers: await _headers(auth: auth), body: jsonEncode(body))
        .timeout(const Duration(seconds: 15));
    return _parse(res);
  }

  Future<Map<String, dynamic>> delete(
    String path, {
    bool auth = true,
  }) async {
    final uri = Uri.parse('$baseUrl$path');
    final res = await _http
        .delete(uri, headers: await _headers(auth: auth))
        .timeout(const Duration(seconds: 15));
    return _parse(res);
  }
}

/// Typed API error with HTTP status code.
class ApiException implements Exception {
  final int statusCode;
  final String message;

  const ApiException({required this.statusCode, required this.message});

  bool get isUnauthorized => statusCode == 401;
  bool get isForbidden => statusCode == 403;
  bool get isNotFound => statusCode == 404;

  @override
  String toString() => 'ApiException($statusCode): $message';
}
