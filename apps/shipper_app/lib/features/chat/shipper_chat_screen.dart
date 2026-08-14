import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:iconsax/iconsax.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../../core/providers/api_client_provider.dart';

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

final shipperChatMessagesProvider = FutureProvider.autoDispose
    .family<List<Map<String, dynamic>>, String>((ref, orderId) async {
  final api = ref.read(apiClientProvider);
  final result = await api.get('/chat/$orderId/messages');
  final list = result['data'] as List? ?? [];
  return list.cast<Map<String, dynamic>>();
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class ShipperChatScreen extends ConsumerStatefulWidget {
  final String orderId;
  final String recipientName;

  /// 'customer' | 'restaurant'
  final String recipientType;

  const ShipperChatScreen({
    super.key,
    required this.orderId,
    required this.recipientName,
    this.recipientType = 'customer',
  });

  @override
  ConsumerState<ShipperChatScreen> createState() => _ShipperChatScreenState();
}

class _ShipperChatScreenState extends ConsumerState<ShipperChatScreen>
    with TickerProviderStateMixin {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  bool _isSending = false;

  final List<Map<String, dynamic>> _localMessages = [
    {
      'id': '1',
      'from': 'other',
      'text': 'Bạn đến quán lấy hàng chưa?',
      'time': '17:10',
    },
    {
      'id': '2',
      'from': 'me',
      'text': 'Tôi đang đến rồi, còn khoảng 3 phút!',
      'time': '17:11',
    },
    {
      'id': '3',
      'from': 'other',
      'text': 'Ok, tôi chờ trước cổng nhé 😊',
      'time': '17:11',
    },
  ];

  static const _shipperQuickReplies = [
    'Tôi đang đến',
    'Đã lấy hàng rồi',
    'Cho tôi địa chỉ chi tiết',
    'Vui lòng ra nhận hàng',
    'Tôi sẽ để hàng trước cổng',
    'Đơn đã giao thành công!',
  ];

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage(String text) async {
    if (text.trim().isEmpty || _isSending) return;
    _messageController.clear();
    setState(() {
      _isSending = true;
      _localMessages.add({
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'from': 'me',
        'text': text.trim(),
        'time': _currentTime(),
      });
    });
    await Future.delayed(const Duration(milliseconds: 300));
    if (mounted) setState(() => _isSending = false);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  String _currentTime() {
    final now = DateTime.now();
    return '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final isCustomer = widget.recipientType == 'customer';

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => context.pop(),
        ),
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: AppColors.primary.withValues(alpha: 0.15),
              child: Icon(
                isCustomer ? Iconsax.user : Iconsax.shop,
                color: AppColors.primary,
                size: 18,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.recipientName,
                    style: const TextStyle(
                      fontWeight: AppFontWeight.bold,
                      fontSize: AppFontSize.base,
                    ),
                  ),
                  Text(
                    isCustomer ? '👤 Khách hàng' : '🍽️ Nhà hàng',
                    style: const TextStyle(
                      fontSize: AppFontSize.xs,
                      color: AppColors.textSecondaryLight,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Iconsax.call),
            onPressed: () => _initiateCall(context),
          ),
          IconButton(
            icon: const Icon(Iconsax.location),
            tooltip: 'Xem vị trí',
            onPressed: () => context.push('/navigate/${widget.orderId}'),
          ),
        ],
      ),
      body: Column(
        children: [
          // Order banner
          _OrderBanner(orderId: widget.orderId, recipientType: widget.recipientType),

          // Messages
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              itemCount: _localMessages.length,
              itemBuilder: (ctx, i) => _MessageBubble(
                message: _localMessages[i],
                recipientName: widget.recipientName,
                isShipper: true,
              ),
            ),
          ),

          // Quick replies
          SizedBox(
            height: 44,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: _shipperQuickReplies.length,
              itemBuilder: (ctx, i) => GestureDetector(
                onTap: () => _sendMessage(_shipperQuickReplies[i]),
                child: Container(
                  margin: const EdgeInsets.only(right: 8, bottom: 6),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceAltLight,
                    borderRadius: const BorderRadius.all(AppRadius.full),
                    border: Border.all(color: AppColors.dividerLight),
                  ),
                  child: Text(
                    _shipperQuickReplies[i],
                    style: const TextStyle(
                      fontSize: AppFontSize.sm,
                      color: AppColors.textPrimaryLight,
                    ),
                  ),
                ),
              ),
            ),
          ),

          // Input bar
          _InputBar(
            controller: _messageController,
            isSending: _isSending,
            onSend: _sendMessage,
          ),
        ],
      ),
    );
  }

  void _initiateCall(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(AppRadius.lg),
        ),
        title: Text('Gọi ${widget.recipientType == 'customer' ? 'khách hàng' : 'nhà hàng'}'),
        content: const Text(
          'Cuộc gọi sẽ được thực hiện qua số proxy. Số thật của cả hai bên được bảo mật.',
          style: TextStyle(color: AppColors.textSecondaryLight),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Đang kết nối... 📞')),
              );
            },
            icon: const Icon(Iconsax.call, size: 16),
            label: const Text('Gọi ngay'),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Widgets
// ---------------------------------------------------------------------------

class _OrderBanner extends StatelessWidget {
  final String orderId;
  final String recipientType;

  const _OrderBanner({required this.orderId, required this.recipientType});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      color: AppColors.primary.withValues(alpha: 0.07),
      child: Row(
        children: [
          const Icon(Iconsax.receipt_item, size: 15, color: AppColors.primary),
          const SizedBox(width: 8),
          Text(
            'Đơn #$orderId',
            style: const TextStyle(
              color: AppColors.primary,
              fontSize: AppFontSize.sm,
              fontWeight: AppFontWeight.semiBold,
            ),
          ),
          const Spacer(),
          const Icon(Iconsax.shield_tick, size: 13, color: AppColors.textSecondaryLight),
          const SizedBox(width: 4),
          const Text(
            'Số thật được ẩn',
            style: TextStyle(fontSize: AppFontSize.xs, color: AppColors.textSecondaryLight),
          ),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final Map<String, dynamic> message;
  final String recipientName;
  final bool isShipper;

  const _MessageBubble({
    required this.message,
    required this.recipientName,
    required this.isShipper,
  });

  @override
  Widget build(BuildContext context) {
    final isMe = message['from'] == 'me';
    final text = message['text'] as String? ?? '';
    final time = message['time'] as String? ?? '';

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe) ...[
            CircleAvatar(
              radius: 14,
              backgroundColor: AppColors.primary.withValues(alpha: 0.12),
              child: const Icon(Iconsax.user, size: 14, color: AppColors.primary),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Column(
              crossAxisAlignment:
                  isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: isMe ? AppColors.primary : Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(16),
                      topRight: const Radius.circular(16),
                      bottomLeft: Radius.circular(isMe ? 16 : 4),
                      bottomRight: Radius.circular(isMe ? 4 : 16),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.06),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Text(
                    text,
                    style: TextStyle(
                      color: isMe ? Colors.white : AppColors.textPrimaryLight,
                      fontSize: AppFontSize.base,
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  time,
                  style: const TextStyle(
                    fontSize: AppFontSize.xs,
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

class _InputBar extends StatelessWidget {
  final TextEditingController controller;
  final bool isSending;
  final void Function(String) onSend;

  const _InputBar({
    required this.controller,
    required this.isSending,
    required this.onSend,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        left: 12,
        right: 8,
        top: 10,
        bottom: MediaQuery.viewInsetsOf(context).bottom + 10,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: AppColors.surfaceAltLight,
                borderRadius: const BorderRadius.all(AppRadius.full),
              ),
              child: TextField(
                controller: controller,
                decoration: const InputDecoration(
                  hintText: 'Nhập tin nhắn...',
                  border: InputBorder.none,
                  hintStyle:
                      TextStyle(color: AppColors.textSecondaryLight),
                ),
                textCapitalization: TextCapitalization.sentences,
                onSubmitted: onSend,
              ),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: () => onSend(controller.text),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 44,
              height: 44,
              decoration: const BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
              ),
              child: isSending
                  ? const Center(
                      child: SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      ),
                    )
                  : const Icon(Iconsax.send_1, color: Colors.white, size: 20),
            ),
          ),
        ],
      ),
    );
  }
}
