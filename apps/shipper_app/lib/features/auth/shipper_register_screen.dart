import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

/// Màn hình đăng ký tài xế mới cho Tran Gia Food
/// Step 1: Thông tin cá nhân (Họ tên, SĐT, Mật khẩu)
/// Step 2: Thông tin phương tiện (Loại xe, Biển số xe, Khu vực giao hàng)
/// Step 3: Hoàn tất & Chuyển sang eKYC xác minh bằng lái/CCCD
class ShipperRegisterScreen extends StatefulWidget {
  const ShipperRegisterScreen({super.key});

  @override
  State<ShipperRegisterScreen> createState() => _ShipperRegisterScreenState();
}

class _ShipperRegisterScreenState extends State<ShipperRegisterScreen> {
  final _pageController = PageController();
  int _currentStep = 0;

  // Step 1: Personal Info
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  // Step 2: Vehicle Info
  String _vehicleType = 'Xe máy xăng';
  final _plateController = TextEditingController();
  String _selectedCity = 'Hồ Chí Minh';

  bool _isLoading = false;

  final List<String> _vehicleTypes = [
    'Xe máy xăng',
    'Xe máy điện',
    'Xe đạp điện / Khác',
  ];

  final List<String> _cities = [
    'Hồ Chí Minh',
    'Hà Nội',
    'Đà Nẵng',
    'Cần Thơ',
    'Bình Dương',
    'Đồng Nai',
  ];

  @override
  void dispose() {
    _pageController.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _plateController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_currentStep < 2) {
      setState(() => _currentStep++);
      _pageController.animateToPage(
        _currentStep,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _handleStep1() {
    if (_nameController.text.trim().isEmpty ||
        _phoneController.text.trim().isEmpty ||
        _passwordController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng điền đủ họ tên, SĐT và mật khẩu')),
      );
      return;
    }
    _nextStep();
  }

  void _handleStep2() {
    if (_plateController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập biển số xe của bạn')),
      );
      return;
    }
    _nextStep();
  }

  Future<void> _handleCompleteRegistration() async {
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 1));
    if (mounted) {
      setState(() => _isLoading = false);
      context.go('/kyc');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            _buildStepIndicator(),
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _buildStep1Personal(),
                  _buildStep2Vehicle(),
                  _buildStep3Summary(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Row(
        children: [
          IconButton(
            onPressed: () {
              if (_currentStep > 0) {
                setState(() => _currentStep--);
                _pageController.animateToPage(
                  _currentStep,
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeInOut,
                );
              } else {
                context.pop();
              }
            },
            icon: const Icon(Iconsax.arrow_left),
            padding: EdgeInsets.zero,
          ),
          const SizedBox(width: 8),
          const Text(
            'Đăng Ký Tài Xế Đối Tác',
            style: TextStyle(
              fontSize: AppFontSize.xl,
              fontWeight: AppFontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Row(
        children: List.generate(3, (index) {
          final isActive = index == _currentStep;
          final isDone = index < _currentStep;
          return Expanded(
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              height: 4,
              margin: EdgeInsets.only(right: index < 2 ? 8 : 0),
              decoration: BoxDecoration(
                color: isDone || isActive
                    ? AppColors.primary
                    : AppColors.primary.withValues(alpha: 0.15),
                borderRadius: const BorderRadius.all(Radius.circular(2)),
              ),
            ),
          );
        }),
      ),
    );
  }

  // ─── Step 1: Personal Info ───────────────────────────────────────────────
  Widget _buildStep1Personal() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 16),
          const Text(
            '1. Thông Tin Tài Xế',
            style: TextStyle(
              fontSize: AppFontSize.h2,
              fontWeight: AppFontWeight.extraBold,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Thông tin chính chủ để tạo tài khoản tài xế và nhận thù lao.',
            style: TextStyle(fontSize: AppFontSize.md, color: AppColors.textSecondaryLight),
          ),
          const SizedBox(height: 24),

          AppTextField(
            labelText: 'Họ và tên đầy đủ',
            hintText: 'Nguyễn Văn Tài Xế',
            controller: _nameController,
            keyboardType: TextInputType.name,
            prefixIcon: Iconsax.user,
          ),
          const SizedBox(height: 16),

          AppTextField(
            labelText: 'Số điện thoại',
            hintText: '098 765 4321',
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            prefixIcon: Iconsax.call,
          ),
          const SizedBox(height: 16),

          TextField(
            controller: _passwordController,
            obscureText: _obscurePassword,
            decoration: InputDecoration(
              labelText: 'Mật khẩu',
              hintText: 'Tối thiểu 6 ký tự',
              prefixIcon: const Icon(Iconsax.lock, color: AppColors.textHintLight),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePassword ? Iconsax.eye_slash : Iconsax.eye,
                  color: AppColors.textSecondaryLight,
                ),
                onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
              ),
              filled: true,
              fillColor: AppColors.surfaceAltLight,
              border: const OutlineInputBorder(
                borderRadius: BorderRadius.all(AppRadius.sm),
                borderSide: BorderSide.none,
              ),
            ),
          ),
          const SizedBox(height: 28),

          AppButton(
            text: 'Tiếp Theo: Phương Tiện & Khu Vực',
            onPressed: _handleStep1,
          ),
        ],
      ),
    );
  }

  // ─── Step 2: Vehicle & Region ────────────────────────────────────────────
  Widget _buildStep2Vehicle() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 16),
          const Text(
            '2. Phương Tiện Giao Hàng',
            style: TextStyle(
              fontSize: AppFontSize.h2,
              fontWeight: AppFontWeight.extraBold,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Loại phương tiện và khu vực hoạt động giao nhận.',
            style: TextStyle(fontSize: AppFontSize.md, color: AppColors.textSecondaryLight),
          ),
          const SizedBox(height: 24),

          const Text('Loại phương tiện', style: TextStyle(fontWeight: AppFontWeight.semiBold)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: const BoxDecoration(
              color: AppColors.surfaceAltLight,
              borderRadius: BorderRadius.all(AppRadius.sm),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                isExpanded: true,
                value: _vehicleType,
                items: _vehicleTypes.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                onChanged: (v) {
                  if (v != null) setState(() => _vehicleType = v);
                },
              ),
            ),
          ),
          const SizedBox(height: 16),

          AppTextField(
            labelText: 'Biển số xe',
            hintText: '59-X1 123.45',
            controller: _plateController,
            prefixIcon: Iconsax.car,
          ),
          const SizedBox(height: 16),

          const Text('Thành phố / Tỉnh hoạt động', style: TextStyle(fontWeight: AppFontWeight.semiBold)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: const BoxDecoration(
              color: AppColors.surfaceAltLight,
              borderRadius: BorderRadius.all(AppRadius.sm),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                isExpanded: true,
                value: _selectedCity,
                items: _cities.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                onChanged: (v) {
                  if (v != null) setState(() => _selectedCity = v);
                },
              ),
            ),
          ),
          const SizedBox(height: 28),

          AppButton(
            text: 'Tiếp Theo: Xác Nhận Hồ Sơ',
            onPressed: _handleStep2,
          ),
        ],
      ),
    );
  }

  // ─── Step 3: Summary ─────────────────────────────────────────────────────
  Widget _buildStep3Summary() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 16),
          const Text(
            '3. Hoàn Tất Hồ Sơ',
            style: TextStyle(
              fontSize: AppFontSize.h2,
              fontWeight: AppFontWeight.extraBold,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Kiểm tra lại thông tin trước khi hoàn tất đăng ký.',
            style: TextStyle(fontSize: AppFontSize.md, color: AppColors.textSecondaryLight),
          ),
          const SizedBox(height: 24),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: AppColors.surfaceLight,
              borderRadius: BorderRadius.all(AppRadius.md),
              boxShadow: AppShadows.sm,
            ),
            child: Column(
              children: [
                _SummaryRow(label: 'Họ tên', value: _nameController.text),
                const Divider(height: 16),
                _SummaryRow(label: 'SĐT', value: _phoneController.text),
                const Divider(height: 16),
                _SummaryRow(label: 'Loại xe', value: _vehicleType),
                const Divider(height: 16),
                _SummaryRow(label: 'Biển số xe', value: _plateController.text),
                const Divider(height: 16),
                _SummaryRow(label: 'Thành phố', value: _selectedCity),
              ],
            ),
          ),
          const SizedBox(height: 20),

          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.info.withValues(alpha: 0.1),
              borderRadius: const BorderRadius.all(AppRadius.md),
              border: Border.all(color: AppColors.info.withValues(alpha: 0.4)),
            ),
            child: const Row(
              children: [
                Icon(Iconsax.info_circle, color: AppColors.info),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Sau bước này, bạn sẽ tải ảnh CCCD & Bằng lái xe để kích hoạt tài khoản chính thức.',
                    style: TextStyle(fontSize: AppFontSize.sm),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),

          AppButton(
            text: 'Hoàn Tất & Đến Xác Thực eKYC',
            isLoading: _isLoading,
            onPressed: _handleCompleteRegistration,
          ),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  const _SummaryRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textSecondaryLight)),
        Text(value.isNotEmpty ? value : '—', style: const TextStyle(fontWeight: AppFontWeight.bold)),
      ],
    );
  }
}
