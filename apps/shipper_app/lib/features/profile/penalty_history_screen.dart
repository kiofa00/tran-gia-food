import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

final shipperPenaltiesProvider =
    FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  final result = await api.get('/shippers/me/penalties');
  final list = result['data'] as List? ?? [];
  return list.cast<Map<String, dynamic>>();
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class PenaltyHistoryScreen extends ConsumerWidget {
  const PenaltyHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final penaltiesAsync = ref.watch(shipperPenaltiesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Lịch Sử Vi Phạm',
          style: TextStyle(fontWeight: AppFontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => context.pop(),
        ),
      ),
      body: penaltiesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => _buildMockList(),
        data: (list) => list.isEmpty ? _buildMockList() : _buildContent(list),
      ),
    );
  }

  Widget _buildMockList() {
    final mock = [
      {
        'reason': 'Hủy đơn quá nhiều (tỉ lệ 15%)',
        'level': 1,
        'created_at': '2026-08-10',
        'expires_at': '2026-08-24',
        'is_active': true,
        'order_id': '#9801',
      },
      {
        'reason': 'Giao hàng trễ thường xuyên (3 lần trong tuần)',
        'level': 0,
        'created_at': '2026-07-28',
        'expires_at': null,
        'is_active': false,
        'order_id': null,
      },
    ];
    return _buildContent(mock);
  }

  Widget _buildContent(List<Map<String, dynamic>> penalties) {
    final activeCount = penalties.where((p) => p['is_active'] == true).length;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Status summary
        _SummaryCard(activeCount: activeCount, total: penalties.length),
        const SizedBox(height: 20),

        // How penalties work
        _ExplainerCard(),
        const SizedBox(height: 20),

        // Penalty list
        const Text(
          'Lịch Sử',
          style: TextStyle(fontSize: AppFontSize.title, fontWeight: AppFontWeight.bold),
        ),
        const SizedBox(height: 12),
        if (penalties.isEmpty)
          _EmptyState()
        else
          ...penalties.map((p) => _PenaltyCard(penalty: p)),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Summary Card
// ---------------------------------------------------------------------------

class _SummaryCard extends StatelessWidget {
  final int activeCount;
  final int total;

  const _SummaryCard({required this.activeCount, required this.total});

  @override
  Widget build(BuildContext context) {
    final isClean = activeCount == 0;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isClean
              ? [AppColors.success, const Color(0xFF2ECC71)]
              : [AppColors.error, const Color(0xFFE74C3C)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: const BorderRadius.all(AppRadius.lg),
        boxShadow: [
          BoxShadow(
            color: (isClean ? AppColors.success : AppColors.error)
                .withValues(alpha: 0.35),
            blurRadius: 14,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Row(
        children: [
          Icon(
            isClean ? Iconsax.shield_tick5 : Iconsax.warning_2,
            color: Colors.white,
            size: 48,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isClean ? 'Tài khoản tốt' : '$activeCount vi phạm đang hiệu lực',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: AppFontSize.title,
                    fontWeight: AppFontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  isClean
                      ? 'Không có vi phạm nào đang hiệu lực'
                      : 'Các vi phạm có thể ảnh hưởng thứ tự nhận đơn',
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: AppFontSize.sm,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Explainer Card
// ---------------------------------------------------------------------------

class _ExplainerCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surfaceAltLight,
        borderRadius: const BorderRadius.all(AppRadius.md),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Iconsax.info_circle, size: 16, color: AppColors.primary),
              SizedBox(width: 6),
              Text(
                'Hệ thống điểm phạt',
                style: TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.base),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _LevelRow(level: 0, label: 'Cảnh báo', desc: 'Ghi chú vào hồ sơ'),
          _LevelRow(level: 1, label: 'Hạ ưu tiên', desc: 'Ít đơn hơn trong 14 ngày'),
          _LevelRow(level: 2, label: 'Tạm khóa 7 ngày', desc: 'Không nhận đơn được'),
          _LevelRow(level: 3, label: 'Khóa vĩnh viễn', desc: 'Yêu cầu Admin xem xét'),
        ],
      ),
    );
  }
}

class _LevelRow extends StatelessWidget {
  final int level;
  final String label;
  final String desc;

  const _LevelRow({required this.level, required this.label, required this.desc});

  static const _colors = [
    AppColors.textSecondaryLight,
    AppColors.warning,
    AppColors.error,
    AppColors.error,
  ];

  @override
  Widget build(BuildContext context) {
    final color = _colors[level.clamp(0, 3)];
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 8),
          Text(
            label,
            style: TextStyle(
              fontSize: AppFontSize.sm,
              fontWeight: AppFontWeight.semiBold,
              color: color,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            '— $desc',
            style: const TextStyle(
              fontSize: AppFontSize.sm,
              color: AppColors.textSecondaryLight,
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Penalty Card
// ---------------------------------------------------------------------------

class _PenaltyCard extends StatelessWidget {
  final Map<String, dynamic> penalty;
  const _PenaltyCard({required this.penalty});

  @override
  Widget build(BuildContext context) {
    final reason = penalty['reason'] as String? ?? 'Vi phạm';
    final level = (penalty['level'] as num?)?.toInt() ?? 0;
    final createdAt = penalty['created_at'] as String? ?? '';
    final expiresAt = penalty['expires_at'] as String?;
    final isActive = penalty['is_active'] as bool? ?? false;
    final orderId = penalty['order_id'] as String?;

    final levelColors = [
      AppColors.textSecondaryLight,
      AppColors.warning,
      AppColors.error,
      AppColors.error,
    ];
    final levelLabels = ['Cảnh báo', 'Hạ ưu tiên', 'Tạm khóa', 'Khóa vĩnh viễn'];
    final color = levelColors[level.clamp(0, 3)];
    final levelLabel = levelLabels[level.clamp(0, 3)];

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.all(AppRadius.md),
        border: Border.all(
          color: isActive ? color.withValues(alpha: 0.4) : AppColors.dividerLight,
          width: isActive ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.1),
                    borderRadius: const BorderRadius.all(AppRadius.full),
                  ),
                  child: Text(
                    levelLabel,
                    style: TextStyle(
                      fontSize: AppFontSize.xs,
                      fontWeight: AppFontWeight.bold,
                      color: color,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                if (isActive)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.error.withValues(alpha: 0.08),
                      borderRadius: const BorderRadius.all(AppRadius.full),
                    ),
                    child: const Text(
                      '● Đang hiệu lực',
                      style: TextStyle(
                        fontSize: AppFontSize.xs,
                        fontWeight: AppFontWeight.bold,
                        color: AppColors.error,
                      ),
                    ),
                  )
                else
                  const Text(
                    '✓ Đã hết hạn',
                    style: TextStyle(
                      fontSize: AppFontSize.xs,
                      color: AppColors.textSecondaryLight,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              reason,
              style: const TextStyle(
                fontWeight: AppFontWeight.semiBold,
                fontSize: AppFontSize.base,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Iconsax.calendar_1, size: 13, color: AppColors.textSecondaryLight),
                const SizedBox(width: 4),
                Text(
                  'Ngày: $createdAt',
                  style: const TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight),
                ),
                if (expiresAt != null) ...[
                  const SizedBox(width: 12),
                  const Icon(Iconsax.calendar_remove, size: 13, color: AppColors.textSecondaryLight),
                  const SizedBox(width: 4),
                  Text(
                    'Hết: $expiresAt',
                    style: const TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight),
                  ),
                ],
              ],
            ),
            if (orderId != null) ...[
              const SizedBox(height: 4),
              Text(
                'Liên quan đơn: $orderId',
                style: const TextStyle(
                  fontSize: AppFontSize.sm,
                  color: AppColors.primary,
                  fontWeight: AppFontWeight.semiBold,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

class _EmptyState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        children: [
          const SizedBox(height: 40),
          const Icon(Iconsax.shield_tick5, size: 64, color: AppColors.success),
          const SizedBox(height: 16),
          const Text(
            'Không có vi phạm nào',
            style: TextStyle(fontSize: AppFontSize.title, fontWeight: AppFontWeight.bold),
          ),
          const SizedBox(height: 6),
          const Text(
            'Hồ sơ của bạn sạch! Tiếp tục duy trì nhé 🎉',
            style: TextStyle(color: AppColors.textSecondaryLight),
          ),
        ],
      ),
    );
  }
}
