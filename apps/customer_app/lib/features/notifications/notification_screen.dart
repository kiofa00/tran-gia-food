import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final notificationsProvider = FutureProvider.autoDispose<Map<String, dynamic>>((
  ref,
) async {
  final api = ref.read(apiClientProvider);
  final hasToken = await api.hasToken();
  if (!hasToken) return {'data': [], 'isLoggedIn': false};
  try {
    final res = await api.get('/users/me/notifications');
    return {...res, 'isLoggedIn': true};
  } catch (e) {
    if (e is ApiException && e.isUnauthorized) {
      return {'data': [], 'isLoggedIn': false};
    }
    rethrow;
  }
});

final unreadCountProvider = FutureProvider.autoDispose<int>((ref) async {
  final api = ref.read(apiClientProvider);
  final hasToken = await api.hasToken();
  if (!hasToken) return 0;
  try {
    final res = await api.get('/users/me/notifications/unread-count');
    return (res['count'] as num?)?.toInt() ?? 0;
  } catch (_) {
    return 0;
  }
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
        title: const Text(
          'Thông Báo',
          style: TextStyle(fontWeight: AppFontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => context.pop(),
        ),
        actions: [
          notifAsync.maybeWhen(
            data: (res) {
              final isLoggedIn = res['isLoggedIn'] as bool? ?? false;
              final notifications = List<Map<String, dynamic>>.from(
                res['data'] ?? [],
              );
              if (!isLoggedIn || notifications.isEmpty) {
                return const SizedBox.shrink();
              }

              return TextButton(
                onPressed: () async {
                  final api = ref.read(apiClientProvider);
                  if (!await api.hasToken()) return;
                  try {
                    await api.patch('/users/me/notifications/read-all', {});
                    ref.invalidate(notificationsProvider);
                    ref.invalidate(unreadCountProvider);
                  } catch (_) {}
                },
                child: const Text(
                  'Đọc tất cả',
                  style: TextStyle(color: AppColors.primary),
                ),
              );
            },
            orElse: () => const SizedBox.shrink(),
          ),
        ],
      ),
      body: notifAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => AppEmptyState(
          icon: Iconsax.warning_2,
          iconColor: AppColors.error,
          title: 'Không thể tải thông báo',
          description: e.toString(),
          actionText: 'Thử lại',
          actionIcon: Icons.refresh_rounded,
          onAction: () => ref.invalidate(notificationsProvider),
        ),
        data: (res) {
          final isLoggedIn = res['isLoggedIn'] as bool? ?? false;
          if (!isLoggedIn) {
            return const _UnauthenticatedView();
          }

          final notifications = List<Map<String, dynamic>>.from(
            res['data'] ?? [],
          );
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
                  if (!await api.hasToken()) return;
                  try {
                    await api.patch('/users/me/notifications/$id/read', {});
                    ref.invalidate(notificationsProvider);
                    ref.invalidate(unreadCountProvider);
                  } catch (_) {}
                },
              ),
            ),
          );
        },
      ),
    );
  }
}

class _UnauthenticatedView extends StatelessWidget {
  const _UnauthenticatedView();

  @override
  Widget build(BuildContext context) {
    return AppEmptyState(
      icon: Iconsax.notification_status,
      title: 'Đăng nhập để xem thông báo',
      description:
          'Đăng nhập tài khoản để nhận cập nhật đơn hàng, khuyến mãi và thông báo quan trọng.',
      actionText: 'Đăng Nhập Ngay',
      actionIcon: Iconsax.login,
      onAction: () => context.push('/auth'),
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

    return Material(
      color: isRead
          ? Colors.transparent
          : AppColors.primary.withValues(alpha: 0.05),
      child: ListTile(
        onTap: onTap,
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
            Text(
              body,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: AppFontSize.sm,
                color: AppColors.textSecondaryLight,
              ),
            ),
            if (createdAt != null) ...[
              const SizedBox(height: 4),
              Text(
                _formatTime(createdAt),
                style: const TextStyle(
                  fontSize: AppFontSize.xs,
                  color: AppColors.textSecondaryLight,
                ),
              ),
            ],
          ],
        ),
        trailing: !isRead
            ? Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
              )
            : null,
      ),
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
    return const AppEmptyState(
      icon: Iconsax.notification_status,
      title: 'Chưa có thông báo nào',
      description:
          'Các thông báo mới về đơn hàng và ưu đãi sẽ hiển thị tại đây.',
    );
  }
}
