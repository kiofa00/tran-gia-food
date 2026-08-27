import 'dart:convert';
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
      : cmsBaseUrl = customBaseUrl ?? _getBaseUrl();

  static String _getBaseUrl() {
    const envUrl = String.fromEnvironment('CMS_URL');
    if (envUrl.isNotEmpty) return envUrl;
    throw StateError(
      'Biến môi trường CMS_URL chưa được cấu hình. Vui lòng truyền qua --dart-define-from-file=.env',
    );
  }

  /// Fetch active promotional marketing banners from CMS
  Future<List<CmsBanner>> fetchBanners() async {
    try {
      final response = await http
          .get(Uri.parse('$cmsBaseUrl/banners'))
          .timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final List data = body['data'] ?? [];
        return data.map((item) => CmsBanner.fromJson(item)).toList();
      }
    } catch (_) {}

    return [];
  }

  /// Fetch dynamic i18n text copy translations from CMS
  Future<Map<String, String>> fetchTranslations({String locale = 'vi'}) async {
    try {
      final response = await http
          .get(Uri.parse('$cmsBaseUrl/translations?locale=$locale'))
          .timeout(const Duration(seconds: 5));

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
    } catch (_) {}

    return {};
  }
}
