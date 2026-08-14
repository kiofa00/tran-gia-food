import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Models & Enums
// ---------------------------------------------------------------------------

enum KycStep { intro, cccd, selfie, review, done }

enum KycStatus { notStarted, pending, approved, rejected }

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

final kycStatusProvider =
    FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  return api.get('/users/me/kyc');
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class EkycScreen extends ConsumerStatefulWidget {
  const EkycScreen({super.key});

  @override
  ConsumerState<EkycScreen> createState() => _EkycScreenState();
}

class _EkycScreenState extends ConsumerState<EkycScreen> {
  KycStep _step = KycStep.intro;
  bool _isSubmitting = false;

  // Simulated form fields
  final _cccdController = TextEditingController();
  final _fullNameController = TextEditingController();
  String? _cccdFrontPath;
  String? _cccdBackPath;
  String? _selfiePath;

  @override
  void dispose() {
    _cccdController.dispose();
    _fullNameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final kycAsync = ref.watch(kycStatusProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'XÃ¡c Minh Danh TÃ­nh (eKYC)',
          style: TextStyle(fontWeight: AppFontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => context.pop(),
        ),
      ),
      body: kycAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        // Náº¿u API lá»—i â†’ váº«n hiá»ƒn thá»‹ theo step state
        error: (_, _) => _buildStepContent(),
        data: (data) {
          final statusStr = data['status'] as String? ?? 'not_started';
          final status = switch (statusStr) {
            'approved' => KycStatus.approved,
            'pending' => KycStatus.pending,
            'rejected' => KycStatus.rejected,
            _ => KycStatus.notStarted,
          };
          if (status == KycStatus.approved) {
            return _ApprovedState();
          }
          if (status == KycStatus.pending) {
            return _PendingState();
          }
          if (status == KycStatus.rejected) {
            return _RejectedState(reason: data['reject_reason'] as String?);
          }
          return _buildStepContent();
        },
      ),
    );
  }

  Widget _buildStepContent() {
    return Column(
      children: [
        _StepIndicator(currentStep: _step),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: switch (_step) {
              KycStep.intro => _IntroStep(onNext: () => setState(() => _step = KycStep.cccd)),
              KycStep.cccd => _CccdStep(
                  cccdController: _cccdController,
                  fullNameController: _fullNameController,
                  frontPath: _cccdFrontPath,
                  backPath: _cccdBackPath,
                  onPickFront: () => setState(() => _cccdFrontPath = 'mock_front.jpg'),
                  onPickBack: () => setState(() => _cccdBackPath = 'mock_back.jpg'),
                  onNext: () => setState(() => _step = KycStep.selfie),
                ),
              KycStep.selfie => _SelfieStep(
                  selfiePath: _selfiePath,
                  onCapture: () => setState(() => _selfiePath = 'mock_selfie.jpg'),
                  onNext: () => setState(() => _step = KycStep.review),
                ),
              KycStep.review => _ReviewStep(
                  cccd: _cccdController.text,
                  fullName: _fullNameController.text,
                  hasFront: _cccdFrontPath != null,
                  hasBack: _cccdBackPath != null,
                  hasSelfie: _selfiePath != null,
                  isSubmitting: _isSubmitting,
                  onSubmit: _submitKyc,
                ),
              KycStep.done => _DoneStep(onClose: () => context.pop()),
            },
          ),
        ),
      ],
    );
  }

  Future<void> _submitKyc() async {
    setState(() => _isSubmitting = true);
    // Simulate API call
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      setState(() {
        _isSubmitting = false;
        _step = KycStep.done;
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Step Indicator
// ---------------------------------------------------------------------------

class _StepIndicator extends StatelessWidget {
  final KycStep currentStep;
  const _StepIndicator({required this.currentStep});

  static const _steps = ['Giá»›i thiá»‡u', 'CCCD', 'Selfie', 'Kiá»ƒm tra'];

  @override
  Widget build(BuildContext context) {
    final stepIndex = currentStep.index.clamp(0, _steps.length - 1);
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      color: AppColors.surfaceAltLight,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(_steps.length * 2 - 1, (i) {
          if (i.isOdd) {
            // connector
            final leftDone = (i ~/ 2) < stepIndex;
            return Expanded(
              child: Container(
                height: 2,
                color: leftDone ? AppColors.primary : AppColors.dividerLight,
              ),
            );
          }
          final idx = i ~/ 2;
          final isDone = idx < stepIndex;
          final isCurrent = idx == stepIndex;
          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: isDone || isCurrent
                      ? AppColors.primary
                      : AppColors.dividerLight,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: isDone
                      ? const Icon(Icons.check, color: Colors.white, size: 16)
                      : Text(
                          '${idx + 1}',
                          style: TextStyle(
                            color: isCurrent ? Colors.white : AppColors.textSecondaryLight,
                            fontWeight: AppFontWeight.bold,
                            fontSize: AppFontSize.sm,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                _steps[idx],
                style: TextStyle(
                  fontSize: AppFontSize.xs,
                  color: isCurrent ? AppColors.primary : AppColors.textSecondaryLight,
                  fontWeight: isCurrent ? AppFontWeight.bold : AppFontWeight.regular,
                ),
              ),
            ],
          );
        }),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Step Content Widgets
// ---------------------------------------------------------------------------

class _IntroStep extends StatelessWidget {
  final VoidCallback onNext;
  const _IntroStep({required this.onNext});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 20),
        const Icon(Iconsax.shield_tick5, size: 80, color: AppColors.primary),
        const SizedBox(height: 24),
        const Text(
          'XÃ¡c Minh Danh TÃ­nh',
          style: TextStyle(fontSize: AppFontSize.h1, fontWeight: AppFontWeight.bold),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12),
        const Text(
          'XÃ¡c minh danh tÃ­nh Ä‘á»ƒ má»Ÿ khÃ³a:\nâ€¢ Thanh toÃ¡n qua ngÃ¢n hÃ ng\nâ€¢ HoÃ n tiá»n tá»± Ä‘á»™ng\nâ€¢ Báº£o máº­t giao dá»‹ch',
          style: TextStyle(
            fontSize: AppFontSize.base,
            color: AppColors.textSecondaryLight,
            height: 1.7,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 32),
        ...[
          _RequirementItem(icon: Iconsax.personalcard, text: 'áº¢nh CCCD/CMND 2 máº·t'),
          _RequirementItem(icon: Iconsax.camera, text: 'áº¢nh selfie khuÃ´n máº·t rÃµ nÃ©t'),
          _RequirementItem(icon: Iconsax.clock, text: 'Duyá»‡t trong vÃ²ng 24 giá»'),
        ],
        const SizedBox(height: 32),
        AppButton(text: 'Báº¯t Ä‘áº§u xÃ¡c minh', onPressed: onNext),
      ],
    );
  }
}

class _RequirementItem extends StatelessWidget {
  final IconData icon;
  final String text;
  const _RequirementItem({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: const BorderRadius.all(AppRadius.sm),
            ),
            child: Icon(icon, color: AppColors.primary, size: 18),
          ),
          const SizedBox(width: 12),
          Text(text, style: const TextStyle(fontSize: AppFontSize.base)),
        ],
      ),
    );
  }
}

class _CccdStep extends StatelessWidget {
  final TextEditingController cccdController;
  final TextEditingController fullNameController;
  final String? frontPath;
  final String? backPath;
  final VoidCallback onPickFront;
  final VoidCallback onPickBack;
  final VoidCallback onNext;

  const _CccdStep({
    required this.cccdController,
    required this.fullNameController,
    required this.frontPath,
    required this.backPath,
    required this.onPickFront,
    required this.onPickBack,
    required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'ThÃ´ng tin CCCD',
          style: TextStyle(fontSize: AppFontSize.xl, fontWeight: AppFontWeight.bold),
        ),
        const SizedBox(height: 20),
        AppTextField(
          controller: fullNameController,
          labelText: 'Há» vÃ  tÃªn (nhÆ° trÃªn CCCD)',
          hintText: 'NGUYEN VAN A',
          prefixIcon: Iconsax.user,
        ),
        const SizedBox(height: 12),
        AppTextField(
          controller: cccdController,
          labelText: 'Sá»‘ CCCD / CMND',
          hintText: '0xx xxxx xxxx',
          prefixIcon: Iconsax.personalcard,
          keyboardType: TextInputType.number,
        ),
        const SizedBox(height: 24),
        const Text(
          'áº¢nh CCCD',
          style: TextStyle(fontSize: AppFontSize.base, fontWeight: AppFontWeight.bold),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _PhotoPicker(
                label: 'Máº·t trÆ°á»›c',
                icon: Iconsax.personalcard,
                hasPhoto: frontPath != null,
                onTap: onPickFront,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _PhotoPicker(
                label: 'Máº·t sau',
                icon: Iconsax.personalcard,
                hasPhoto: backPath != null,
                onTap: onPickBack,
              ),
            ),
          ],
        ),
        const SizedBox(height: 32),
        AppButton(
          text: 'Tiáº¿p theo',
          onPressed: frontPath != null && backPath != null ? onNext : null,
        ),
      ],
    );
  }
}

class _PhotoPicker extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool hasPhoto;
  final VoidCallback onTap;

  const _PhotoPicker({
    required this.label,
    required this.icon,
    required this.hasPhoto,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        height: 110,
        decoration: BoxDecoration(
          color: hasPhoto
              ? AppColors.success.withValues(alpha: 0.08)
              : AppColors.surfaceAltLight,
          borderRadius: const BorderRadius.all(AppRadius.md),
          border: Border.all(
            color: hasPhoto ? AppColors.success : AppColors.dividerLight,
            width: 1.5,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              hasPhoto ? Iconsax.tick_circle5 : icon,
              color: hasPhoto ? AppColors.success : AppColors.textSecondaryLight,
              size: 32,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: AppFontSize.sm,
                color: hasPhoto ? AppColors.success : AppColors.textSecondaryLight,
                fontWeight: hasPhoto ? AppFontWeight.bold : AppFontWeight.regular,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SelfieStep extends StatelessWidget {
  final String? selfiePath;
  final VoidCallback onCapture;
  final VoidCallback onNext;

  const _SelfieStep({
    required this.selfiePath,
    required this.onCapture,
    required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Text(
          'Chá»¥p áº¢nh Selfie',
          style: TextStyle(fontSize: AppFontSize.xl, fontWeight: AppFontWeight.bold),
        ),
        const SizedBox(height: 8),
        const Text(
          'Chá»¥p áº£nh khuÃ´n máº·t rÃµ nÃ©t, Ä‘á»§ Ã¡nh sÃ¡ng. KhÃ´ng Ä‘eo kÃ­nh, kháº©u trang.',
          style: TextStyle(color: AppColors.textSecondaryLight, fontSize: AppFontSize.base),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 32),
        GestureDetector(
          onTap: onCapture,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            width: 200,
            height: 200,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: selfiePath != null
                  ? AppColors.success.withValues(alpha: 0.1)
                  : AppColors.surfaceAltLight,
              border: Border.all(
                color: selfiePath != null ? AppColors.success : AppColors.dividerLight,
                width: 2,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  selfiePath != null ? Iconsax.tick_circle5 : Iconsax.camera,
                  size: 48,
                  color: selfiePath != null ? AppColors.success : AppColors.textSecondaryLight,
                ),
                const SizedBox(height: 10),
                Text(
                  selfiePath != null ? 'áº¢nh Ä‘Ã£ chá»¥p âœ“' : 'Nháº¥n Ä‘á»ƒ chá»¥p',
                  style: TextStyle(
                    color: selfiePath != null ? AppColors.success : AppColors.textSecondaryLight,
                    fontWeight: AppFontWeight.semiBold,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 40),
        AppButton(
          text: 'Tiáº¿p theo',
          onPressed: selfiePath != null ? onNext : null,
        ),
      ],
    );
  }
}

class _ReviewStep extends StatelessWidget {
  final String cccd;
  final String fullName;
  final bool hasFront;
  final bool hasBack;
  final bool hasSelfie;
  final bool isSubmitting;
  final VoidCallback onSubmit;

  const _ReviewStep({
    required this.cccd,
    required this.fullName,
    required this.hasFront,
    required this.hasBack,
    required this.hasSelfie,
    required this.isSubmitting,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Xem Láº¡i ThÃ´ng Tin',
          style: TextStyle(fontSize: AppFontSize.xl, fontWeight: AppFontWeight.bold),
        ),
        const SizedBox(height: 20),
        _ReviewRow(label: 'Há» vÃ  tÃªn', value: fullName.isEmpty ? 'â€”' : fullName),
        _ReviewRow(label: 'Sá»‘ CCCD', value: cccd.isEmpty ? 'â€”' : cccd),
        _ReviewRow(label: 'áº¢nh CCCD máº·t trÆ°á»›c', value: hasFront ? 'âœ… ÄÃ£ chá»¥p' : 'âŒ ChÆ°a cÃ³'),
        _ReviewRow(label: 'áº¢nh CCCD máº·t sau', value: hasBack ? 'âœ… ÄÃ£ chá»¥p' : 'âŒ ChÆ°a cÃ³'),
        _ReviewRow(label: 'áº¢nh selfie', value: hasSelfie ? 'âœ… ÄÃ£ chá»¥p' : 'âŒ ChÆ°a cÃ³'),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.06),
            borderRadius: const BorderRadius.all(AppRadius.md),
          ),
          child: const Text(
            'ðŸ“‹ ThÃ´ng tin sáº½ Ä‘Æ°á»£c gá»­i Ä‘áº¿n há»‡ thá»‘ng eKYC Ä‘á»ƒ xÃ¡c minh. Káº¿t quáº£ trong vÃ²ng 24 giá».',
            style: TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight),
          ),
        ),
        const SizedBox(height: 32),
        AppButton(
          text: 'Gá»­i XÃ¡c Minh',
          isLoading: isSubmitting,
          onPressed: onSubmit,
        ),
      ],
    );
  }
}

class _ReviewRow extends StatelessWidget {
  final String label;
  final String value;
  const _ReviewRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: const TextStyle(
                color: AppColors.textSecondaryLight,
                fontSize: AppFontSize.base,
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value,
              style: const TextStyle(
                fontWeight: AppFontWeight.semiBold,
                fontSize: AppFontSize.base,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DoneStep extends StatelessWidget {
  final VoidCallback onClose;
  const _DoneStep({required this.onClose});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 40),
        const Icon(Iconsax.tick_circle5, size: 80, color: AppColors.success),
        const SizedBox(height: 24),
        const Text(
          'ÄÃ£ gá»­i há»“ sÆ¡!',
          style: TextStyle(fontSize: AppFontSize.h1, fontWeight: AppFontWeight.bold),
        ),
        const SizedBox(height: 12),
        const Text(
          'Há»“ sÆ¡ eKYC cá»§a báº¡n Ä‘Ã£ Ä‘Æ°á»£c gá»­i thÃ nh cÃ´ng. ChÃºng tÃ´i sáº½ thÃ´ng bÃ¡o káº¿t quáº£ trong vÃ²ng 24 giá».',
          style: TextStyle(
            color: AppColors.textSecondaryLight,
            fontSize: AppFontSize.base,
            height: 1.6,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 40),
        AppButton(text: 'Vá» trang chá»§', onPressed: onClose),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Status States
// ---------------------------------------------------------------------------

class _ApprovedState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Iconsax.shield_tick5, size: 72, color: AppColors.success),
          const SizedBox(height: 16),
          const Text(
            'ÄÃ£ xÃ¡c minh thÃ nh cÃ´ng',
            style: TextStyle(fontSize: AppFontSize.xl, fontWeight: AppFontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text(
            'TÃ i khoáº£n cá»§a báº¡n Ä‘Ã£ Ä‘Æ°á»£c xÃ¡c minh Ä‘áº§y Ä‘á»§.',
            style: TextStyle(color: AppColors.textSecondaryLight),
          ),
          const SizedBox(height: 24),
          AppButton(text: 'Quay láº¡i', onPressed: () => context.pop()),
        ],
      ),
    );
  }
}

class _PendingState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Iconsax.clock, size: 72, color: AppColors.warning),
          const SizedBox(height: 16),
          const Text(
            'Äang chá» duyá»‡t',
            style: TextStyle(fontSize: AppFontSize.xl, fontWeight: AppFontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text(
            'Há»“ sÆ¡ eKYC cá»§a báº¡n Ä‘ang Ä‘Æ°á»£c xem xÃ©t.\nThÆ°á»ng máº¥t 24 giá» lÃ m viá»‡c.',
            style: TextStyle(color: AppColors.textSecondaryLight),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          AppButton(text: 'Quay láº¡i', onPressed: () => context.pop()),
        ],
      ),
    );
  }
}

class _RejectedState extends StatelessWidget {
  final String? reason;
  const _RejectedState({this.reason});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Iconsax.close_circle5, size: 72, color: AppColors.error),
            const SizedBox(height: 16),
            const Text(
              'XÃ¡c minh tháº¥t báº¡i',
              style: TextStyle(fontSize: AppFontSize.xl, fontWeight: AppFontWeight.bold),
            ),
            if (reason != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.error.withValues(alpha: 0.08),
                  borderRadius: const BorderRadius.all(AppRadius.md),
                ),
                child: Text(
                  'LÃ½ do: $reason',
                  style: const TextStyle(color: AppColors.error, fontSize: AppFontSize.sm),
                ),
              ),
            ],
            const SizedBox(height: 24),
            AppButton(text: 'Thá»­ láº¡i', onPressed: () {}),
          ],
        ),
      ),
    );
  }
}

