import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Enum & Provider
// ---------------------------------------------------------------------------

enum ShipperKycStep { personalInfo, documents, selfie, review, submitted }

final shipperKycStatusProvider =
    FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  return api.get('/shippers/my/kyc');
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class ShipperEkycScreen extends ConsumerStatefulWidget {
  const ShipperEkycScreen({super.key});

  @override
  ConsumerState<ShipperEkycScreen> createState() => _ShipperEkycScreenState();
}

class _ShipperEkycScreenState extends ConsumerState<ShipperEkycScreen> {
  ShipperKycStep _step = ShipperKycStep.personalInfo;
  bool _isSubmitting = false;

  // Personal info
  final _fullNameController = TextEditingController();
  final _cccdController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();

  // Documents
  String? _cccdFrontPath;
  String? _cccdBackPath;
  String? _driverLicensePath;
  String? _vehicleRegPath;

  // Selfie
  String? _selfiePath;

  // Vehicle
  String _vehicleType = 'motorbike';

  @override
  void dispose() {
    _fullNameController.dispose();
    _cccdController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final kycAsync = ref.watch(shipperKycStatusProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Đăng Ký Shipper',
          style: TextStyle(fontWeight: AppFontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => context.pop(),
        ),
      ),
      body: kycAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => _buildStepContent(),
        data: (data) {
          final status = data['status'] as String? ?? 'not_started';
          if (status == 'approved') return _ApprovedState();
          if (status == 'pending') return _PendingState();
          if (status == 'rejected') {
            return _RejectedState(reason: data['reject_reason'] as String?);
          }
          return _buildStepContent();
        },
      ),
    );
  }

  Widget _buildStepContent() {
    final steps = ShipperKycStep.values
        .where((s) => s != ShipperKycStep.submitted)
        .toList();

    return Column(
      children: [
        _ShipperStepBar(steps: steps, currentStep: _step),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: switch (_step) {
              ShipperKycStep.personalInfo => _PersonalInfoStep(
                  fullNameCtrl: _fullNameController,
                  cccdCtrl: _cccdController,
                  phoneCtrl: _phoneController,
                  addressCtrl: _addressController,
                  vehicleType: _vehicleType,
                  onVehicleChanged: (v) => setState(() => _vehicleType = v),
                  onNext: () => setState(() => _step = ShipperKycStep.documents),
                ),
              ShipperKycStep.documents => _DocumentsStep(
                  cccdFront: _cccdFrontPath,
                  cccdBack: _cccdBackPath,
                  driverLicense: _driverLicensePath,
                  vehicleReg: _vehicleRegPath,
                  onPickCccdFront: () => setState(() => _cccdFrontPath = 'front.jpg'),
                  onPickCccdBack: () => setState(() => _cccdBackPath = 'back.jpg'),
                  onPickDriverLicense: () => setState(() => _driverLicensePath = 'license.jpg'),
                  onPickVehicleReg: () => setState(() => _vehicleRegPath = 'reg.jpg'),
                  onNext: () => setState(() => _step = ShipperKycStep.selfie),
                ),
              ShipperKycStep.selfie => _SelfieLivenessStep(
                  selfiePath: _selfiePath,
                  onCapture: () => setState(() => _selfiePath = 'selfie.jpg'),
                  onNext: () => setState(() => _step = ShipperKycStep.review),
                ),
              ShipperKycStep.review => _ReviewSubmitStep(
                  fullName: _fullNameController.text,
                  cccd: _cccdController.text,
                  vehicleType: _vehicleType,
                  hasAllDocs: _cccdFrontPath != null &&
                      _cccdBackPath != null &&
                      _driverLicensePath != null &&
                      _vehicleRegPath != null,
                  hasSelfie: _selfiePath != null,
                  isSubmitting: _isSubmitting,
                  onSubmit: _submitKyc,
                ),
              ShipperKycStep.submitted => _SubmittedState(
                  onClose: () => context.pop(),
                ),
            },
          ),
        ),
      ],
    );
  }

  Future<void> _submitKyc() async {
    setState(() => _isSubmitting = true);
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      setState(() {
        _isSubmitting = false;
        _step = ShipperKycStep.submitted;
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Step Bar
// ---------------------------------------------------------------------------

class _ShipperStepBar extends StatelessWidget {
  final List<ShipperKycStep> steps;
  final ShipperKycStep currentStep;

  const _ShipperStepBar({required this.steps, required this.currentStep});

  static const _labels = {
    ShipperKycStep.personalInfo: 'Thông tin',
    ShipperKycStep.documents: 'Giấy tờ',
    ShipperKycStep.selfie: 'Selfie',
    ShipperKycStep.review: 'Xác nhận',
  };

  @override
  Widget build(BuildContext context) {
    final currentIdx = steps.indexOf(currentStep);
    return Container(
      color: AppColors.surfaceAltLight,
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
      child: Row(
        children: List.generate(steps.length * 2 - 1, (i) {
          if (i.isOdd) {
            final leftDone = (i ~/ 2) < currentIdx;
            return Expanded(
              child: Container(
                height: 2,
                color: leftDone ? AppColors.primary : AppColors.dividerLight,
              ),
            );
          }
          final idx = i ~/ 2;
          final step = steps[idx];
          final isDone = idx < currentIdx;
          final isCurrent = idx == currentIdx;
          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: isDone || isCurrent ? AppColors.primary : AppColors.dividerLight,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: isDone
                      ? const Icon(Icons.check, color: Colors.white, size: 14)
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
                _labels[step] ?? '',
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
// Step 1: Personal Info
// ---------------------------------------------------------------------------

class _PersonalInfoStep extends StatelessWidget {
  final TextEditingController fullNameCtrl;
  final TextEditingController cccdCtrl;
  final TextEditingController phoneCtrl;
  final TextEditingController addressCtrl;
  final String vehicleType;
  final ValueChanged<String> onVehicleChanged;
  final VoidCallback onNext;

  const _PersonalInfoStep({
    required this.fullNameCtrl,
    required this.cccdCtrl,
    required this.phoneCtrl,
    required this.addressCtrl,
    required this.vehicleType,
    required this.onVehicleChanged,
    required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Thông Tin Cá Nhân',
          style: TextStyle(fontSize: AppFontSize.xl, fontWeight: AppFontWeight.bold),
        ),
        const SizedBox(height: 20),
        AppTextField(
          controller: fullNameCtrl,
          labelText: 'Họ và tên (như CCCD)',
          hintText: 'NGUYEN VAN A',
          prefixIcon: Iconsax.user,
        ),
        const SizedBox(height: 12),
        AppTextField(
          controller: cccdCtrl,
          labelText: 'Số CCCD / CMND',
          hintText: '0xx xxxx xxxx',
          prefixIcon: Iconsax.personalcard,
          keyboardType: TextInputType.number,
        ),
        const SizedBox(height: 12),
        AppTextField(
          controller: phoneCtrl,
          labelText: 'Số điện thoại',
          hintText: '09x xxx xxxx',
          prefixIcon: Iconsax.call,
          keyboardType: TextInputType.phone,
        ),
        const SizedBox(height: 12),
        AppTextField(
          controller: addressCtrl,
          labelText: 'Địa chỉ thường trú',
          hintText: 'Số nhà, đường, phường, quận...',
          prefixIcon: Iconsax.location,
        ),
        const SizedBox(height: 20),
        const Text(
          'Loại Phương Tiện',
          style: TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.base),
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            _VehicleChip(value: 'motorbike', label: '🛵 Xe máy', current: vehicleType, onSelect: onVehicleChanged),
            const SizedBox(width: 8),
            _VehicleChip(value: 'bicycle', label: '🚲 Xe đạp', current: vehicleType, onSelect: onVehicleChanged),
            const SizedBox(width: 8),
            _VehicleChip(value: 'car', label: '🚗 Ô tô', current: vehicleType, onSelect: onVehicleChanged),
          ],
        ),
        const SizedBox(height: 32),
        AppButton(text: 'Tiếp theo', onPressed: onNext),
      ],
    );
  }
}

class _VehicleChip extends StatelessWidget {
  final String value;
  final String label;
  final String current;
  final ValueChanged<String> onSelect;

  const _VehicleChip({
    required this.value,
    required this.label,
    required this.current,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final isSelected = value == current;
    return Expanded(
      child: GestureDetector(
        onTap: () => onSelect(value),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary : AppColors.surfaceAltLight,
            borderRadius: const BorderRadius.all(AppRadius.md),
            border: Border.all(
              color: isSelected ? AppColors.primary : AppColors.dividerLight,
            ),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: AppFontSize.sm,
              color: isSelected ? Colors.white : AppColors.textPrimaryLight,
              fontWeight: isSelected ? AppFontWeight.bold : AppFontWeight.regular,
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Step 2: Documents
// ---------------------------------------------------------------------------

class _DocumentsStep extends StatelessWidget {
  final String? cccdFront;
  final String? cccdBack;
  final String? driverLicense;
  final String? vehicleReg;
  final VoidCallback onPickCccdFront;
  final VoidCallback onPickCccdBack;
  final VoidCallback onPickDriverLicense;
  final VoidCallback onPickVehicleReg;
  final VoidCallback onNext;

  const _DocumentsStep({
    required this.cccdFront,
    required this.cccdBack,
    required this.driverLicense,
    required this.vehicleReg,
    required this.onPickCccdFront,
    required this.onPickCccdBack,
    required this.onPickDriverLicense,
    required this.onPickVehicleReg,
    required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    final allUploaded = cccdFront != null &&
        cccdBack != null &&
        driverLicense != null &&
        vehicleReg != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Tải Lên Giấy Tờ',
          style: TextStyle(fontSize: AppFontSize.xl, fontWeight: AppFontWeight.bold),
        ),
        const SizedBox(height: 20),
        Row(
          children: [
            Expanded(
              child: _DocUploadCard(
                title: 'CCCD mặt trước',
                icon: Iconsax.personalcard,
                isUploaded: cccdFront != null,
                onTap: onPickCccdFront,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _DocUploadCard(
                title: 'CCCD mặt sau',
                icon: Iconsax.personalcard,
                isUploaded: cccdBack != null,
                onTap: onPickCccdBack,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _DocUploadCard(
                title: 'Bằng lái xe',
                icon: Iconsax.car,
                isUploaded: driverLicense != null,
                onTap: onPickDriverLicense,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _DocUploadCard(
                title: 'Đăng ký xe',
                icon: Iconsax.document_text,
                isUploaded: vehicleReg != null,
                onTap: onPickVehicleReg,
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.06),
            borderRadius: const BorderRadius.all(AppRadius.md),
          ),
          child: const Row(
            children: [
              Icon(Iconsax.info_circle, color: AppColors.primary, size: 18),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Ảnh phải rõ nét, không chói, đủ 4 góc. Không chấp nhận ảnh photocopy.',
                  style: TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),
        AppButton(
          text: 'Tiếp theo',
          onPressed: allUploaded ? onNext : null,
        ),
      ],
    );
  }
}

class _DocUploadCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final bool isUploaded;
  final VoidCallback onTap;

  const _DocUploadCard({
    required this.title,
    required this.icon,
    required this.isUploaded,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        height: 100,
        decoration: BoxDecoration(
          color: isUploaded
              ? AppColors.success.withValues(alpha: 0.08)
              : AppColors.surfaceAltLight,
          borderRadius: const BorderRadius.all(AppRadius.md),
          border: Border.all(
            color: isUploaded ? AppColors.success : AppColors.dividerLight,
            width: 1.5,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isUploaded ? Iconsax.tick_circle5 : icon,
              color: isUploaded ? AppColors.success : AppColors.textSecondaryLight,
              size: 28,
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                fontSize: AppFontSize.sm,
                color: isUploaded ? AppColors.success : AppColors.textSecondaryLight,
                fontWeight: isUploaded ? AppFontWeight.bold : AppFontWeight.regular,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Step 3: Selfie + Liveness
// ---------------------------------------------------------------------------

class _SelfieLivenessStep extends StatelessWidget {
  final String? selfiePath;
  final VoidCallback onCapture;
  final VoidCallback onNext;

  const _SelfieLivenessStep({
    required this.selfiePath,
    required this.onCapture,
    required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Text(
          'Xác Minh Khuôn Mặt',
          style: TextStyle(fontSize: AppFontSize.xl, fontWeight: AppFontWeight.bold),
        ),
        const SizedBox(height: 8),
        const Text(
          'Chụp ảnh selfie để đối chiếu với CCCD.\nĐảm bảo ánh sáng đủ, mặt nhìn thẳng.',
          style: TextStyle(color: AppColors.textSecondaryLight),
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
                width: 3,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  selfiePath != null ? Iconsax.tick_circle5 : Iconsax.camera,
                  size: 56,
                  color: selfiePath != null ? AppColors.success : AppColors.textSecondaryLight,
                ),
                const SizedBox(height: 10),
                Text(
                  selfiePath != null ? 'Ảnh đã chụp ✓' : 'Chụp selfie',
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
          text: 'Tiếp theo',
          onPressed: selfiePath != null ? onNext : null,
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Step 4: Review & Submit
// ---------------------------------------------------------------------------

class _ReviewSubmitStep extends StatelessWidget {
  final String fullName;
  final String cccd;
  final String vehicleType;
  final bool hasAllDocs;
  final bool hasSelfie;
  final bool isSubmitting;
  final VoidCallback onSubmit;

  const _ReviewSubmitStep({
    required this.fullName,
    required this.cccd,
    required this.vehicleType,
    required this.hasAllDocs,
    required this.hasSelfie,
    required this.isSubmitting,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    final vehicleLabel = switch (vehicleType) {
      'bicycle' => '🚲 Xe đạp',
      'car' => '🚗 Ô tô',
      _ => '🛵 Xe máy',
    };

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Xem Lại & Nộp Hồ Sơ',
          style: TextStyle(fontSize: AppFontSize.xl, fontWeight: AppFontWeight.bold),
        ),
        const SizedBox(height: 20),
        _Row(label: 'Họ tên', value: fullName.isEmpty ? '—' : fullName),
        _Row(label: 'CCCD', value: cccd.isEmpty ? '—' : cccd),
        _Row(label: 'Phương tiện', value: vehicleLabel),
        _Row(label: 'Giấy tờ', value: hasAllDocs ? '✅ Đủ 4 ảnh' : '❌ Chưa đủ'),
        _Row(label: 'Selfie', value: hasSelfie ? '✅ Đã chụp' : '❌ Chưa có'),
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.warning.withValues(alpha: 0.08),
            borderRadius: const BorderRadius.all(AppRadius.md),
          ),
          child: const Text(
            '⏳ Hồ sơ sẽ được Admin xem xét trong vòng 1-2 ngày làm việc. Sau khi được duyệt, bạn sẽ nhận thông báo qua app và email.',
            style: TextStyle(fontSize: AppFontSize.sm, color: AppColors.textSecondaryLight, height: 1.5),
          ),
        ),
        const SizedBox(height: 32),
        AppButton(
          text: 'Nộp Hồ Sơ',
          isLoading: isSubmitting,
          onPressed: onSubmit,
        ),
      ],
    );
  }
}

class _Row extends StatelessWidget {
  final String label;
  final String value;
  const _Row({required this.label, required this.value});

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
              style: const TextStyle(color: AppColors.textSecondaryLight, fontSize: AppFontSize.base),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value,
              style: const TextStyle(fontWeight: AppFontWeight.semiBold, fontSize: AppFontSize.base),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Status States
// ---------------------------------------------------------------------------

class _SubmittedState extends StatelessWidget {
  final VoidCallback onClose;
  const _SubmittedState({required this.onClose});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Iconsax.tick_circle5, size: 80, color: AppColors.success),
          const SizedBox(height: 24),
          const Text(
            'Hồ sơ đã được nộp!',
            style: TextStyle(fontSize: AppFontSize.h1, fontWeight: AppFontWeight.bold),
          ),
          const SizedBox(height: 12),
          const Text(
            'Chúng tôi sẽ xem xét và thông báo kết quả trong 1-2 ngày làm việc.',
            style: TextStyle(color: AppColors.textSecondaryLight, fontSize: AppFontSize.base, height: 1.6),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 40),
          AppButton(text: 'Quay lại', onPressed: onClose),
        ],
      ),
    );
  }
}

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
            '✅ Tài khoản đã được duyệt',
            style: TextStyle(fontSize: AppFontSize.xl, fontWeight: AppFontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text(
            'Bạn có thể bắt đầu nhận đơn hàng ngay bây giờ!',
            style: TextStyle(color: AppColors.textSecondaryLight),
          ),
          const SizedBox(height: 24),
          AppButton(text: 'Bắt đầu giao hàng', onPressed: () => context.pop()),
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
            'Đang Chờ Duyệt',
            style: TextStyle(fontSize: AppFontSize.xl, fontWeight: AppFontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text(
            'Hồ sơ của bạn đang được Admin xem xét.\nThường mất 1-2 ngày làm việc.',
            style: TextStyle(color: AppColors.textSecondaryLight, height: 1.5),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          AppButton(text: 'Quay lại', onPressed: () => context.pop()),
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
              'Hồ sơ bị từ chối',
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
                  'Lý do: $reason',
                  style: const TextStyle(color: AppColors.error, fontSize: AppFontSize.sm),
                ),
              ),
            ],
            const SizedBox(height: 24),
            AppButton(text: 'Nộp lại hồ sơ', onPressed: () {}),
          ],
        ),
      ),
    );
  }
}
