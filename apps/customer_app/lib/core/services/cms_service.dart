import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;

class CmsBanner {
  final int id;
  final String title;
  final String imageUrl;
  final String? targetUrl;

  CmsBanner({
    required this.id,
    required this.title,
    required this.imageUrl,
    this.targetUrl,
  });

  factory CmsBanner.fromJson(Map<String, dynamic> json) {
    final attributes = json['attributes'] ?? json;
    return CmsBanner(
      id: json['id'] ?? 0,
      title: attributes['title'] ?? 'Khuyến mãi đặc biệt',
      imageUrl: attributes['imageUrl'] ?? 'https://picsum.photos/800/400',
      targetUrl: attributes['targetUrl'],
    );
  }
}

class CmsService {
  final String cmsBaseUrl;

  CmsService({String? customBaseUrl})
      : cmsBaseUrl = customBaseUrl ?? _getDefaultBaseUrl();

  static String _getDefaultBaseUrl() {
    if (kIsWeb) return 'http://localhost:1337/api';
    try {
      if (Platform.isAndroid) return 'http://10.0.2.2:1337/api';
    } catch (_) {}
    return 'http://localhost:1337/api';
  }

  /// Fetch active promotional marketing banners from Strapi CMS
  Future<List<CmsBanner>> fetchBanners() async {
    try {
      final response = await http
          .get(Uri.parse('$cmsBaseUrl/banners'))
          .timeout(const Duration(seconds: 3));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final List data = body['data'] ?? [];
        return data.map((item) => CmsBanner.fromJson(item)).toList();
      }
    } catch (_) {}

    return [];
  }

  /// Fetch dynamic i18n text copy translations from Strapi CMS
  Future<Map<String, String>> fetchTranslations({String locale = 'vi'}) async {
    try {
      final response = await http
          .get(Uri.parse('$cmsBaseUrl/translations?locale=$locale'))
          .timeout(const Duration(seconds: 3));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final List data = body['data'] ?? [];
        final Map<String, String> resultMap = {};
        for (var item in data) {
          final attrs = item['attributes'] ?? item;
          if (attrs['key'] != null && attrs['value'] != null) {
            resultMap[attrs['key']] = attrs['value'];
          }
        }
        return resultMap;
      }
    } catch (_) {
      // Fallback translations map
    }

    return {
      'home.search_placeholder': 'Tìm món ăn, quán ngon xung quanh...',
      'order.status_picking_up': 'Tài xế đang đến quán lấy món',
    };
  }
}
