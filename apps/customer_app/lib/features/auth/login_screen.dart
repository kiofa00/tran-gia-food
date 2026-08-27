import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_ui/shared_ui.dart';
import 'package:iconsax/iconsax.dart';
import 'package:go_router/go_router.dart';
import '../../../core/providers/api_client_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _phoneController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  void _handleLogin() async {
    final phone = _phoneController.text.trim();
    if (phone.isEmpty) return;
    setState(() => _isLoading = true);
    try {
      final api = ref.read(apiClientProvider);
      await api.post('/auth/send-otp', {'phone': phone});
      if (mounted) {
        context.push('/register');
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
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
                    icon: const Icon(Icons.arrow_back_ios_new, size: 20, color: AppColors.textPrimaryLight),
                    onPressed: () {
                      if (context.canPop()) {
                        context.pop();
                      } else {
                        context.go('/main');
                      }
                    },
                  ),
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
                    child: const Icon(Iconsax.note_favorite5, color: Colors.white, size: 28),
                  ),
                  const SizedBox(width: 14),
                  const Text(
                    'Tran Gia Food',
                    style: TextStyle(fontSize: AppFontSize.h1, fontWeight: AppFontWeight.extraBold, color: AppColors.primary),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              const Text(
                'Chào mừng bạn đến với Tran Gia Food 👋',
                style: TextStyle(fontSize: AppFontSize.xl, fontWeight: AppFontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Nhập số điện thoại để đặt món ăn yêu thích nhanh chóng',
                style: TextStyle(fontSize: AppFontSize.md, color: AppColors.textSecondaryLight),
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
                onPressed: _handleLogin,
              ),
              const SizedBox(height: 32),

              // Divider
              const Row(
                children: [
                  Expanded(child: Divider()),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text('Hoặc đăng nhập với', style: TextStyle(fontSize: AppFontSize.sm, color: AppColors.textHintLight)),
                  ),
                  Expanded(child: Divider()),
                ],
              ),
              const SizedBox(height: 24),

              // Social logins
              OutlinedButton.icon(
                onPressed: () => context.go('/main'),
                icon: const Icon(Icons.g_mobiledata_rounded, size: 28, color: AppColors.error),
                label: const Text('Tiếp tục với Google', style: TextStyle(color: AppColors.textPrimaryLight, fontWeight: AppFontWeight.semiBold)),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 50),
                  shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(AppRadius.sm)),
                ),
              ),
              const SizedBox(height: 24),
              Center(
                child: TextButton(
                  onPressed: () => context.go('/register'),
                  child: RichText(
                    text: const TextSpan(
                      text: 'Chưa có tài khoản? ',
                      style: TextStyle(
                        color: AppColors.textSecondaryLight,
                        fontSize: AppFontSize.sm,
                      ),
                      children: [
                        TextSpan(
                          text: 'Đăng ký ngay',
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
        ),
      ),
    );
  }
}

