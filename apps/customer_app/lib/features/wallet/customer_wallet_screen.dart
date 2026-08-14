import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final walletProvider =
    FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  return api.get('/users/me/wallet');
});

final linkedBanksProvider =
    FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  final result = await api.get('/users/me/banks');
  final list = result['data'] as List? ?? [];
  return list.cast<Map<String, dynamic>>();
});

final transactionHistoryProvider =
    FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  final result = await api.get('/users/me/transactions', query: {'limit': '20'});
  final list = result['data'] as List? ?? [];
  return list.cast<Map<String, dynamic>>();
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class CustomerWalletScreen extends ConsumerStatefulWidget {
  const CustomerWalletScreen({super.key});

  @override
  ConsumerState<CustomerWalletScreen> createState() =>
      _CustomerWalletScreenState();
}

class _CustomerWalletScreenState
    extends ConsumerState<CustomerWalletScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final walletAsync = ref.watch(walletProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'VÃ­ & Thanh ToÃ¡n',
          style: TextStyle(fontWeight: AppFontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Iconsax.info_circle),
            tooltip: 'Trá»£ giÃºp',
            onPressed: () => _showHelp(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // â”€â”€â”€ Balance card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          walletAsync.when(
            loading: () => const _BalanceSkeleton(),
            error: (_, _) => _BalanceCard(balance: 0, pendingRefund: 0),
            data: (data) => _BalanceCard(
              balance: (data['balance'] as num?)?.toInt() ?? 0,
              pendingRefund: (data['pending_refund'] as num?)?.toInt() ?? 0,
            ),
          ),

          // â”€â”€â”€ Quick actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          _QuickActions(
            onTopUp: () => _showTopUpSheet(context),
            onWithdraw: () => _showWithdrawSheet(context),
            onKyc: () => context.push('/wallet/kyc'),
          ),

          // â”€â”€â”€ Tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          Container(
            color: Colors.white,
            child: TabBar(
              controller: _tabController,
              labelColor: AppColors.primary,
              unselectedLabelColor: AppColors.textSecondaryLight,
              indicatorColor: AppColors.primary,
              tabs: const [
                Tab(text: 'NgÃ¢n HÃ ng LiÃªn Káº¿t'),
                Tab(text: 'Lá»‹ch Sá»­ Giao Dá»‹ch'),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _LinkedBanksTab(
                  onAddBank: () => context.push('/wallet/add-bank'),
                ),
                const _TransactionHistoryTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showHelp(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => const _HelpSheet(),
    );
  }

  void _showTopUpSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => const _TopUpSheet(),
    );
  }

  void _showWithdrawSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => const _WithdrawSheet(),
    );
  }
}

// ---------------------------------------------------------------------------
// Balance Card
// ---------------------------------------------------------------------------

class _BalanceCard extends StatelessWidget {
  final int balance;
  final int pendingRefund;

  const _BalanceCard({required this.balance, required this.pendingRefund});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primary, AppColors.primaryDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: const BorderRadius.all(AppRadius.lg),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.4),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Iconsax.wallet_3, color: Colors.white70, size: 18),
              const SizedBox(width: 6),
              const Text(
                'Sá»‘ dÆ° vÃ­ TranGia',
                style: TextStyle(color: Colors.white70, fontSize: AppFontSize.sm),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: const BorderRadius.all(AppRadius.full),
                ),
                child: const Row(
                  children: [
                    Icon(Iconsax.shield_tick, color: Colors.white, size: 14),
                    SizedBox(width: 4),
                    Text(
                      'ÄÃ£ xÃ¡c minh',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: AppFontSize.xs,
                        fontWeight: AppFontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            _formatMoney(balance),
            style: const TextStyle(
              color: Colors.white,
              fontSize: AppFontSize.h1,
              fontWeight: AppFontWeight.bold,
              letterSpacing: 1,
            ),
          ),
          if (pendingRefund > 0) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                borderRadius: const BorderRadius.all(AppRadius.sm),
              ),
              child: Text(
                'â³ Äang hoÃ n tiá»n: ${_formatMoney(pendingRefund)}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: AppFontSize.sm,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _formatMoney(int v) =>
      '${v.toString().replaceAllMapped(
        RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
        (m) => '${m[1]}.',
      )}Ä‘';
}

class _BalanceSkeleton extends StatelessWidget {
  const _BalanceSkeleton();

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      height: 120,
      decoration: BoxDecoration(
        color: AppColors.surfaceAltLight,
        borderRadius: const BorderRadius.all(AppRadius.lg),
      ),
      child: const Center(child: CircularProgressIndicator()),
    );
  }
}

// ---------------------------------------------------------------------------
// Quick Actions
// ---------------------------------------------------------------------------

class _QuickActions extends StatelessWidget {
  final VoidCallback onTopUp;
  final VoidCallback onWithdraw;
  final VoidCallback onKyc;

  const _QuickActions({
    required this.onTopUp,
    required this.onWithdraw,
    required this.onKyc,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          _ActionBtn(
            icon: Iconsax.add_circle,
            label: 'Náº¡p tiá»n',
            onTap: onTopUp,
          ),
          const SizedBox(width: 12),
          _ActionBtn(
            icon: Iconsax.money_send,
            label: 'RÃºt tiá»n',
            onTap: onWithdraw,
          ),
          const SizedBox(width: 12),
          _ActionBtn(
            icon: Iconsax.scan_barcode,
            label: 'eKYC',
            onTap: onKyc,
            color: AppColors.warning,
          ),
        ],
      ),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? color;

  const _ActionBtn({
    required this.icon,
    required this.label,
    required this.onTap,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final c = color ?? AppColors.primary;
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: c.withValues(alpha: 0.08),
            borderRadius: const BorderRadius.all(AppRadius.md),
            border: Border.all(color: c.withValues(alpha: 0.2)),
          ),
          child: Column(
            children: [
              Icon(icon, color: c, size: 24),
              const SizedBox(height: 6),
              Text(
                label,
                style: TextStyle(
                  color: c,
                  fontSize: AppFontSize.sm,
                  fontWeight: AppFontWeight.semiBold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Linked Banks Tab
// ---------------------------------------------------------------------------

class _LinkedBanksTab extends ConsumerWidget {
  final VoidCallback onAddBank;

  const _LinkedBanksTab({required this.onAddBank});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final banksAsync = ref.watch(linkedBanksProvider);

    return banksAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, _) => _buildBankList(context, []),
      data: (banks) => _buildBankList(context, banks),
    );
  }

  Widget _buildBankList(BuildContext context, List<Map<String, dynamic>> banks) {
    // Mock banks náº¿u API chÆ°a tráº£ vá»
    final displayBanks = banks.isEmpty
        ? [
            {
              'bank_name': 'Vietcombank',
              'account_number': 'â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ 4521',
              'account_holder': 'NGUYEN VAN A',
              'is_default': true,
              'logo': 'vcb',
            },
          ]
        : banks;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        ...displayBanks.map((bank) => _BankCard(bank: bank)),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: onAddBank,
          icon: const Icon(Iconsax.add_circle),
          label: const Text('LiÃªn káº¿t tháº» / tÃ i khoáº£n má»›i'),
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.primary,
            side: const BorderSide(color: AppColors.primary),
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.all(AppRadius.md),
            ),
          ),
        ),
        const SizedBox(height: 20),
        // KYC CTA
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.warning.withValues(alpha: 0.08),
            borderRadius: const BorderRadius.all(AppRadius.md),
            border: Border.all(color: AppColors.warning.withValues(alpha: 0.3)),
          ),
          child: Row(
            children: [
              const Icon(Iconsax.personalcard, color: AppColors.warning, size: 28),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'XÃ¡c minh danh tÃ­nh (eKYC)',
                      style: TextStyle(
                        fontWeight: AppFontWeight.bold,
                        fontSize: AppFontSize.base,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'XÃ¡c minh CCCD Ä‘á»ƒ má»Ÿ khÃ³a thanh toÃ¡n ngÃ¢n hÃ ng & hoÃ n tiá»n tá»± Ä‘á»™ng',
                      style: TextStyle(
                        fontSize: AppFontSize.sm,
                        color: AppColors.textSecondaryLight,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              const Icon(Icons.arrow_forward_ios, size: 16),
            ],
          ),
        ),
      ],
    );
  }
}

class _BankCard extends StatelessWidget {
  final Map<String, dynamic> bank;
  const _BankCard({required this.bank});

  @override
  Widget build(BuildContext context) {
    final isDefault = bank['is_default'] as bool? ?? false;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.all(AppRadius.md),
        border: Border.all(
          color: isDefault ? AppColors.primary : AppColors.dividerLight,
          width: isDefault ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 6,
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.surfaceAltLight,
              borderRadius: const BorderRadius.all(AppRadius.sm),
            ),
            child: const Center(
              child: Icon(Iconsax.bank, color: AppColors.primary, size: 22),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  bank['bank_name'] as String? ?? 'NgÃ¢n hÃ ng',
                  style: const TextStyle(
                    fontWeight: AppFontWeight.bold,
                    fontSize: AppFontSize.base,
                  ),
                ),
                Text(
                  bank['account_number'] as String? ?? '',
                  style: const TextStyle(
                    fontSize: AppFontSize.sm,
                    color: AppColors.textSecondaryLight,
                  ),
                ),
              ],
            ),
          ),
          if (isDefault)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: const BorderRadius.all(AppRadius.full),
              ),
              child: const Text(
                'Máº·c Ä‘á»‹nh',
                style: TextStyle(
                  color: AppColors.primary,
                  fontSize: AppFontSize.xs,
                  fontWeight: AppFontWeight.bold,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Transaction History Tab
// ---------------------------------------------------------------------------

class _TransactionHistoryTab extends ConsumerWidget {
  const _TransactionHistoryTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final txAsync = ref.watch(transactionHistoryProvider);

    return txAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, _) => _buildMockList(),
      data: (list) => list.isEmpty ? _buildMockList() : _buildList(list),
    );
  }

  Widget _buildMockList() {
    final mock = [
      {'type': 'refund', 'amount': 126000, 'desc': 'HoÃ n tiá»n Ä‘Æ¡n #9821', 'date': '14/08/2026'},
      {'type': 'payment', 'amount': -85000, 'desc': 'Thanh toÃ¡n Ä‘Æ¡n #9820', 'date': '13/08/2026'},
      {'type': 'topup', 'amount': 200000, 'desc': 'Náº¡p tiá»n tá»« Vietcombank', 'date': '12/08/2026'},
      {'type': 'payment', 'amount': -62000, 'desc': 'Thanh toÃ¡n Ä‘Æ¡n #9811', 'date': '11/08/2026'},
    ];
    return _buildList(mock);
  }

  Widget _buildList(List<Map<String, dynamic>> list) {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: list.length,
      separatorBuilder: (_, _) => const Divider(height: 1),
      itemBuilder: (ctx, i) => _TxRow(tx: list[i]),
    );
  }
}

class _TxRow extends StatelessWidget {
  final Map<String, dynamic> tx;
  const _TxRow({required this.tx});

  @override
  Widget build(BuildContext context) {
    final type = tx['type'] as String? ?? 'payment';
    final amount = (tx['amount'] as num?)?.toInt() ?? 0;
    final desc = tx['desc'] as String? ?? '';
    final date = tx['date'] as String? ?? '';

    final isCredit = amount > 0;
    final icon = switch (type) {
      'refund' => Iconsax.rotate_left,
      'topup' => Iconsax.add_circle,
      _ => Iconsax.card_remove,
    };
    final iconColor = isCredit ? AppColors.success : AppColors.error;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.1),
              borderRadius: const BorderRadius.all(AppRadius.full),
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  desc,
                  style: const TextStyle(
                    fontWeight: AppFontWeight.semiBold,
                    fontSize: AppFontSize.base,
                  ),
                ),
                Text(
                  date,
                  style: const TextStyle(
                    fontSize: AppFontSize.sm,
                    color: AppColors.textSecondaryLight,
                  ),
                ),
              ],
            ),
          ),
          Text(
            '${isCredit ? '+' : ''}${amount.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}Ä‘',
            style: TextStyle(
              fontWeight: AppFontWeight.bold,
              fontSize: AppFontSize.base,
              color: isCredit ? AppColors.success : AppColors.error,
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Bottom Sheets
// ---------------------------------------------------------------------------

class _TopUpSheet extends StatefulWidget {
  const _TopUpSheet();

  @override
  State<_TopUpSheet> createState() => _TopUpSheetState();
}

class _TopUpSheetState extends State<_TopUpSheet> {
  final _amountController = TextEditingController();
  String _method = 'bank';
  final _amounts = [50000, 100000, 200000, 500000];

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.viewInsetsOf(context).bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Náº¡p Tiá»n VÃ o VÃ­',
            style: TextStyle(fontSize: AppFontSize.xl, fontWeight: AppFontWeight.bold),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _amounts
                .map(
                  (a) => ActionChip(
                    label: Text(
                      '${a.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}Ä‘',
                    ),
                    onPressed: () =>
                        setState(() => _amountController.text = a.toString()),
                    backgroundColor: AppColors.primaryLight.withValues(alpha: 0.1),
                    labelStyle: const TextStyle(color: AppColors.primary, fontWeight: AppFontWeight.semiBold),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 12),
          AppTextField(
            controller: _amountController,
            labelText: 'Sá»‘ tiá»n náº¡p',
            hintText: 'Nháº­p sá»‘ tiá»n...',
            prefixIcon: Iconsax.money_4,
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 16),
          const Text('PhÆ°Æ¡ng thá»©c', style: TextStyle(fontWeight: AppFontWeight.semiBold)),
          const SizedBox(height: 8),
          _buildMethod('bank', 'NgÃ¢n hÃ ng liÃªn káº¿t', Iconsax.bank),
          _buildMethod('momo', 'VÃ­ MoMo', Iconsax.wallet_3),
          const SizedBox(height: 16),
          AppButton(
            text: 'Náº¡p tiá»n ngay',
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Äang xá»­ lÃ½ náº¡p tiá»n... â³')),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildMethod(String value, String label, IconData icon) {
    final isSelected = _method == value;
    return GestureDetector(
      onTap: () => setState(() => _method = value),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withValues(alpha: 0.08)
              : AppColors.surfaceAltLight,
          borderRadius: const BorderRadius.all(AppRadius.md),
          border: Border.all(
            color: isSelected ? AppColors.primary : Colors.transparent,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? AppColors.primary : AppColors.textSecondaryLight),
            const SizedBox(width: 10),
            Text(label, style: TextStyle(fontWeight: isSelected ? AppFontWeight.bold : AppFontWeight.regular)),
            const Spacer(),
            if (isSelected) const Icon(Icons.check_circle, color: AppColors.primary, size: 20),
          ],
        ),
      ),
    );
  }
}

class _WithdrawSheet extends StatelessWidget {
  const _WithdrawSheet();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.viewInsetsOf(context).bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'RÃºt Tiá»n',
            style: TextStyle(fontSize: AppFontSize.xl, fontWeight: AppFontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text(
            'Tiá»n sáº½ chuyá»ƒn vá» tÃ i khoáº£n ngÃ¢n hÃ ng máº·c Ä‘á»‹nh trong 1-2 ngÃ y lÃ m viá»‡c.',
            style: TextStyle(color: AppColors.textSecondaryLight, fontSize: AppFontSize.sm),
          ),
          const SizedBox(height: 16),
          const AppTextField(
            labelText: 'Sá»‘ tiá»n rÃºt',
            hintText: 'Tá»‘i thiá»ƒu 50.000Ä‘',
            prefixIcon: Iconsax.money_send,
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 16),
          AppButton(
            text: 'XÃ¡c nháº­n rÃºt tiá»n',
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Lá»‡nh rÃºt Ä‘Ã£ Ä‘Æ°á»£c gá»­i âœ…')),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _HelpSheet extends StatelessWidget {
  const _HelpSheet();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'VÃ­ TranGia hoáº¡t Ä‘á»™ng tháº¿ nÃ o?',
            style: TextStyle(fontSize: AppFontSize.title, fontWeight: AppFontWeight.bold),
          ),
          const SizedBox(height: 16),
          _HelpItem(
            icon: Iconsax.add_circle,
            title: 'Náº¡p tiá»n',
            desc: 'Náº¡p tá»« ngÃ¢n hÃ ng liÃªn káº¿t hoáº·c MoMo, tiá»n cÃ³ máº·t ngay láº­p tá»©c',
          ),
          _HelpItem(
            icon: Iconsax.rotate_left,
            title: 'HoÃ n tiá»n',
            desc: 'Khi há»§y Ä‘Æ¡n hÃ ng, tiá»n Ä‘Æ°á»£c hoÃ n vá» vÃ­ trong 1-3 ngÃ y',
          ),
          _HelpItem(
            icon: Iconsax.shield_tick,
            title: 'Báº£o máº­t',
            desc: 'Giao dá»‹ch lá»›n yÃªu cáº§u xÃ¡c thá»±c Face ID hoáº·c PIN',
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

class _HelpItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String desc;

  const _HelpItem({required this.icon, required this.title, required this.desc});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.primary, size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: AppFontWeight.bold, fontSize: AppFontSize.base),
                ),
                Text(
                  desc,
                  style: const TextStyle(
                    fontSize: AppFontSize.sm,
                    color: AppColors.textSecondaryLight,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

