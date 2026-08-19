import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';

/// Màn hình đăng ký đối tác Nhà hàng Tran Gia Food
/// Step 1: Thông tin chủ quán (Họ tên, SĐT, Mật khẩu)
/// Step 2: Thông tin quán (Tên quán, Địa chỉ, Loại hình món ăn, Bán kính)
/// Step 3: Hoàn tất & Chuyển sang eKYC
class RestaurantRegisterScreen extends StatefulWidget {
  const RestaurantRegisterScreen({super.key});

  @override
  State<RestaurantRegisterScreen> createState() => _RestaurantRegisterScreenState();
}

class _RestaurantRegisterScreenState extends State<RestaurantRegisterScreen> {
  final _pageController = PageController();
  int _currentStep = 0;

  // Step 1: Owner Info
  final _ownerNameController = TextEditingController();
  final _ownerPhoneController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  // Step 2: Store Info
  final _storeNameController = TextEditingController();
  final _storeAddressController = TextEditingController();
  String _selectedCategory = 'Cơm & Món Việt';
  double _serviceRadiusKm = 5.0;

  bool _isLoading = false;

  final List<String> _categories = [
    'Cơm & Món Việt',
    'Bún, Phở, Mì',
    'Trà Sữa & Đồ Uống',
    'Đồ Ăn Nhanh & Snack',
    'Lẩu & Nướng',
    'Bánh Mì & Ăn Sáng',
  ];

  @override
  void dispose() {
    _pageController.dispose();
    _ownerNameController.dispose();
    _ownerPhoneController.dispose();
    _passwordController.dispose();
    _storeNameController.dispose();
    _storeAddressController.dispose();
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

  Future<void> _handleStep1() async {
    if (_ownerNameController.text.trim().isEmpty ||
        _ownerPhoneController.text.trim().isEmpty ||
        _passwordController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng điền đầy đủ thông tin chủ quán')),
      );
      return;
    }
    _nextStep();
  }

  Future<void> _handleStep2() async {
    if (_storeNameController.text.trim().isEmpty ||
        _storeAddressController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập tên quán và địa chỉ quán')),
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
                  _buildStep1Owner(),
                  _buildStep2Store(),
                  _buildStep3Confirmation(),
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
            'Đăng Ký Đối Tác Quán',
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

  // ─── Step 1: Owner Info ──────────────────────────────────────────────────
  Widget _buildStep1Owner() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 16),
          const Text(
            '1. Thông Tin Chủ Quán',
            style: TextStyle(
              fontSize: AppFontSize.h2,
              fontWeight: AppFontWeight.extraBold,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Thông tin người đại diện quản lý tài khoản đối tác.',
            style: TextStyle(fontSize: AppFontSize.md, color: AppColors.textSecondaryLight),
          ),
          const SizedBox(height: 24),

          AppTextField(
            labelText: 'Họ và tên chủ quán',
            hintText: 'Trần Văn Quản Lý',
            controller: _ownerNameController,
            keyboardType: TextInputType.name,
            prefixIcon: Iconsax.user,
          ),
          const SizedBox(height: 16),

          AppTextField(
            labelText: 'Số điện thoại liên hệ',
            hintText: '090 123 4567',
            controller: _ownerPhoneController,
            keyboardType: TextInputType.phone,
            prefixIcon: Iconsax.call,
          ),
          const SizedBox(height: 16),

          TextField(
            controller: _passwordController,
            obscureText: _obscurePassword,
            decoration: InputDecoration(
              labelText: 'Mật khẩu đăng nhập',
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
            text: 'Tiếp Theo: Thông Tin Quán',
            onPressed: _handleStep1,
          ),
        ],
      ),
    );
  }

  // ─── Step 2: Store Info ──────────────────────────────────────────────────
  Widget _buildStep2Store() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 16),
          const Text(
            '2. Thông Tin Quán Ăn',
            style: TextStyle(
              fontSize: AppFontSize.h2,
              fontWeight: AppFontWeight.extraBold,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Thông tin hiển thị đến khách hàng trên ứng dụng.',
            style: TextStyle(fontSize: AppFontSize.md, color: AppColors.textSecondaryLight),
          ),
          const SizedBox(height: 24),

          AppTextField(
            labelText: 'Tên quán ăn / nhà hàng',
            hintText: 'Bún Bò Huế Cô Ba',
            controller: _storeNameController,
            prefixIcon: Iconsax.shop,
          ),
          const SizedBox(height: 16),

          AppTextField(
            labelText: 'Địa chỉ quán cụ thể',
            hintText: 'Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1',
            controller: _storeAddressController,
            prefixIcon: Iconsax.location,
          ),
          const SizedBox(height: 16),

          const Text('Danh mục ẩm thực chính', style: TextStyle(fontWeight: AppFontWeight.semiBold)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: AppColors.surfaceAltLight,
              borderRadius: const BorderRadius.all(AppRadius.sm),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                isExpanded: true,
                value: _selectedCategory,
                items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                onChanged: (v) {
                  if (v != null) setState(() => _selectedCategory = v);
                },
              ),
            ),
          ),
          const SizedBox(height: 20),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Bán kính phục vụ', style: TextStyle(fontWeight: AppFontWeight.semiBold)),
              Text(
                '${_serviceRadiusKm.toStringAsFixed(1)} km',
                style: const TextStyle(
                  color: AppColors.primary,
                  fontWeight: AppFontWeight.bold,
                  fontSize: AppFontSize.title,
                ),
              ),
            ],
          ),
          Slider(
            value: _serviceRadiusKm,
            min: 1.0,
            max: 10.0,
            divisions: 18,
            activeColor: AppColors.primary,
            onChanged: (v) => setState(() => _serviceRadiusKm = v),
          ),
          const SizedBox(height: 24),

          AppButton(
            text: 'Tiếp Theo: Xác Nhận Hồ Sơ',
            onPressed: _handleStep2,
          ),
        ],
      ),
    );
  }

  // ─── Step 3: Confirmation ────────────────────────────────────────────────
  Widget _buildStep3Confirmation() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 16),
          const Text(
            '3. Hoàn Tất Đăng Ký',
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
                _SummaryRow(label: 'Chủ quán', value: _ownerNameController.text),
                const Divider(height: 16),
                _SummaryRow(label: 'SĐT', value: _ownerPhoneController.text),
                const Divider(height: 16),
                _SummaryRow(label: 'Tên quán', value: _storeNameController.text),
                const Divider(height: 16),
                _SummaryRow(label: 'Địa chỉ', value: _storeAddressController.text),
                const Divider(height: 16),
                _SummaryRow(label: 'Danh mục', value: _selectedCategory),
                const Divider(height: 16),
                _SummaryRow(label: 'Bán kính', value: '${_serviceRadiusKm.toStringAsFixed(1)} km'),
              ],
            ),
          ),
          const SizedBox(height: 20),

          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.warning.withValues(alpha: 0.1),
              borderRadius: const BorderRadius.all(AppRadius.md),
              border: Border.all(color: AppColors.warning.withValues(alpha: 0.4)),
            ),
            child: const Row(
              children: [
                Icon(Iconsax.info_circle, color: AppColors.warning),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Sau khi đăng ký, bạn sẽ cần xác minh giấy tờ (eKYC) để kích hoạt nhận đơn chính thức.',
                    style: TextStyle(fontSize: AppFontSize.sm),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),

          AppButton(
            text: 'Hoàn Tất & Đi Đến Xác Minh eKYC',
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
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textSecondaryLight)),
        const SizedBox(width: 16),
        Flexible(
          child: Text(
            value.isNotEmpty ? value : '—',
            textAlign: TextAlign.right,
            style: const TextStyle(fontWeight: AppFontWeight.bold),
          ),
        ),
      ],
    );
  }
}
