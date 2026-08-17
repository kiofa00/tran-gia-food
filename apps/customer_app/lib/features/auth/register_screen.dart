import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

/// Màn hình đăng ký tài khoản Customer
/// Flow: Nhập SĐT → OTP → Nhập tên → Tạo tài khoản
class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _pageController = PageController();
  int _currentStep = 0;

  // Step 1 — Phone
  final _phoneController = TextEditingController();

  // Step 2 — OTP
  final List<TextEditingController> _otpControllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _otpFocusNodes = List.generate(6, (_) => FocusNode());

  // Step 3 — Name
  final _nameController = TextEditingController();

  bool _isLoading = false;

  @override
  void dispose() {
    _pageController.dispose();
    _phoneController.dispose();
    for (final c in _otpControllers) {
      c.dispose();
    }
    for (final f in _otpFocusNodes) {
      f.dispose();
    }
    _nameController.dispose();
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

  Future<void> _handleSendOtp() async {
    if (_phoneController.text.trim().isEmpty) return;
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 1)); // TODO: gọi API gửi OTP
    setState(() => _isLoading = false);
    _nextStep();
  }

  Future<void> _handleVerifyOtp() async {
    final otp = _otpControllers.map((c) => c.text).join();
    if (otp.length < 6) return;
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 1)); // TODO: gọi API verify OTP
    setState(() => _isLoading = false);
    _nextStep();
  }

  Future<void> _handleCreateAccount() async {
    if (_nameController.text.trim().isEmpty) return;
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 1)); // TODO: gọi API tạo account
    setState(() => _isLoading = false);
    if (mounted) context.go('/main');
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
                  _buildPhoneStep(),
                  _buildOtpStep(),
                  _buildNameStep(),
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
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 0),
      child: Row(
        children: [
          if (_currentStep > 0)
            IconButton(
              onPressed: () {
                setState(() => _currentStep--);
                _pageController.animateToPage(
                  _currentStep,
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeInOut,
                );
              },
              icon: const Icon(Iconsax.arrow_left),
              padding: EdgeInsets.zero,
            )
          else
            IconButton(
              onPressed: () => context.go('/auth'),
              icon: const Icon(Iconsax.arrow_left),
              padding: EdgeInsets.zero,
            ),
          const SizedBox(width: 8),
          const Text(
            'Tạo Tài Khoản',
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
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
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
                    : AppColors.primary.withAlpha(40),
                borderRadius: const BorderRadius.all(Radius.circular(2)),
              ),
            ),
          );
        }),
      ),
    );
  }

  // ─── Step 1: Phone ────────────────────────────────────────────────────────

  Widget _buildPhoneStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 32),
          const Text(
            'Số điện thoại của bạn',
            style: TextStyle(
              fontSize: AppFontSize.h2,
              fontWeight: AppFontWeight.extraBold,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Chúng tôi sẽ gửi mã OTP để xác thực số điện thoại của bạn.',
            style: TextStyle(
              fontSize: AppFontSize.md,
              color: AppColors.textSecondaryLight,
            ),
          ),
          const SizedBox(height: 32),
          AppTextField(
            labelText: 'Số điện thoại',
            hintText: '090 123 4567',
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            prefixIcon: Iconsax.call,
          ),
          const SizedBox(height: 24),
          AppButton(
            text: 'Gửi Mã OTP',
            isLoading: _isLoading,
            onPressed: _handleSendOtp,
          ),
          const SizedBox(height: 24),
          Center(
            child: TextButton(
              onPressed: () => context.go('/auth'),
              child: RichText(
                text: const TextSpan(
                  text: 'Đã có tài khoản? ',
                  style: TextStyle(
                    color: AppColors.textSecondaryLight,
                    fontSize: AppFontSize.sm,
                  ),
                  children: [
                    TextSpan(
                      text: 'Đăng nhập',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontWeight: AppFontWeight.semiBold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── Step 2: OTP ─────────────────────────────────────────────────────────

  Widget _buildOtpStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 32),
          const Text(
            'Nhập mã OTP',
            style: TextStyle(
              fontSize: AppFontSize.h2,
              fontWeight: AppFontWeight.extraBold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Mã gồm 6 chữ số đã được gửi đến\n${_phoneController.text}',
            style: const TextStyle(
              fontSize: AppFontSize.md,
              color: AppColors.textSecondaryLight,
            ),
          ),
          const SizedBox(height: 36),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(6, (index) {
              return SizedBox(
                width: 48,
                height: 56,
                child: TextField(
                  controller: _otpControllers[index],
                  focusNode: _otpFocusNodes[index],
                  keyboardType: TextInputType.number,
                  maxLength: 1,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: AppFontSize.h2,
                    fontWeight: AppFontWeight.bold,
                  ),
                  decoration: InputDecoration(
                    counterText: '',
                    border: OutlineInputBorder(
                      borderRadius: const BorderRadius.all(AppRadius.sm),
                      borderSide: BorderSide(color: AppColors.primary.withAlpha(80)),
                    ),
                    focusedBorder: const OutlineInputBorder(
                      borderRadius: BorderRadius.all(AppRadius.sm),
                      borderSide: BorderSide(color: AppColors.primary, width: 2),
                    ),
                  ),
                  onChanged: (value) {
                    if (value.isNotEmpty && index < 5) {
                      _otpFocusNodes[index + 1].requestFocus();
                    } else if (value.isEmpty && index > 0) {
                      _otpFocusNodes[index - 1].requestFocus();
                    }
                  },
                ),
              );
            }),
          ),
          const SizedBox(height: 36),
          AppButton(
            text: 'Xác Nhận OTP',
            isLoading: _isLoading,
            onPressed: _handleVerifyOtp,
          ),
          const SizedBox(height: 20),
          Center(
            child: TextButton.icon(
              onPressed: _handleSendOtp,
              icon: const Icon(Iconsax.refresh, size: 16, color: AppColors.primary),
              label: const Text(
                'Gửi lại mã',
                style: TextStyle(color: AppColors.primary, fontSize: AppFontSize.sm),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── Step 3: Name ─────────────────────────────────────────────────────────

  Widget _buildNameStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 32),
          const Text(
            'Bạn tên gì?',
            style: TextStyle(
              fontSize: AppFontSize.h2,
              fontWeight: AppFontWeight.extraBold,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Tên của bạn sẽ xuất hiện trên đơn hàng và đánh giá.',
            style: TextStyle(
              fontSize: AppFontSize.md,
              color: AppColors.textSecondaryLight,
            ),
          ),
          const SizedBox(height: 32),
          AppTextField(
            labelText: 'Họ và tên',
            hintText: 'Nguyễn Văn A',
            controller: _nameController,
            keyboardType: TextInputType.name,
            prefixIcon: Iconsax.user,
          ),
          const SizedBox(height: 24),
          AppButton(
            text: 'Hoàn Tất Đăng Ký',
            isLoading: _isLoading,
            onPressed: _handleCreateAccount,
          ),
        ],
      ),
    );
  }
}
