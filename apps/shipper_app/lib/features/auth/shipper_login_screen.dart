import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import 'package:iconsax/iconsax.dart';
import 'package:go_router/go_router.dart';

class ShipperLoginScreen extends StatefulWidget {
  const ShipperLoginScreen({super.key});

  @override
  State<ShipperLoginScreen> createState() => _ShipperLoginScreenState();
}

class _ShipperLoginScreenState extends State<ShipperLoginScreen> {
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;

  @override
  void dispose() {
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() async {
    if (_phoneController.text.trim().isEmpty) return;
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 1));
    if (mounted) {
      setState(() => _isLoading = false);
      context.go('/orders');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 24),
              // Brand Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.all(AppRadius.md),
                    ),
                    child: const Icon(Iconsax.truck_fast, color: Colors.white, size: 28),
                  ),
                  const SizedBox(width: 14),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Tran Gia Driver',
                        style: TextStyle(
                          fontSize: AppFontSize.h1,
                          fontWeight: AppFontWeight.extraBold,
                          color: AppColors.primary,
                        ),
                      ),
                      Text(
                        'Dành riêng cho Tài xế Đối tác',
                        style: TextStyle(
                          fontSize: AppFontSize.sm,
                          color: AppColors.textSecondaryLight,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 36),

              const Text(
                'Đăng Nhập Tài Xế 🛵',
                style: TextStyle(
                  fontSize: AppFontSize.xl,
                  fontWeight: AppFontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Bật sẵn sàng nhận đơn, giao hàng tận tay khách và rút tiền thu nhập hàng tuần.',
                style: TextStyle(
                  fontSize: AppFontSize.md,
                  color: AppColors.textSecondaryLight,
                ),
              ),
              const SizedBox(height: 32),

              // Phone Field
              AppTextField(
                labelText: 'Số điện thoại tài xế',
                hintText: '098 765 4321',
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                prefixIcon: Iconsax.call,
              ),
              const SizedBox(height: 20),

              // Password Field
              TextField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: 'Mật khẩu',
                  hintText: 'Nhập mật khẩu',
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
              const SizedBox(height: 12),

              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () {},
                  child: const Text(
                    'Quên mật khẩu?',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontSize: AppFontSize.sm,
                      fontWeight: AppFontWeight.medium,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Submit button
              AppButton(
                text: 'Đăng Nhập Nhận Đơn',
                isLoading: _isLoading,
                onPressed: _handleLogin,
              ),
              const SizedBox(height: 32),

              // Register CTA
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.08),
                  borderRadius: const BorderRadius.all(AppRadius.md),
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                ),
                child: Column(
                  children: [
                    const Text(
                      'Bạn chưa có tài khoản đối tác giao hàng?',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontWeight: AppFontWeight.semiBold,
                        fontSize: AppFontSize.md,
                      ),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      onPressed: () => context.push('/register'),
                      icon: const Icon(Iconsax.user_add, color: AppColors.primary),
                      label: const Text(
                        'Đăng Ký Làm Tài Xế Mới',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontWeight: AppFontWeight.bold,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.primary),
                        minimumSize: const Size(double.infinity, 46),
                        shape: const RoundedRectangleBorder(
                          borderRadius: BorderRadius.all(AppRadius.sm),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
