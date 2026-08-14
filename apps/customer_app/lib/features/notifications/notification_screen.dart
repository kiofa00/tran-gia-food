import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final notificationsProvider =
    FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  return api.get('/users/me/notifications');
});

final unreadCountProvider = FutureProvider.autoDispose<int>((ref) async {
  final api = ref.read(apiClientProvider);
  final res = await api.get('/users/me/notifications/unread-count');
  return (res['count'] as num?)?.toInt() ?? 0;
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class NotificationScreen extends ConsumerWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifAsync = ref.watch(notificationsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Thông Báo', style: TextStyle(fontWeight: AppFontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          TextButton(
            onPressed: () async {
              final api = ref.read(apiClientProvider);
              await api.patch('/users/me/notifications/read-all', {});
              ref.invalidate(notificationsProvider);
              ref.invalidate(unreadCountProvider);
            },
            child: const Text('Đọc tất cả', style: TextStyle(color: AppColors.primary)),
          ),
        ],
      ),
      body: notifAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Iconsax.warning_2, size: 48, color: AppColors.error),
              const SizedBox(height: 12),
              Text(e.toString(), textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textSecondaryLight)),
            ],
          ),
        ),
        data: (res) {
          final notifications =
              List<Map<String, dynamic>>.from(res['data'] ?? []);

          if (notifications.isEmpty) {
            return const _EmptyView();
          }

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(notificationsProvider);
              ref.invalidate(unreadCountProvider);
            },
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: notifications.length,
              separatorBuilder: (_, _) => const Divider(height: 1, indent: 70),
              itemBuilder: (_, i) => _NotifTile(
                notif: notifications[i],
                onTap: () async {
                  final id = notifications[i]['id'] as String?;
                  if (id == null) return;
                  final api = ref.read(apiClientProvider);
                  await api.patch('/users/me/notifications/$id/read', {});
                  ref.invalidate(notificationsProvider);
                  ref.invalidate(unreadCountProvider);
                },
              ),
            ),
          );
        },
      ),
    );
  }
}

class _NotifTile extends StatelessWidget {
  final Map<String, dynamic> notif;
  final VoidCallback onTap;

  const _NotifTile({required this.notif, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isRead = notif['isRead'] as bool? ?? false;
    final title = notif['title'] as String? ?? '';
    final body = notif['body'] as String? ?? '';
    final type = notif['type'] as String? ?? 'general';
    final createdAt = notif['createdAt'] as String?;

    return ListTile(
      onTap: onTap,
      tileColor: isRead ? null : AppColors.primary.withValues(alpha: 0.05),
      leading: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: _iconColor(type).withValues(alpha: 0.12),
          shape: BoxShape.circle,
        ),
        child: Icon(_iconFor(type), color: _iconColor(type), size: 22),
      ),
      title: Text(
        title,
        style: TextStyle(
          fontWeight: isRead ? AppFontWeight.medium : AppFontWeight.bold,
          fontSize: AppFontSize.base,
        ),
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 2),
          Text(body, maxLines: 2, overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight)),
          if (createdAt != null) ...[
            const SizedBox(height: 4),
            Text(_formatTime(createdAt),
                style: const TextStyle(fontSize: AppFontSize.xs, color: AppColors.textSecondaryLight)),
          ],
        ],
      ),
      trailing: !isRead
          ? Container(
              width: 8,
              height: 8,
              decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
            )
          : null,
    );
  }

  IconData _iconFor(String type) => switch (type) {
        'order' => Iconsax.receipt_item,
        'delivery' => Iconsax.truck_fast,
        'payment' => Iconsax.card,
        'voucher' => Iconsax.discount_shape,
        'system' => Iconsax.info_circle,
        _ => Iconsax.notification5,
      };

  Color _iconColor(String type) => switch (type) {
        'order' => AppColors.primary,
        'delivery' => AppColors.info,
        'payment' => AppColors.success,
        'voucher' => AppColors.warning,
        _ => AppColors.textSecondaryLight,
      };

  String _formatTime(String iso) {
    try {
      final dt = DateTime.parse(iso).toLocal();
      final now = DateTime.now();
      final diff = now.difference(dt);
      if (diff.inMinutes < 60) return '${diff.inMinutes} phút trước';
      if (diff.inHours < 24) return '${diff.inHours} giờ trước';
      return '${diff.inDays} ngày trước';
    } catch (_) {
      return '';
    }
  }
}

class _EmptyView extends StatelessWidget {
  const _EmptyView();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Iconsax.notification_status, size: 64, color: AppColors.textSecondaryLight),
          SizedBox(height: 16),
          Text('Chưa có thông báo nào', style: TextStyle(fontSize: AppFontSize.lg, fontWeight: AppFontWeight.bold)),
          SizedBox(height: 8),
          Text('Các thông báo về đơn hàng sẽ hiển thị tại đây', style: TextStyle(fontSize: AppFontSize.body, color: AppColors.textSecondaryLight), textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
