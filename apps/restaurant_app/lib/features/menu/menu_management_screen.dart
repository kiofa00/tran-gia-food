import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final myMenuProvider = FutureProvider.autoDispose<Map<String, dynamic>>((
  ref,
) async {
  final api = ref.read(apiClientProvider);
  return api.get('/menu/my');
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class MenuManagementScreen extends ConsumerStatefulWidget {
  const MenuManagementScreen({super.key});

  @override
  ConsumerState<MenuManagementScreen> createState() =>
      _MenuManagementScreenState();
}

class _MenuManagementScreenState extends ConsumerState<MenuManagementScreen> {
  @override
  Widget build(BuildContext context) {
    final menuAsync = ref.watch(myMenuProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Quản Lý Menu',
          style: TextStyle(fontWeight: AppFontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Iconsax.add_circle),
            onPressed: () => _showAddItemDialog(context),
            tooltip: 'Thêm món mới',
          ),
        ],
      ),
      body: menuAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _ErrorView(
          message: e.toString(),
          onRetry: () => ref.invalidate(myMenuProvider),
        ),
        data: (res) {
          final categories = List<Map<String, dynamic>>.from(res['data'] ?? []);
          if (categories.isEmpty) {
            return _EmptyMenuView(onAdd: () => _showAddItemDialog(context));
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(myMenuProvider),
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: categories.length,
              itemBuilder: (_, i) => _CategorySection(
                category: categories[i],
                onRefresh: () => ref.invalidate(myMenuProvider),
              ),
            ),
          );
        },
      ),
    );
  }

  void _showAddItemDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: AppRadius.xl),
      ),
      builder: (_) => _AddMenuItemSheet(
        onSaved: () {
          ref.invalidate(myMenuProvider);
          Navigator.pop(context);
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Category section
// ---------------------------------------------------------------------------

class _CategorySection extends StatelessWidget {
  final Map<String, dynamic> category;
  final VoidCallback onRefresh;

  const _CategorySection({required this.category, required this.onRefresh});

  @override
  Widget build(BuildContext context) {
    final name = category['name'] as String? ?? '';
    final items = List<Map<String, dynamic>>.from(category['menuItems'] ?? []);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Row(
            children: [
              const Icon(Iconsax.category, size: 18, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                name,
                style: const TextStyle(
                  fontSize: AppFontSize.title,
                  fontWeight: AppFontWeight.bold,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: const BorderRadius.all(AppRadius.full),
                ),
                child: Text(
                  '${items.length} món',
                  style: const TextStyle(
                    fontSize: AppFontSize.xs,
                    color: AppColors.primary,
                    fontWeight: AppFontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
        ...items.map((item) => _MenuItemTile(item: item, onRefresh: onRefresh)),
        const SizedBox(height: 8),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Menu item tile
// ---------------------------------------------------------------------------

class _MenuItemTile extends ConsumerWidget {
  final Map<String, dynamic> item;
  final VoidCallback onRefresh;

  const _MenuItemTile({required this.item, required this.onRefresh});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final name = item['name'] as String? ?? '';
    final price = (item['price'] as num? ?? 0).toStringAsFixed(0);
    final isAvailable = item['isAvailable'] as bool? ?? true;
    final imageUrl = item['image'] as String?;
    final id = item['id'] as String? ?? '';

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.surfaceLight,
        borderRadius: const BorderRadius.all(AppRadius.md),
        boxShadow: AppShadows.sm,
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        leading: ClipRRect(
          borderRadius: const BorderRadius.all(AppRadius.sm),
          child: SizedBox(
            width: 52,
            height: 52,
            child: imageUrl != null
                ? Image.network(
                    imageUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (_, _, _) => const Icon(
                      Iconsax.image,
                      color: AppColors.textSecondaryLight,
                    ),
                  )
                : const Icon(
                    Iconsax.image,
                    color: AppColors.textSecondaryLight,
                  ),
          ),
        ),
        title: Text(
          name,
          style: const TextStyle(
            fontWeight: AppFontWeight.bold,
            fontSize: AppFontSize.md,
          ),
        ),
        subtitle: Text(
          '${price.replaceAllMapped(RegExp(r"(\d)(?=(\d{3})+(?!\d))"), (m) => "${m[1]}.")}đ',
          style: const TextStyle(
            color: AppColors.primary,
            fontWeight: AppFontWeight.bold,
            fontSize: AppFontSize.body,
          ),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Switch(
              value: isAvailable,
              activeThumbColor: AppColors.success,
              onChanged: (val) => _toggleAvailability(ref, id, val),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _toggleAvailability(WidgetRef ref, String id, bool value) async {
    try {
      final api = ref.read(apiClientProvider);
      await api.patch('/menu/items/$id', {'isAvailable': value});
      onRefresh();
    } catch (e) {
      // silently fail, state will revert on next refresh
    }
  }
}

// ---------------------------------------------------------------------------
// Add item bottom sheet
// ---------------------------------------------------------------------------

class _AddMenuItemSheet extends ConsumerStatefulWidget {
  final VoidCallback onSaved;

  const _AddMenuItemSheet({required this.onSaved});

  @override
  ConsumerState<_AddMenuItemSheet> createState() => _AddMenuItemSheetState();
}

class _AddMenuItemSheetState extends ConsumerState<_AddMenuItemSheet> {
  final _nameController = TextEditingController();
  final _priceController = TextEditingController();
  bool _isSaving = false;

  @override
  void dispose() {
    _nameController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_nameController.text.trim().isEmpty ||
        _priceController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập đủ thông tin')),
      );
      return;
    }
    setState(() => _isSaving = true);
    try {
      final api = ref.read(apiClientProvider);
      await api.post('/menu/items', {
        'name': _nameController.text.trim(),
        'price': double.tryParse(_priceController.text.trim()) ?? 0,
      });
      widget.onSaved();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi: ${e.toString()}')));
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Thêm Món Mới',
            style: TextStyle(
              fontSize: AppFontSize.xl,
              fontWeight: AppFontWeight.bold,
            ),
          ),
          const SizedBox(height: 20),
          AppTextField(
            labelText: 'Tên món',
            hintText: 'VD: Phở bò tái',
            controller: _nameController,
            prefixIcon: Iconsax.cup,
          ),
          const SizedBox(height: 12),
          AppTextField(
            labelText: 'Giá (đồng)',
            hintText: 'VD: 55000',
            controller: _priceController,
            prefixIcon: Iconsax.money_change,
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 24),
          AppButton(text: 'Lưu Món', isLoading: _isSaving, onPressed: _save),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Empty & Error states
// ---------------------------------------------------------------------------

class _EmptyMenuView extends StatelessWidget {
  final VoidCallback onAdd;

  const _EmptyMenuView({required this.onAdd});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Iconsax.menu_board,
            size: 64,
            color: AppColors.textSecondaryLight,
          ),
          const SizedBox(height: 16),
          const Text(
            'Menu của bạn đang trống',
            style: TextStyle(
              fontSize: AppFontSize.lg,
              fontWeight: AppFontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Thêm danh mục và món ăn để bắt đầu nhận đơn',
            style: TextStyle(color: AppColors.textSecondaryLight),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            icon: const Icon(Iconsax.add),
            label: const Text('Thêm Món Đầu Tiên'),
            onPressed: onAdd,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Iconsax.warning_2, size: 48, color: AppColors.error),
            const SizedBox(height: 12),
            const Text(
              'Không thể tải menu',
              style: TextStyle(fontWeight: AppFontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.textSecondaryLight),
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              icon: const Icon(Iconsax.refresh),
              label: const Text('Thử lại'),
              onPressed: onRetry,
            ),
          ],
        ),
      ),
    );
  }
}
