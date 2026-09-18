import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../profile/profile_provider.dart';
import 'widgets/google_logo.dart';

enum _LoginStep { phone, otp, name }

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _phoneController = TextEditingController();
  final _nameController = TextEditingController();
  final List<TextEditingController> _otpControllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _otpFocusNodes = List.generate(6, (_) => FocusNode());

  _LoginStep _currentStep = _LoginStep.phone;
  String? _devOtp;
  bool _isLoading = false;
  bool _isGoogleLoading = false;

  @override
  void dispose() {
    _phoneController.dispose();
    _nameController.dispose();
    for (final c in _otpControllers) {
      c.dispose();
    }
    for (final f in _otpFocusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  void _fillOtp(String code) {
    final trimmed = code.trim();
    for (int i = 0; i < 6 && i < trimmed.length; i++) {
      _otpControllers[i].text = trimmed[i];
    }
    if (trimmed.length >= 6) {
      _handleVerifyOtp();
    }
  }

  Future<void> _handleSendOtp() async {
    final phone = _phoneController.text.trim();
    if (phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng nhập số điện thoại'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }
    setState(() => _isLoading = true);
    try {
      final api = ref.read(apiClientProvider);
      final res = await api.post('/auth/send-otp', {'phone': phone});
      final devOtp = res['devOtp'] as String?;
      if (mounted) {
        for (final c in _otpControllers) {
          c.clear();
        }
        setState(() {
          _devOtp = devOtp;
          _currentStep = _LoginStep.otp;
        });
        if (_otpFocusNodes.isNotEmpty) {
          _otpFocusNodes[0].requestFocus();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi gửi mã OTP: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleVerifyOtp() async {
    final otp = _otpControllers.map((c) => c.text).join();
    if (otp.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng nhập đủ 6 chữ số mã OTP'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }
    setState(() => _isLoading = true);
    try {
      final phone = _phoneController.text.trim();
      final api = ref.read(apiClientProvider);
      final res = await api.post('/auth/verify-otp', {
        'phone': phone,
        'otp': otp,
      });
      final token = res['accessToken'] as String?;
      if (token != null) {
        await ref.read(authStateProvider.notifier).setLoggedIn(token);
        ref.invalidate(myProfileProvider);
        final isNew = res['isNewUser'] as bool? ?? false;
        if (!isNew && mounted) {
          context.go('/main');
          return;
        } else if (mounted) {
          // Người dùng mới: Chuyển sang bước nhập tên ngay trên màn hình hiện tại
          setState(() => _currentStep = _LoginStep.name);
          return;
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Mã OTP không hợp lệ hoặc đã hết hạn: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleGoogleLogin() async {
    setState(() => _isGoogleLoading = true);
    try {
      final result =
          await ref.read(authStateProvider.notifier).loginWithGoogle();
      if (result == null) {
        // Người dùng đã hủy hoặc đóng popup đăng nhập Google
        return;
      }

      ref.invalidate(myProfileProvider);

      if (!mounted) return;

      if (result.isNewUser) {
        setState(() => _currentStep = _LoginStep.name);
      } else {
        context.go('/main');
      }
    } catch (e) {
      if (mounted) {
        String msg = e.toString();
        if (msg.contains('GOOGLE_CLIENT_ID') ||
            msg.contains('clientId') ||
            msg.contains('clientConfigurationError')) {
          msg =
              'Đăng nhập Google trên Web yêu cầu cấu hình GOOGLE_CLIENT_ID trong file .env';
        } else if (msg.contains('StateError')) {
          msg = msg.replaceAll('StateError: ', '');
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(msg),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isGoogleLoading = false);
    }
  }

  Future<void> _handleCompleteProfile() async {
    final name = _nameController.text.trim();
    if (name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng nhập tên của bạn'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }
    setState(() => _isLoading = true);
    try {
      final api = ref.read(apiClientProvider);
      await api.patch('/users/me', {'name': name});
      ref.invalidate(myProfileProvider);
      if (mounted) {
        context.go('/main');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi cập nhật thông tin: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Back button row
              Row(
                children: [
                  IconButton(
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    icon: Icon(
                      Icons.arrow_back_ios_new,
                      size: 20,
                      color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                    ),
                    onPressed: () {
                      if (_currentStep == _LoginStep.name) {
                        context.go('/main');
                      } else if (_currentStep == _LoginStep.otp) {
                        setState(() => _currentStep = _LoginStep.phone);
                      } else if (context.canPop()) {
                        context.pop();
                      } else {
                        context.go('/main');
                      }
                    },
                  ),
                  if (_currentStep == _LoginStep.otp) ...[
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: () => setState(() => _currentStep = _LoginStep.phone),
                      child: Text(
                        'Quay lại',
                        style: TextStyle(
                          fontSize: AppFontSize.md,
                          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 24),

              // Brand logo header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.all(AppRadius.md),
                    ),
                    child: const Icon(
                      Iconsax.note_favorite5,
                      color: Colors.white,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 14),
                  const Text(
                    'Tran Gia Food',
                    style: TextStyle(
                      fontSize: AppFontSize.h1,
                      fontWeight: AppFontWeight.extraBold,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              if (_currentStep == _LoginStep.phone)
                ..._buildPhoneStep(isDark)
              else if (_currentStep == _LoginStep.otp)
                ..._buildOtpStep(isDark)
              else
                ..._buildNameStep(isDark),
            ],
          ),
        ),
      ),
    );
  }

  List<Widget> _buildPhoneStep(bool isDark) {
    return [
      const Text(
        'Chào mừng bạn đến với Tran Gia Food 👋',
        style: TextStyle(
          fontSize: AppFontSize.xl,
          fontWeight: AppFontWeight.bold,
        ),
      ),
      const SizedBox(height: 8),
      Text(
        'Nhập số điện thoại để đăng nhập hoặc tạo tài khoản mới nhanh chóng',
        style: TextStyle(
          fontSize: AppFontSize.md,
          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
        ),
      ),
      const SizedBox(height: 32),

      // Phone input
      AppTextField(
        labelText: 'Số điện thoại',
        hintText: '090 123 4567',
        controller: _phoneController,
        keyboardType: TextInputType.phone,
        prefixIcon: Iconsax.call,
      ),
      const SizedBox(height: 24),

      // Submit button
      AppButton(
        text: 'Tiếp Tục với SĐT',
        isLoading: _isLoading,
        onPressed: _handleSendOtp,
      ),
      const SizedBox(height: 32),

      // Divider
      Row(
        children: [
          const Expanded(child: Divider()),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'Hoặc tiếp tục với',
              style: TextStyle(
                fontSize: AppFontSize.sm,
                color: isDark ? AppColors.textSecondaryDark : AppColors.textHintLight,
              ),
            ),
          ),
          const Expanded(child: Divider()),
        ],
      ),
      const SizedBox(height: 24),

      // Social logins - Google Sign In button with high contrast & branding
      OutlinedButton.icon(
        onPressed: _isGoogleLoading ? null : _handleGoogleLogin,
        icon: _isGoogleLoading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: AppColors.primary,
                ),
              )
            : const GoogleLogo(size: 20),
        label: Text(
          'Tiếp tục với Google',
          style: TextStyle(
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
            fontWeight: AppFontWeight.semiBold,
          ),
        ),
        style: OutlinedButton.styleFrom(
          minimumSize: const Size(double.infinity, 50),
          side: BorderSide(
            color: isDark ? AppColors.dividerDark : AppColors.dividerLight,
          ),
          backgroundColor: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(AppRadius.sm),
          ),
        ),
      ),
      const SizedBox(height: 32),

      Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của Tran Gia Food.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: isDark ? AppColors.textSecondaryDark : AppColors.textHintLight,
              fontSize: AppFontSize.xs,
              height: 1.4,
            ),
          ),
        ),
      ),
    ];
  }

  List<Widget> _buildOtpStep(bool isDark) {
    return [
      const Text(
        'Nhập mã xác thực OTP 🔐',
        style: TextStyle(
          fontSize: AppFontSize.xl,
          fontWeight: AppFontWeight.bold,
        ),
      ),
      const SizedBox(height: 8),
      Text(
        'Mã 6 chữ số đã được gửi đến số điện thoại ${_phoneController.text}',
        style: TextStyle(
          fontSize: AppFontSize.md,
          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
        ),
      ),
      const SizedBox(height: 6),
      GestureDetector(
        onTap: () => setState(() => _currentStep = _LoginStep.phone),
        child: const Text(
          'Đổi số điện thoại',
          style: TextStyle(
            color: AppColors.primary,
            fontSize: AppFontSize.sm,
            fontWeight: AppFontWeight.semiBold,
          ),
        ),
      ),
      if (_devOtp != null) ...[
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: AppColors.primary.withAlpha(20),
            borderRadius: const BorderRadius.all(AppRadius.sm),
            border: Border.all(color: AppColors.primary.withAlpha(80)),
          ),
          child: Row(
            children: [
              const Icon(Iconsax.info_circle, size: 20, color: AppColors.primary),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Mã OTP thử nghiệm (Dev): $_devOtp',
                  style: const TextStyle(
                    fontSize: AppFontSize.sm,
                    color: AppColors.primary,
                    fontWeight: AppFontWeight.semiBold,
                  ),
                ),
              ),
              TextButton(
                onPressed: () => _fillOtp(_devOtp!),
                child: const Text(
                  'Điền nhanh',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontWeight: AppFontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
      const SizedBox(height: 24),

      // 6 OTP boxes
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
                  borderSide: BorderSide(
                    color: AppColors.primary.withAlpha(80),
                  ),
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
                } else if (value.isNotEmpty && index == 5) {
                  _handleVerifyOtp();
                }
              },
            ),
          );
        }),
      ),
      const SizedBox(height: 32),

      AppButton(
        text: 'Xác Nhận Đăng Nhập',
        isLoading: _isLoading,
        onPressed: _handleVerifyOtp,
      ),
      const SizedBox(height: 20),

      Center(
        child: TextButton.icon(
          onPressed: _isLoading ? null : _handleSendOtp,
          icon: const Icon(Iconsax.refresh, size: 16, color: AppColors.primary),
          label: const Text(
            'Gửi lại mã OTP',
            style: TextStyle(
              color: AppColors.primary,
              fontSize: AppFontSize.sm,
              fontWeight: AppFontWeight.medium,
            ),
          ),
        ),
      ),
      const SizedBox(height: 12),
      Center(
        child: Text(
          '💡 Mẹo thử nghiệm: Có thể nhập mã "123456" để đăng nhập nhanh',
          style: TextStyle(
            fontSize: AppFontSize.xs,
            color: isDark ? AppColors.textSecondaryDark : AppColors.textHintLight,
            fontStyle: FontStyle.italic,
          ),
        ),
      ),
    ];
  }

  List<Widget> _buildNameStep(bool isDark) {
    return [
      const Text(
        'Bạn tên là gì? 😊',
        style: TextStyle(
          fontSize: AppFontSize.xl,
          fontWeight: AppFontWeight.bold,
        ),
      ),
      const SizedBox(height: 8),
      Text(
        'Nhập tên để tài xế và quán ăn tiện xưng hô khi giao nhận món nhé',
        style: TextStyle(
          fontSize: AppFontSize.md,
          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
        ),
      ),
      const SizedBox(height: 32),

      AppTextField(
        labelText: 'Họ và tên của bạn',
        hintText: 'Ví dụ: Nguyễn Văn A',
        controller: _nameController,
        prefixIcon: Iconsax.user,
      ),
      const SizedBox(height: 24),

      AppButton(
        text: 'Bắt Đầu Trải Nghiệm',
        isLoading: _isLoading,
        onPressed: _handleCompleteProfile,
      ),
      const SizedBox(height: 16),

      Center(
        child: TextButton(
          onPressed: () {
            ref.invalidate(myProfileProvider);
            context.go('/main');
          },
          child: Text(
            'Để sau, vào trang chủ ngay',
            style: TextStyle(
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
              fontSize: AppFontSize.sm,
            ),
          ),
        ),
      ),
    ];
  }
}
