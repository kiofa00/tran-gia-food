import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:iconsax/iconsax.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_ui/shared_ui.dart';

import '../../../../core/providers/api_client_provider.dart';
import '../profile_provider.dart';

class UpdateProfileBottomSheet extends ConsumerStatefulWidget {
  final Map<String, dynamic>? profile;

  const UpdateProfileBottomSheet({super.key, this.profile});

  static Future<void> show(BuildContext context, {Map<String, dynamic>? profile}) {
    return AppModalBottomSheet.show(
      context: context,
      builder: (ctx) => UpdateProfileBottomSheet(profile: profile),
    );
  }

  @override
  ConsumerState<UpdateProfileBottomSheet> createState() =>
      _UpdateProfileBottomSheetState();
}

class _UpdateProfileBottomSheetState
    extends ConsumerState<UpdateProfileBottomSheet> {
  final _formKey = GlobalKey<FormState>();
  final _picker = ImagePicker();

  late final TextEditingController _nameController;
  late final TextEditingController _emailController;
  late final TextEditingController _phoneController;

  String? _selectedAvatarUrl;
  Uint8List? _pickedImageBytes;
  String? _pickedImageName;
  String? _pickedImageMimeType;
  String? _errorMessage;
  bool _isLoading = false;

  static const List<String> _presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  ];

  @override
  void initState() {
    super.initState();
    final p = widget.profile;
    _nameController = TextEditingController(text: p?['name'] as String? ?? '');
    _emailController = TextEditingController(text: p?['email'] as String? ?? '');
    _phoneController = TextEditingController(text: p?['phone'] as String? ?? '');
    _selectedAvatarUrl = p?['avatarUrl'] as String?;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final image = await _picker.pickImage(
        source: source,
        maxWidth: 512,
        maxHeight: 512,
        imageQuality: 85,
      );
      if (image == null) return;

      final bytes = await image.readAsBytes();
      String name = image.name;
      final mimeType = image.mimeType;
      // Ensure file name has a proper image extension
      if (!name.contains('.')) {
        final ext = (mimeType != null && mimeType.contains('/'))
            ? mimeType.split('/').last
            : 'jpg';
        name = '$name.$ext';
      }

      setState(() {
        _pickedImageBytes = bytes;
        _pickedImageName = name;
        _pickedImageMimeType = mimeType;
        _selectedAvatarUrl = null;
        _errorMessage = null;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Không thể chọn ảnh: $e';
        });
      }
    }
  }

  void _showImageSourcePicker() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;
        return Container(
          decoration: BoxDecoration(
            color: isDark ? AppColors.surfaceDark : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.dividerDark : AppColors.dividerLight,
                  borderRadius: const BorderRadius.all(AppRadius.full),
                ),
              ),
              const Text(
                'Chọn Ảnh Đại Diện',
                style: TextStyle(
                  fontSize: AppFontSize.title,
                  fontWeight: AppFontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(Iconsax.gallery, color: AppColors.primary),
                title: const Text(
                  'Chọn từ thư viện ảnh',
                  style: TextStyle(fontWeight: AppFontWeight.medium),
                ),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage(ImageSource.gallery);
                },
              ),
              ListTile(
                leading: const Icon(Iconsax.camera, color: AppColors.primary),
                title: const Text(
                  'Chụp ảnh mới',
                  style: TextStyle(fontWeight: AppFontWeight.medium),
                ),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage(ImageSource.camera);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final api = ref.read(apiClientProvider);

      String? uploadedAvatarUrl;
      // If user selected an image from device, upload it first
      if (_pickedImageBytes != null) {
        MediaType? parsedType;
        if (_pickedImageMimeType != null && _pickedImageMimeType!.contains('/')) {
          final parts = _pickedImageMimeType!.split('/');
          parsedType = MediaType(parts[0], parts[1]);
        }

        final uploadRes = await api.uploadFile(
          '/users/me/avatar',
          fileBytes: _pickedImageBytes!,
          filename: _pickedImageName ?? 'avatar.jpg',
          contentType: parsedType,
          fieldName: 'avatar',
        );
        uploadedAvatarUrl = uploadRes['avatarUrl'] as String?;
      }

      final avatarToSave = uploadedAvatarUrl ?? _selectedAvatarUrl;

      final payload = <String, dynamic>{
        'name': _nameController.text.trim(),
        if (_emailController.text.trim().isNotEmpty)
          'email': _emailController.text.trim(),
        'avatarUrl': ?avatarToSave,
      };

      await api.patch('/users/me', payload);

      ref.invalidate(myProfileProvider);

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cập nhật thông tin thành công!'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        final message = e is ApiException
            ? e.message
            : e.toString().replaceAll('Exception: ', '');
        setState(() {
          _errorMessage = message;
        });
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AppModalBottomSheet(
      title: 'Cập Nhật Thông Tin',
      icon: Iconsax.user_edit,
      child: Form(
        key: _formKey,
        child: ListView(
          children: [
            // Error banner
            if (_errorMessage != null) ...[
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.error.withValues(alpha: 0.1),
                  borderRadius: const BorderRadius.all(AppRadius.md),
                  border: Border.all(
                    color: AppColors.error.withValues(alpha: 0.3),
                    width: 1,
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Padding(
                      padding: EdgeInsets.only(top: 2),
                      child: Icon(
                        Iconsax.warning_2,
                        color: AppColors.error,
                        size: 18,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Không thể cập nhật hồ sơ',
                            style: TextStyle(
                              fontSize: AppFontSize.sm,
                              fontWeight: AppFontWeight.bold,
                              color: AppColors.error,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _errorMessage!,
                            style: TextStyle(
                              fontSize: AppFontSize.xs,
                              color: isDark
                                  ? AppColors.textPrimaryDark
                                  : AppColors.textPrimaryLight,
                              height: 1.4,
                            ),
                          ),
                        ],
                      ),
                    ),
                    InkWell(
                      onTap: () => setState(() => _errorMessage = null),
                      borderRadius: const BorderRadius.all(AppRadius.full),
                      child: const Padding(
                        padding: EdgeInsets.all(4),
                        child: Icon(
                          Icons.close,
                          size: 16,
                          color: AppColors.textHintLight,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            // Avatar section
            Center(
              child: Column(
                children: [
                  GestureDetector(
                    onTap: _showImageSourcePicker,
                    child: Stack(
                      children: [
                        CircleAvatar(
                          radius: 44,
                          backgroundColor: isDark
                              ? AppColors.surfaceAltDark
                              : AppColors.surfaceAltLight,
                          backgroundImage: _pickedImageBytes != null
                              ? MemoryImage(_pickedImageBytes!)
                              : (_selectedAvatarUrl != null
                                  ? NetworkImage(_selectedAvatarUrl!)
                                  : null),
                          child: (_pickedImageBytes == null && _selectedAvatarUrl == null)
                              ? Text(
                                  _nameController.text.trim().isNotEmpty
                                      ? _nameController.text.trim()[0].toUpperCase()
                                      : 'K',
                                  style: const TextStyle(
                                    fontSize: AppFontSize.xl,
                                    fontWeight: AppFontWeight.bold,
                                    color: AppColors.primary,
                                  ),
                                )
                              : null,
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: const BoxDecoration(
                              color: AppColors.primary,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Iconsax.camera,
                              color: Colors.white,
                              size: 16,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  OutlinedButton.icon(
                    onPressed: _showImageSourcePicker,
                    icon: const Icon(Iconsax.gallery_add, size: 18),
                    label: const Text('Chọn ảnh từ máy'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: const BorderSide(color: AppColors.primary),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 8,
                      ),
                      shape: const RoundedRectangleBorder(
                        borderRadius: BorderRadius.all(AppRadius.full),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    'Hoặc chọn avatar có sẵn',
                    style: TextStyle(
                      fontSize: AppFontSize.sm,
                      color: AppColors.textSecondaryLight,
                    ),
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    height: 48,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      shrinkWrap: true,
                      itemCount: _presetAvatars.length,
                      separatorBuilder: (_, _) => const SizedBox(width: 10),
                      itemBuilder: (context, index) {
                        final url = _presetAvatars[index];
                        final isSelected =
                            _selectedAvatarUrl == url && _pickedImageBytes == null;
                        return GestureDetector(
                          onTap: () {
                            setState(() {
                              _selectedAvatarUrl = url;
                              _pickedImageBytes = null;
                              _pickedImageName = null;
                            });
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isSelected
                                    ? AppColors.primary
                                    : Colors.transparent,
                                width: 2.5,
                              ),
                            ),
                            child: CircleAvatar(
                              radius: 20,
                              backgroundImage: NetworkImage(url),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Full Name field
            AppTextField(
              controller: _nameController,
              labelText: 'Họ và tên *',
              hintText: 'Nhập họ và tên của bạn',
              prefixIcon: Iconsax.user,
              textInputAction: TextInputAction.next,
              validator: (val) {
                if (val == null || val.trim().isEmpty) {
                  return 'Vui lòng nhập họ và tên';
                }
                if (val.trim().length < 2) {
                  return 'Họ và tên tối thiểu 2 ký tự';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Email field
            AppTextField(
              controller: _emailController,
              labelText: 'Email',
              hintText: 'Nhập địa chỉ email',
              prefixIcon: Iconsax.sms,
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.done,
              validator: (val) {
                if (val != null && val.trim().isNotEmpty) {
                  final emailRegex = RegExp(
                    r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$',
                  );
                  if (!emailRegex.hasMatch(val.trim())) {
                    return 'Địa chỉ email không hợp lệ';
                  }
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Phone field (read only)
            AppTextField(
              controller: _phoneController,
              labelText: 'Số điện thoại',
              hintText: 'Số điện thoại đã đăng ký',
              prefixIcon: Iconsax.call,
              readOnly: true,
              enabled: false,
              suffixIcon: const Tooltip(
                message: 'Số điện thoại đăng nhập không thể thay đổi',
                child: Icon(
                  Iconsax.lock,
                  size: 18,
                  color: AppColors.textHintLight,
                ),
              ),
            ),
            const SizedBox(height: 4),
            const Padding(
              padding: EdgeInsets.only(left: 4),
              child: Text(
                'Số điện thoại tài khoản không thể thay đổi',
                style: TextStyle(
                  fontSize: AppFontSize.xs,
                  color: AppColors.textHintLight,
                ),
              ),
            ),
            const SizedBox(height: 28),

            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _isLoading ? null : () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: const RoundedRectangleBorder(
                        borderRadius: BorderRadius.all(AppRadius.sm),
                      ),
                      side: BorderSide(
                        color: isDark
                            ? AppColors.dividerDark
                            : AppColors.dividerLight,
                      ),
                    ),
                    child: Text(
                      'Hủy',
                      style: TextStyle(
                        fontSize: AppFontSize.md,
                        fontWeight: AppFontWeight.semiBold,
                        color: isDark
                            ? AppColors.textSecondaryDark
                            : AppColors.textSecondaryLight,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _handleSave,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: const RoundedRectangleBorder(
                        borderRadius: BorderRadius.all(AppRadius.sm),
                      ),
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.5,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Text(
                            'Lưu Thay Đổi',
                            style: TextStyle(
                              fontSize: AppFontSize.md,
                              fontWeight: AppFontWeight.bold,
                            ),
                          ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
