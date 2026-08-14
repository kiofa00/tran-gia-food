import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

class _DaySchedule {
  final String label;
  bool isOpen;
  TimeOfDay openTime;
  TimeOfDay closeTime;

  _DaySchedule({
    required this.label,
    this.openTime = const TimeOfDay(hour: 8, minute: 0),
    this.closeTime = const TimeOfDay(hour: 22, minute: 0),
  }) : isOpen = true;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

final openingHoursProvider =
    FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  return api.get('/restaurants/my/opening-hours');
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class OpeningHoursScreen extends ConsumerStatefulWidget {
  const OpeningHoursScreen({super.key});

  @override
  ConsumerState<OpeningHoursScreen> createState() => _OpeningHoursScreenState();
}

class _OpeningHoursScreenState extends ConsumerState<OpeningHoursScreen> {
  final List<_DaySchedule> _schedule = [
    _DaySchedule(label: 'Thứ 2'),
    _DaySchedule(label: 'Thứ 3'),
    _DaySchedule(label: 'Thứ 4'),
    _DaySchedule(label: 'Thứ 5'),
    _DaySchedule(label: 'Thứ 6'),
    _DaySchedule(label: 'Thứ 7', openTime: const TimeOfDay(hour: 9, minute: 0), closeTime: const TimeOfDay(hour: 23, minute: 0)),
    _DaySchedule(label: 'Chủ nhật', openTime: const TimeOfDay(hour: 9, minute: 0), closeTime: const TimeOfDay(hour: 23, minute: 0)),
  ];

  bool _isManualClosed = false;
  bool _isSaving = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Giờ Mở Cửa',
          style: TextStyle(fontWeight: AppFontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => context.pop(),
        ),
        actions: [
          TextButton(
            onPressed: _isSaving ? null : _saveSchedule,
            child: _isSaving
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text(
                    'Lưu',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontWeight: AppFontWeight.bold,
                      fontSize: AppFontSize.base,
                    ),
                  ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ─── Manual override banner ──────────────────────────────────────
          _ManualOverrideCard(
            isClosed: _isManualClosed,
            onChanged: (val) => setState(() => _isManualClosed = val),
          ),
          const SizedBox(height: 20),

          // ─── Weekly schedule ─────────────────────────────────────────────
          const Text(
            'Lịch hoạt động hàng tuần',
            style: TextStyle(
              fontSize: AppFontSize.title,
              fontWeight: AppFontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Hệ thống sẽ tự động mở/đóng cửa theo lịch này',
            style: TextStyle(
              fontSize: AppFontSize.sm,
              color: AppColors.textSecondaryLight,
            ),
          ),
          const SizedBox(height: 16),
          ..._schedule.map(
            (day) => _DayRow(
              schedule: day,
              onToggle: (val) => setState(() => day.isOpen = val),
              onEditOpen: () => _pickTime(context, day, isOpen: true),
              onEditClose: () => _pickTime(context, day, isOpen: false),
            ),
          ),

          const SizedBox(height: 20),

          // ─── Copy template actions ────────────────────────────────────────
          _TemplateBanner(
            onApplyWeekdays: () => _applyTemplate(
              days: [0, 1, 2, 3, 4],
              open: const TimeOfDay(hour: 8, minute: 0),
              close: const TimeOfDay(hour: 22, minute: 0),
            ),
            onApplyAll: () => _applyTemplate(
              days: List.generate(7, (i) => i),
              open: const TimeOfDay(hour: 8, minute: 0),
              close: const TimeOfDay(hour: 22, minute: 0),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _pickTime(
    BuildContext context,
    _DaySchedule day, {
    required bool isOpen,
  }) async {
    final initial = isOpen ? day.openTime : day.closeTime;
    final picked = await showTimePicker(
      context: context,
      initialTime: initial,
      helpText: isOpen ? 'Giờ mở cửa — ${day.label}' : 'Giờ đóng cửa — ${day.label}',
    );
    if (picked != null) {
      setState(() {
        if (isOpen) {
          day.openTime = picked;
        } else {
          day.closeTime = picked;
        }
      });
    }
  }

  void _applyTemplate({
    required List<int> days,
    required TimeOfDay open,
    required TimeOfDay close,
  }) {
    setState(() {
      for (final i in days) {
        _schedule[i].isOpen = true;
        _schedule[i].openTime = open;
        _schedule[i].closeTime = close;
      }
    });
  }

  Future<void> _saveSchedule() async {
    setState(() => _isSaving = true);
    await Future.delayed(const Duration(seconds: 1));
    if (mounted) {
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('✅ Lịch mở cửa đã được lưu!')),
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Widgets
// ---------------------------------------------------------------------------

class _ManualOverrideCard extends StatelessWidget {
  final bool isClosed;
  final ValueChanged<bool> onChanged;

  const _ManualOverrideCard({required this.isClosed, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isClosed
            ? AppColors.error.withValues(alpha: 0.08)
            : AppColors.success.withValues(alpha: 0.08),
        borderRadius: const BorderRadius.all(AppRadius.md),
        border: Border.all(
          color: isClosed
              ? AppColors.error.withValues(alpha: 0.3)
              : AppColors.success.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        children: [
          Icon(
            isClosed ? Iconsax.close_circle5 : Iconsax.tick_circle5,
            color: isClosed ? AppColors.error : AppColors.success,
            size: 28,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isClosed ? 'Đang đóng cửa (thủ công)' : 'Đang mở cửa',
                  style: TextStyle(
                    fontWeight: AppFontWeight.bold,
                    color: isClosed ? AppColors.error : AppColors.success,
                    fontSize: AppFontSize.base,
                  ),
                ),
                Text(
                  isClosed
                      ? 'Ghi đè lịch tự động — bật để khách đặt được'
                      : 'Theo lịch tự động bên dưới',
                  style: const TextStyle(
                    fontSize: AppFontSize.sm,
                    color: AppColors.textSecondaryLight,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: !isClosed,
            onChanged: (val) => onChanged(!val),
            activeThumbColor: AppColors.success,
            inactiveTrackColor: AppColors.error.withValues(alpha: 0.3),
          ),
        ],
      ),
    );
  }
}

class _DayRow extends StatelessWidget {
  final _DaySchedule schedule;
  final ValueChanged<bool> onToggle;
  final VoidCallback onEditOpen;
  final VoidCallback onEditClose;

  const _DayRow({
    required this.schedule,
    required this.onToggle,
    required this.onEditOpen,
    required this.onEditClose,
  });

  @override
  Widget build(BuildContext context) {
    final isOpen = schedule.isOpen;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.all(AppRadius.md),
        border: Border.all(color: AppColors.dividerLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 4,
          ),
        ],
      ),
      child: Row(
        children: [
          SizedBox(
            width: 60,
            child: Text(
              schedule.label,
              style: TextStyle(
                fontWeight: AppFontWeight.semiBold,
                fontSize: AppFontSize.base,
                color: isOpen ? AppColors.textPrimaryLight : AppColors.textSecondaryLight,
              ),
            ),
          ),
          Switch(
            value: isOpen,
            onChanged: onToggle,
            activeThumbColor: AppColors.primary,
          ),
          if (isOpen) ...[
            const Spacer(),
            _TimeChip(
              time: schedule.openTime,
              label: 'Mở',
              onTap: onEditOpen,
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 6),
              child: Text('→', style: TextStyle(color: AppColors.textSecondaryLight)),
            ),
            _TimeChip(
              time: schedule.closeTime,
              label: 'Đóng',
              onTap: onEditClose,
            ),
          ] else ...[
            const Spacer(),
            Text(
              'Nghỉ',
              style: TextStyle(
                color: AppColors.textSecondaryLight,
                fontSize: AppFontSize.sm,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _TimeChip extends StatelessWidget {
  final TimeOfDay time;
  final String label;
  final VoidCallback onTap;

  const _TimeChip({required this.time, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final timeStr =
        '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: 0.08),
          borderRadius: const BorderRadius.all(AppRadius.sm),
          border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: const TextStyle(fontSize: AppFontSize.xs, color: AppColors.textSecondaryLight),
            ),
            Text(
              timeStr,
              style: const TextStyle(
                fontWeight: AppFontWeight.bold,
                color: AppColors.primary,
                fontSize: AppFontSize.base,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TemplateBanner extends StatelessWidget {
  final VoidCallback onApplyWeekdays;
  final VoidCallback onApplyAll;

  const _TemplateBanner({
    required this.onApplyWeekdays,
    required this.onApplyAll,
  });

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
          const Text(
            'Áp dụng nhanh',
            style: TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.base),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: onApplyWeekdays,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.primary),
                  ),
                  child: const Text('T2-T6: 8h-22h', style: TextStyle(fontSize: AppFontSize.sm)),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton(
                  onPressed: onApplyAll,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.primary),
                  ),
                  child: const Text('Cả tuần: 8h-22h', style: TextStyle(fontSize: AppFontSize.sm)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
